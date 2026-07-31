import pool from './db.js'
import bcrypt from 'bcryptjs'
import { encrypt, decrypt } from './cryptoHelper.js'

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

  // 1. Authenticate against database table super_admins
  const authHeader = req.headers.authorization || ''
  let token = authHeader.replace(/^Bearer\s+/i, '').trim() || req.query.token

  let isAuthorized = false

  if (token) {
    let email = req.headers['x-admin-email'] || req.query.email || ''
    if (token.includes(':')) {
      const parts = token.split(':')
      email = parts[0]
      token = parts[1]
    }

    if (email && token) {
      try {
        const adminRes = await pool.query(
          'SELECT email, password_hash FROM super_admins WHERE LOWER(email) = LOWER($1);',
          [email],
        )
        if (adminRes.rows.length > 0) {
          const hash = adminRes.rows[0].password_hash
          const match = await bcrypt.compare(token, hash)
          if (match) {
            isAuthorized = true
          }
        }
      } catch (e) {
        console.error('Super Admin DB check error:', e)
      }
    }
  }

  if (!isAuthorized) {
    return res.status(401).json({ error: 'unauthorized_super_admin' })
  }

  try {
    if (req.method === 'GET') {
      // Auto-repair visitor password if accidentally set to 'ThisIsLove' or empty
      await pool.query(
        "UPDATE sites SET visitor_password = admin_password WHERE visitor_password = 'ThisIsLove' OR visitor_password IS NULL OR visitor_password = '';",
      ).catch(() => {})

      const dbRes = await pool.query(
        'SELECT slug, visitor_password, admin_password, created_at, updated_at FROM sites ORDER BY created_at DESC;',
      )

      const decryptedSites = dbRes.rows.map(row => ({
        slug: row.slug,
        site_password: decrypt(row.visitor_password),
        admin_password: decrypt(row.admin_password),
        created_at: row.created_at,
        updated_at: row.updated_at
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

      // Check if already exists
      const checkRes = await pool.query(
        'SELECT slug FROM sites WHERE slug = $1;',
        [cleanSlug],
      )

      if (checkRes.rows.length > 0) {
        return res.status(409).json({ error: 'slug_already_exists' })
      }

      const cleanVisitorPass = String(sitePassword).trim().replace(/[\u0600-\u06FF\s]/g, '')
      const cleanAdminPass = String(adminPassword).trim().replace(/[\u0600-\u06FF\s]/g, '')

      const encryptedVisitorPass = encrypt(cleanVisitorPass)
      const encryptedAdminPass = encrypt(cleanAdminPass)

      const insertRes = await pool.query(
        `INSERT INTO sites (slug, site_name, visitor_password, admin_password)
         VALUES ($1, $2, $3, $4)
         RETURNING slug, visitor_password, admin_password, created_at;`,
        [cleanSlug, cleanSlug, encryptedVisitorPass, encryptedAdminPass],
      )

      return res.status(201).json({
        success: true,
        site: {
          slug: insertRes.rows[0].slug,
          site_password: decrypt(insertRes.rows[0].visitor_password),
          admin_password: decrypt(insertRes.rows[0].admin_password),
          created_at: insertRes.rows[0].created_at
        },
      })
    }

    if (req.method === 'DELETE') {
      const { slug } = req.query || req.body || {}
      if (!slug) {
        return res.status(400).json({ error: 'slug_required' })
      }

      await pool.query('DELETE FROM sites WHERE slug = $1;', [slug])
      return res.status(200).json({ success: true, deletedSlug: slug })
    }

    return res.status(405).json({ error: 'method_not_allowed' })
  } catch (err) {
    console.error('API /super-admin error:', err)
    return res.status(500).json({ error: err.message })
  }
}
