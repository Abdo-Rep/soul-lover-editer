import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { fetchCompleteSite, saveRelationalContent } from './modelHelper.js'
import { encrypt, decrypt } from './cryptoHelper.js'
import { query } from './db.js'

const JWT_SECRET = process.env.JWT_SECRET || 'soulove-jwt-secret-key-2026'
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
  // Enable CORS and disable HTTP response caching
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Email, x-admin-email')
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { slug } = req.query

  if (!slug) {
    return res.status(400).json({ error: 'slug_required' })
  }

  try {
    // GET: Return site content with accurate passwords for Dashboard and Site
    if (req.method === 'GET') {
      const result = await fetchCompleteSite(null, slug)
      if (!result) {
      return res.status(404).json({ error: 'site_not_found' })
      }

      const { row, content } = result
      if (row.is_active === false) {
        return res.status(404).json({ error: 'site_not_found' })
      }
      
      let sitePass = decrypt(row.visitor_password).trim()
      let adminPass = decrypt(row.admin_password).trim()

      if (sitePass === 'ThisIsLove' || !sitePass) {
        sitePass = adminPass || 'soulove'
        fetch(`${SUPABASE_URL}/rest/v1/sites?id=eq.${row.id}`, {
          method: 'PATCH',
          headers: restHeaders,
          body: JSON.stringify({ visitor_password: encrypt(sitePass) })
        }).catch(() => {})
      }
      if (!adminPass) {
        adminPass = sitePass || 'soulove'
      }

      content.password = sitePass
      content.adminPassword = adminPass

      return res.status(200).json({
        slug: row.slug,
        data: content,
        updatedAt: row.updated_at,
        isActive: row.is_active !== false,
        language: row.language || 'ar',
      })
    }

    // POST: Server-side password verification for Visitor & Admin Login
    if (req.method === 'POST') {
      const { password, action = 'verify_visitor' } = req.body || {}

      if (!password) {
        return res.status(400).json({ error: 'password_required' })
      }

      const dbRes = await query(
        'SELECT visitor_password, admin_password, is_active FROM sites WHERE slug = $1 LIMIT 1;',
        [slug]
      )
      const rows = dbRes.rows

      if (rows.length === 0) {
        return res.status(404).json({ error: 'site_not_found' })
      }

      const row = rows[0]
      if (row.is_active === false) {
        return res.status(404).json({ error: 'site_not_found' })
      }
      const vDecrypted = decrypt(row.visitor_password).trim()
      const aDecrypted = decrypt(row.admin_password).trim()

      if (action === 'verify_admin') {
        const expectedAdminPass = (aDecrypted || vDecrypted || '').trim()
        const aMatch = expectedAdminPass.startsWith('$2')
          ? await bcrypt.compare(String(password).trim(), expectedAdminPass)
          : String(password).trim() === expectedAdminPass

        if (!aMatch) {
          return res.status(401).json({ error: 'invalid_password', success: false })
        }

        const token = jwt.sign(
          { slug, role: 'admin' },
          JWT_SECRET,
          { expiresIn: '7d' },
        )

        return res.status(200).json({ success: true, role: 'admin', token })
      }

      const expectedSitePass = (vDecrypted || 'soulove').trim()
      const vMatch = expectedSitePass.startsWith('$2')
        ? await bcrypt.compare(String(password).trim(), expectedSitePass)
        : String(password).trim() === expectedSitePass

      if (!vMatch) {
        return res.status(401).json({ error: 'invalid_password', success: false })
      }
      return res.status(200).json({ success: true, role: 'visitor' })
    }

    // PUT: Update site content
    if (req.method === 'PUT') {
      const { password, token, content } = req.body || {}

      if (!content) {
        return res.status(400).json({ error: 'content_required' })
      }

      // Enforce Zero Base64 Policy safely by sanitizing any leftover base64 strings & Payload Size Limit (<150KB)
      let cleanContent = content
      let contentString = JSON.stringify(content)

      if (contentString.includes('data:image/') || contentString.includes('data:audio/') || contentString.includes('base64,')) {
        try {
          cleanContent = JSON.parse(
            contentString.replace(/"data:(image|audio)\/[^"]+;base64,[^"]+"/g, '""')
          )
          contentString = JSON.stringify(cleanContent)
        } catch {
          // Fallback
        }
      }

      if (contentString.length > 150000) {
        return res.status(400).json({ error: 'payload_too_large', message: 'حجم طلب الحفظ يتجاوز الحد المسموح به.' })
      }

      const r = await fetch(`${SUPABASE_URL}/rest/v1/sites?slug=eq.${encodeURIComponent(slug)}&select=visitor_password,admin_password,is_active`, { headers: restHeaders, signal: AbortSignal.timeout(5000) })
      if (!r.ok) return res.status(444).json({ error: 'site_not_found' })
      const rows = await r.json()

      if (!Array.isArray(rows) || rows.length === 0) {
        return res.status(444).json({ error: 'site_not_found' })
      }

      const row = rows[0]
      if (row.is_active === false) {
        return res.status(404).json({ error: 'site_not_found' })
      }
      const vDecrypted = decrypt(row.visitor_password).trim()
      const aDecrypted = decrypt(row.admin_password).trim()

      let isAuthenticated = false

      if (token) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET)
          if (decoded && decoded.slug === slug) {
            isAuthenticated = true
          }
        } catch (e) {
          // Token invalid or expired
        }
      }

      if (!isAuthenticated) {
        const currentAdminPass = (aDecrypted || vDecrypted || '').trim()
        if (currentAdminPass) {
          const aMatch = currentAdminPass.startsWith('$2')
            ? await bcrypt.compare(String(password || '').trim(), currentAdminPass)
            : String(password || '').trim() === currentAdminPass
          if (aMatch) {
            isAuthenticated = true
          }
        }
      }

      if (!isAuthenticated) {
        return res.status(401).json({ error: 'invalid_password' })
      }

      let newSitePass = (cleanContent.password && typeof cleanContent.password === 'string' && cleanContent.password.trim() && cleanContent.password.trim() !== 'ThisIsLove')
        ? cleanContent.password.trim()
        : (vDecrypted !== 'ThisIsLove' ? vDecrypted : '')

      let newAdminPass = (cleanContent.adminPassword && typeof cleanContent.adminPassword === 'string' && cleanContent.adminPassword.trim())
        ? cleanContent.adminPassword.trim()
        : aDecrypted

      if (!newSitePass) newSitePass = newAdminPass || 'soulove'
      if (!newAdminPass) newAdminPass = newSitePass || 'soulove'

      cleanContent.password = newSitePass
      cleanContent.adminPassword = newAdminPass

      const result = await saveRelationalContent(null, slug, cleanContent)

      return res.status(200).json({
        success: true,
        data: result.content,
        updatedAt: result.row.updated_at,
      })
    }

    return res.status(405).json({ error: 'method_not_allowed' })
  } catch (err) {
    console.error('API /sites error:', err)
    return res.status(500).json({ error: 'حدث خطأ داخلي، حاول مرة أخرى' })
  }
}
