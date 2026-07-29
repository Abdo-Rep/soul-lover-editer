import pool from './db.js'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'soulove-jwt-secret-key-2026'

function deepMerge(target, source) {
  if (!source || typeof source !== 'object') return target
  if (!target || typeof target !== 'object') return source

  const output = { ...target }

  for (const key of Object.keys(source)) {
    const sourceVal = source[key]
    const targetVal = target[key]

    if (sourceVal === undefined) continue

    if (Array.isArray(sourceVal)) {
      output[key] = sourceVal
    } else if (sourceVal && typeof sourceVal === 'object' && !Array.isArray(sourceVal)) {
      output[key] = deepMerge(targetVal || {}, sourceVal)
    } else {
      output[key] = sourceVal
    }
  }
  return output
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
      const dbRes = await pool.query(
        'SELECT slug, site_password, admin_password, data, updated_at FROM public.user_sites WHERE slug = $1;',
        [slug],
      )

      if (dbRes.rows.length === 0) {
        return res.status(444).json({ error: 'site_not_found' })
      }

      const row = dbRes.rows[0]
      let sitePass = (row.site_password || '').trim()
      let adminPass = (row.admin_password || '').trim()

      // Auto-repair any site whose visitor password was accidentally set to 'ThisIsLove'
      if (sitePass === 'ThisIsLove' || !sitePass) {
        sitePass = adminPass || 'soulove'
        await pool.query(
          'UPDATE public.user_sites SET site_password = $1 WHERE slug = $2;',
          [sitePass, slug],
        ).catch(() => {})
      }
      if (!adminPass) {
        adminPass = sitePass || 'soulove'
      }

      const safeData = {
        ...row.data,
        password: sitePass,
        adminPassword: adminPass,
      }

      return res.status(200).json({
        slug: row.slug,
        data: safeData,
        updatedAt: row.updated_at,
      })
    }

    // POST: Server-side password verification for Visitor & Admin Login (Returns JWT token for admin)
    if (req.method === 'POST') {
      const { password, action = 'verify_visitor' } = req.body || {}

      if (!password) {
        return res.status(400).json({ error: 'password_required' })
      }

      const dbRes = await pool.query(
        'SELECT site_password, admin_password FROM public.user_sites WHERE slug = $1;',
        [slug],
      )

      if (dbRes.rows.length === 0) {
        return res.status(444).json({ error: 'site_not_found' })
      }

      const row = dbRes.rows[0]

      if (action === 'verify_admin') {
        const expectedAdminPass = (row.admin_password || row.site_password || '').trim()
        if (String(password).trim() !== expectedAdminPass) {
          return res.status(401).json({ error: 'invalid_password', success: false })
        }

        // Generate JWT token for admin session
        const token = jwt.sign(
          { slug, role: 'admin' },
          JWT_SECRET,
          { expiresIn: '7d' },
        )

        return res.status(200).json({ success: true, role: 'admin', token })
      }

      // Default: verify visitor password
      const expectedSitePass = (row.site_password || 'soulove').trim()
      if (String(password).trim() !== expectedSitePass) {
        return res.status(401).json({ error: 'invalid_password', success: false })
      }
      return res.status(200).json({ success: true, role: 'visitor' })
    }

    // PUT: Update site content (Requires Server-Side Admin Password or JWT Check)
    if (req.method === 'PUT') {
      const { password, token, content } = req.body || {}

      if (!content) {
        return res.status(400).json({ error: 'content_required' })
      }

      // Check current password or JWT token against database
      const dbRes = await pool.query(
        'SELECT admin_password, site_password, data FROM public.user_sites WHERE slug = $1;',
        [slug],
      )

      if (dbRes.rows.length === 0) {
        return res.status(444).json({ error: 'site_not_found' })
      }

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
        const currentAdminPass = (dbRes.rows[0].admin_password || dbRes.rows[0].site_password || '').trim()
        if (currentAdminPass && String(password || '').trim() === currentAdminPass) {
          isAuthenticated = true
        }
      }

      if (!isAuthenticated) {
        return res.status(401).json({ error: 'invalid_password' })
      }

      let newSitePass = (content.password && typeof content.password === 'string' && content.password.trim() && content.password.trim() !== 'ThisIsLove')
        ? content.password.trim()
        : (dbRes.rows[0].site_password !== 'ThisIsLove' ? dbRes.rows[0].site_password : '')

      let newAdminPass = (content.adminPassword && typeof content.adminPassword === 'string' && content.adminPassword.trim())
        ? content.adminPassword.trim()
        : dbRes.rows[0].admin_password

      if (!newSitePass) newSitePass = newAdminPass || 'soulove'
      if (!newAdminPass) newAdminPass = newSitePass || 'soulove'

      // Clean passwords before saving inside data JSONB
      const cleanContent = { ...content }
      delete cleanContent.password
      delete cleanContent.adminPassword

      // Deep merge existing database content with incoming lightweight changes
      const existingData = dbRes.rows[0].data || {}
      const mergedData = deepMerge(existingData, cleanContent)

      const updateRes = await pool.query(
        `UPDATE public.user_sites 
         SET data = $1, site_password = $2, admin_password = $3, updated_at = now() 
         WHERE slug = $4 
         RETURNING data, updated_at;`,
        [JSON.stringify(mergedData), newSitePass, newAdminPass, slug],
      )

      const returnData = {
        ...updateRes.rows[0].data,
        password: newSitePass,
        adminPassword: newAdminPass,
      }

      return res.status(200).json({
        success: true,
        data: returnData,
        updatedAt: updateRes.rows[0].updated_at,
      })
    }

    return res.status(405).json({ error: 'method_not_allowed' })
  } catch (err) {
    console.error('API /sites error:', err)
    return res.status(500).json({ error: err.message })
  }
}
