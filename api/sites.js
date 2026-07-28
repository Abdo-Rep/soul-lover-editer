import pool from './db.js'

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { slug } = req.query

  if (!slug) {
    return res.status(400).json({ error: 'slug_required' })
  }

  try {
    // GET: Return public site content ONLY (Never expose passwords in public GET response!)
    if (req.method === 'GET') {
      const dbRes = await pool.query(
        'SELECT slug, data, updated_at FROM public.user_sites WHERE slug = $1;',
        [slug],
      )

      if (dbRes.rows.length === 0) {
        return res.status(444).json({ error: 'site_not_found' })
      }

      const row = dbRes.rows[0]
      // Strip any internal password fields from public data object
      const safeData = { ...row.data }
      delete safeData.password
      delete safeData.adminPassword

      return res.status(200).json({
        slug: row.slug,
        data: safeData,
        updatedAt: row.updated_at,
      })
    }

    // POST: Server-side password verification for Visitor & Admin Login
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
        const expectedAdminPass = row.admin_password || row.site_password
        if (password !== expectedAdminPass) {
          return res.status(401).json({ error: 'invalid_password', success: false })
        }
        return res.status(200).json({ success: true, role: 'admin' })
      }

      // Default: verify visitor password
      const expectedSitePass = row.site_password || 'soulove'
      if (password !== expectedSitePass) {
        return res.status(401).json({ error: 'invalid_password', success: false })
      }
      return res.status(200).json({ success: true, role: 'visitor' })
    }

    // PUT: Update site content (Requires Server-Side Admin Password Check)
    if (req.method === 'PUT') {
      const { password, content } = req.body || {}

      if (!content) {
        return res.status(400).json({ error: 'content_required' })
      }

      // Check current password against database
      const dbRes = await pool.query(
        'SELECT admin_password, site_password FROM public.user_sites WHERE slug = $1;',
        [slug],
      )

      if (dbRes.rows.length === 0) {
        return res.status(444).json({ error: 'site_not_found' })
      }

      const currentAdminPass = dbRes.rows[0].admin_password || dbRes.rows[0].site_password

      if (currentAdminPass && password !== currentAdminPass) {
        return res.status(401).json({ error: 'invalid_password' })
      }

      const newSitePass = content.password || dbRes.rows[0].site_password || 'soulove'
      const newAdminPass = content.adminPassword || dbRes.rows[0].admin_password || 'soulove'

      // Strip passwords before saving inside data JSONB
      const cleanContent = { ...content }
      delete cleanContent.password
      delete cleanContent.adminPassword

      const updateRes = await pool.query(
        `UPDATE public.user_sites 
         SET data = $1, site_password = $2, admin_password = $3, updated_at = now() 
         WHERE slug = $4 
         RETURNING data, updated_at;`,
        [JSON.stringify(cleanContent), newSitePass, newAdminPass, slug],
      )

      return res.status(200).json({
        success: true,
        data: updateRes.rows[0].data,
        updatedAt: updateRes.rows[0].updated_at,
      })
    }

    return res.status(405).json({ error: 'method_not_allowed' })
  } catch (err) {
    console.error('API /sites error:', err)
    return res.status(500).json({ error: err.message })
  }
}
