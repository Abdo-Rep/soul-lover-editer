import pool from './db.js'
import bcrypt from 'bcryptjs'

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
      // Auto-repair any sites where site_password was accidentally saved as 'ThisIsLove'
      await pool.query(
        "UPDATE user_sites SET site_password = admin_password WHERE site_password = 'ThisIsLove' OR site_password IS NULL OR site_password = '';",
      ).catch(() => {})

      const dbRes = await pool.query(
        'SELECT slug, site_password, admin_password, created_at, updated_at FROM user_sites ORDER BY created_at DESC;',
      )
      return res.status(200).json({ sites: dbRes.rows })
    }

    if (req.method === 'POST') {
      const { slug, sitePassword = 'soulove', adminPassword = 'soulove', initialData } = req.body || {}

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
        'SELECT slug FROM user_sites WHERE slug = $1;',
        [cleanSlug],
      )

      if (checkRes.rows.length > 0) {
        return res.status(409).json({ error: 'slug_already_exists' })
      }

      const defaultData = initialData || {
        siteName: cleanSlug,
        password: sitePassword || 'soulove',
        adminPassword: adminPassword || 'soulove',
        appearance: {
          mode: 'light',
          primaryColor: '#ff8ccd',
          backgroundHeartColor: '#be123c',
          heartOpacity: 0.85,
          backgroundHeart: '🩷',
          pushHeart: '🌸',
        },
        login: {
          eyebrow: '',
          title: '🩷 My Everything',
          subtitle: '',
          passwordLabel: 'Enter the secret word',
          placeholder: 'Password',
          button: '💖 unlock 💖',
          error: '😡 Enter the right password',
          footer: '🌸',
        },
        welcome: {
          eyebrow: '🩷',
          title: '🌚 My soul',
          subtitle: 'كل اللي هنا نبذه صغنتته عن حبي ليكي يكتكوتي 🌚🩷',
          nextButton: 'NEXT',
        },
        story: {
          eyebrow: '🌸',
          title: 'Our Story',
          firstMeeting: {
            label: 'اول يوم شفتك فيه',
            description: 'مكنتش عارف ان اليوم دا هيبقي اهم يوم في حياتي... بس قلبي كان عارف',
          },
          loveConfession: {
            label: 'اليوم اللي قولتلك فيه بحبك',
            message: 'كلمه قولتهالك وحسيت ان الدنيا اتغيرت... من يومها وانتي معايا في كل حاجه',
          },
          memoriesButton: 'NEXT',
        },
        dates: {
          relationshipStart: '',
          firstMeeting: '2023-01-03',
          loveConfession: '2023-01-23',
        },
        music: {
          title: 'أغنيتنا 🩷',
          src: '',
          fileName: '',
          volume: 0.35,
          tracks: [],
        },
        gallery: { eyebrow: '🌹', title: 'Our memories' },
        final: {
          eyebrow: '',
          title: '🌸 For you',
          text: 'عملتلك المكان ده عشان يحفظ أجمل لحظاتنا وصورنا وكلامنا 🫂🩷🩷',
        },
        memories: [],
        galleryItems: [],
        wishlist: [],
      }

      const insertRes = await pool.query(
        `INSERT INTO user_sites (slug, site_password, admin_password, data)
         VALUES ($1, $2, $3, $4)
         RETURNING slug, site_password, admin_password, created_at;`,
        [cleanSlug, sitePassword || 'soulove', adminPassword || 'soulove', JSON.stringify(defaultData)],
      )

      return res.status(201).json({
        success: true,
        site: insertRes.rows[0],
      })
    }

    if (req.method === 'DELETE') {
      const { slug } = req.query || req.body || {}
      if (!slug) {
        return res.status(400).json({ error: 'slug_required' })
      }

      await pool.query('DELETE FROM user_sites WHERE slug = $1;', [slug])
      return res.status(200).json({ success: true, deletedSlug: slug })
    }

    return res.status(405).json({ error: 'method_not_allowed' })
  } catch (err) {
    console.error('API /super-admin error:', err)
    return res.status(500).json({ error: err.message })
  }
}
