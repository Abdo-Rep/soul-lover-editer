import pool from './db.js'

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { slug } = req.query

  if (!slug) {
    return res.status(400).json({ error: 'slug_required' })
  }

  try {
    if (req.method === 'GET') {
      const dbRes = await pool.query(
        'SELECT slug, site_password, admin_password, data, updated_at FROM public.user_sites WHERE slug = $1;',
        [slug],
      )

      if (dbRes.rows.length === 0) {
        return res.status(444).json({ error: 'site_not_found' })
      }

      const row = dbRes.rows[0]
      return res.status(200).json({
        slug: row.slug,
        password: row.site_password,
        adminPassword: row.admin_password,
        data: row.data,
        updatedAt: row.updated_at,
      })
    }

    if (req.method === 'PUT') {
      const { password, content } = req.body || {}

      if (!content) {
        return res.status(400).json({ error: 'content_required' })
      }

      // Check current password
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

      const newSitePass = content.password || 'soulove'
      const newAdminPass = content.adminPassword || ''

      const updateRes = await pool.query(
        `UPDATE public.user_sites 
         SET data = $1, site_password = $2, admin_password = $3, updated_at = now() 
         WHERE slug = $4 
         RETURNING data, updated_at;`,
        [JSON.stringify(content), newSitePass, newAdminPass, slug],
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
