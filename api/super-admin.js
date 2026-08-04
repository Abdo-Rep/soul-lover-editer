import bcrypt from 'bcryptjs'
import { encrypt, decrypt } from './cryptoHelper.js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://31.220.93.65:9000'
const SECRET_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const JWT_TOKEN = process.env.SERVICE_ROLE_JWT || ''

const restHeaders = {
  'apikey': SECRET_KEY,
  'Authorization': `Bearer ${JWT_TOKEN}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
}

export default async function handler(req, res) {
  // CORS and Cache Control
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Email, x-admin-email')
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // 1. Authenticate Super Admin against Supabase REST / super_admins table or primary credentials
  const authHeader = req.headers.authorization || ''
  let token = authHeader.replace(/^Bearer\s+/i, '').trim() || req.query.token
  let email = (req.headers['x-admin-email'] || req.headers['X-Admin-Email'] || req.query.email || '').trim()

  if (token && token.includes(':')) {
    const parts = token.split(':')
    email = parts[0]
    token = parts[1]
  }

  let isAuthorized = false

  if (email && token) {
    const cleanEmail = email.toLowerCase()
    // Direct check for primary admin credentials
    if ((cleanEmail === 'admin@saalove.com' || cleanEmail === 'admin@admin.com') && token === 'Mohammedosha1#') {
      isAuthorized = true
    } else {
      try {
        const r = await fetch(
          `${SUPABASE_URL}/rest/v1/super_admins?email=eq.${encodeURIComponent(cleanEmail)}`,
          { headers: restHeaders }
        )
        if (r.ok) {
          const rows = await r.json()
          if (Array.isArray(rows) && rows.length > 0) {
            const hash = rows[0].password_hash
            const match = await bcrypt.compare(token, hash)
            if (match) {
              isAuthorized = true
            }
          }
        }
      } catch (e) {
        console.error('Super Admin REST auth check error:', e)
      }
    }
  }

  if (!isAuthorized) {
    return res.status(401).json({ error: 'unauthorized_super_admin' })
  }

  try {
    if (req.method === 'GET') {
      const r = await fetch(
        `${SUPABASE_URL}/rest/v1/sites?select=slug,visitor_password,admin_password,created_at,updated_at&order=created_at.desc`,
        { headers: restHeaders }
      )

      if (!r.ok) {
        return res.status(500).json({ error: 'فشل جلب قائمة المواقع من الخادم' })
      }

      const rows = await r.json()

      const decryptedSites = rows.map((row) => ({
        slug: row.slug,
        site_password: decrypt(row.visitor_password),
        admin_password: decrypt(row.admin_password),
        created_at: row.created_at,
        updated_at: row.updated_at,
      }))

      return res.status(200).json({ sites: decryptedSites })
    }

    if (req.method === 'POST') {
      const { slug, sitePassword = 'soulove', adminPassword = 'soulove' } = req.body || {}

      if (!slug || !slug.trim()) {
        return res.status(400).json({ error: 'slug_required' })
      }

      const cleanSlug = slug
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')

      if (!cleanSlug) {
        return res.status(400).json({ error: 'invalid_slug_format' })
      }

      // Check if site already exists
      const checkRes = await fetch(
        `${SUPABASE_URL}/rest/v1/sites?slug=eq.${encodeURIComponent(cleanSlug)}&select=slug`,
        { headers: restHeaders }
      )
      if (checkRes.ok) {
        const checkRows = await checkRes.json()
        if (Array.isArray(checkRows) && checkRows.length > 0) {
          return res.status(409).json({ error: 'slug_already_exists' })
        }
      }

      const cleanVisitorPass = String(sitePassword).trim().replace(/[\u0600-\u06FF\s]/g, '')
      const cleanAdminPass = String(adminPassword).trim().replace(/[\u0600-\u06FF\s]/g, '')

      const encryptedVisitorPass = encrypt(cleanVisitorPass)
      const encryptedAdminPass = encrypt(cleanAdminPass)

      const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/sites`, {
        method: 'POST',
        headers: restHeaders,
        body: JSON.stringify({
          slug: cleanSlug,
          site_name: cleanSlug,
          visitor_password: encryptedVisitorPass,
          admin_password: encryptedAdminPass,
        }),
      })

      if (!insertRes.ok) {
        const errText = await insertRes.text().catch(() => '')
        throw new Error(`فشل إنشاء الموقع: ${errText}`)
      }

      const inserted = await insertRes.json()
      const newRow = Array.isArray(inserted) ? inserted[0] : inserted

      return res.status(201).json({
        success: true,
        site: {
          slug: newRow.slug,
          site_password: decrypt(newRow.visitor_password),
          admin_password: decrypt(newRow.admin_password),
          created_at: newRow.created_at,
        },
      })
    }

    if (req.method === 'DELETE') {
      const { slug } = req.query || req.body || {}
      if (!slug) {
        return res.status(400).json({ error: 'slug_required' })
      }

      await fetch(`${SUPABASE_URL}/rest/v1/sites?slug=eq.${encodeURIComponent(slug)}`, {
        method: 'DELETE',
        headers: restHeaders,
      })

      return res.status(200).json({ success: true, deletedSlug: slug })
    }

    return res.status(405).json({ error: 'method_not_allowed' })
  } catch (err) {
    console.error('API /super-admin error:', err)
    return res.status(500).json({ error: err.message })
  }
}
