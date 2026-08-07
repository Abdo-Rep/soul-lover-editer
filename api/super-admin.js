import bcrypt from 'bcryptjs'
import { encrypt, decrypt } from './cryptoHelper.js'

import { query } from './db.js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://31.220.93.65:9000'
const SECRET_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const JWT_TOKEN = process.env.SERVICE_ROLE_JWT || ''

const restHeaders = {
  'apikey': SECRET_KEY,
  'Authorization': `Bearer ${JWT_TOKEN}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
}

function getDefaultFields(language) {
  if (language === 'en') {
    return {
      login_eyebrow: 'A gift from my heart',
      login_title: 'Welcome my love',
      login_subtitle: 'Behind this door is a small world I built for you alone — our memories, our story, and every heartbeat of love in my heart.',
      login_placeholder: 'Secret password',
      login_password_label: 'Password',
      login_button: 'Open my heart',
      login_error: 'Incorrect password, try again my beautiful.',
      login_footer: 'Made with love, for you alone',
      
      welcome_eyebrow: 'You finally arrived',
      welcome_title: 'Welcome, the most beautiful love in my life',
      welcome_subtitle: 'Everything waiting for you here was written and prepared with you in mind — a gentle journey through our story, our time, and the love we live together.',
      
      story_eyebrow: 'A Love Story',
      story_title: 'Our Story',
      story_first_meeting_label: 'The first day we met',
      story_first_meeting_description: 'I did not know it yet, but my heart was already finding its way to you.',
      story_love_confession_label: 'The day I said "I love you"',
      story_love_confession_message: 'Three small words — and suddenly the world became warmer, softer, and infinitely more beautiful.',
      
      gallery_eyebrow: 'Our Album',
      gallery_title: 'Memories',
      
      final_eyebrow: 'A final letter',
      final_title: 'Forever and always',
      final_text: 'Wherever life takes us, my heart will always find its way back to you. You are my dream that I want to live every day, and my pulse that I miss every moment. Thank you for being you.'
    }
  } else if (language === 'es') {
    return {
      login_eyebrow: 'Un regalo de mi corazón',
      login_title: 'Bienvenida mi amor',
      login_subtitle: 'Detrás de esta puerta hay un pequeño mundo que construí para ti sola: nuestros recuerdos, nuestra historia y cada latido de amor en mi corazón.',
      login_placeholder: 'Contraseña secreta',
      login_password_label: 'Contraseña',
      login_button: 'Abre mi corazón',
      login_error: 'Contraseña incorrecta, inténtalo de nuevo mi bella.',
      login_footer: 'Hecho con amor, solo para ti',
      
      welcome_eyebrow: 'Finalmente llegaste',
      welcome_title: 'Bienvenida, el amor más bello de mi vida',
      welcome_subtitle: 'Todo lo que te espera aquí fue escrito y preparado pensando en ti: un viaje suave a través de nuestra historia, nuestro tiempo y el amor que vivimos juntos.',
      
      story_eyebrow: 'Una historia de amor',
      story_title: 'Nuestra Historia',
      story_first_meeting_label: 'El primer día que nos conocimos',
      story_first_meeting_description: 'Aún no lo sabía, pero mi corazón ya estaba encontrando su camino hacia ti.',
      story_love_confession_label: 'El día que dije "Te amo"',
      story_love_confession_message: 'Tres pequeñas palabras, y de repente el mundo se volvió más cálido, más suave e infinitamente más hermoso.',
      
      gallery_eyebrow: 'Nuestro Álbum',
      gallery_title: 'Recuerdos',
      
      final_eyebrow: 'Una carta final',
      final_title: 'Por siempre y para siempre',
      final_text: 'Dondequiera que nos lleve la vida, mi corazón siempre encontrará el camino de regreso a ti. Eres mi sueño que quiero vivir todos los días, y mi pulso que extraño a cada momento. Gracias por ser tú.'
    }
  } else if (language === 'en-GB') {
    return {
      login_eyebrow: 'A gift from my heart',
      login_title: 'Welcome my love',
      login_subtitle: 'Behind this door is a small world I built for you alone — our memories, our story, and every heartbeat of love in my heart.',
      login_placeholder: 'Secret password',
      login_password_label: 'Password',
      login_button: 'Open my heart',
      login_error: 'Incorrect password, try again my beautiful.',
      login_footer: 'Made with love, for you alone',
      
      welcome_eyebrow: 'You finally arrived',
      welcome_title: 'Welcome, the most beautiful love in my life',
      welcome_subtitle: 'Everything waiting for you here was written and prepared with you in mind — a gentle journey through our story, our time, and the love we live together.',
      
      story_eyebrow: 'A Love Story',
      story_title: 'Our Story',
      story_first_meeting_label: 'The first day we met',
      story_first_meeting_description: 'I did not know it yet, but my heart was already finding its way to you.',
      story_love_confession_label: 'The day I said "I love you"',
      story_love_confession_message: 'Three small words — and suddenly the world became warmer, softer, and infinitely more beautiful.',
      
      gallery_eyebrow: 'Our Album',
      gallery_title: 'Memories',
      
      final_eyebrow: 'A final letter',
      final_title: 'Forever and always',
      final_text: 'Wherever life takes us, my heart will always find its way back to you. You are my dream that I want to live every day, and my pulse that I miss every moment. Thank you for being you.'
    }
  }

  // Default is Arabic (ar)
  return {
    login_eyebrow: 'هدية من قلبي',
    login_title: 'أهلاً يا حبيبتي',
    login_subtitle: 'خلف هذا الباب عالم صغير صنعته لكِ وحدك — ذكرياتنا، قصتنا، وكل نبضة حب في قلبي.',
    login_placeholder: 'كلمة المرور السرية',
    login_password_label: 'كلمة المرور',
    login_button: 'افتحي قلبي',
    login_error: 'كلمة المرور غير صحيحة، حاولي مرة أخرى يا جميلتي.',
    login_footer: 'صُنع بحب، لكِ وحدك',
    
    welcome_eyebrow: 'وصلتِ إليه أخيراً',
    welcome_title: 'مرحباً يا أجمل حب في حياتي',
    welcome_subtitle: 'كل ما ينتظركِ هنا كُتب وأُعدّ بكِ في بالي — رحلة ناعمة عبر قصتنا، وقتنا، والحب الذي نعيشه معاً.',
    
    story_eyebrow: 'A Love Story',
    story_title: 'Our Story',
    story_first_meeting_label: 'أول يوم التقينا فيه',
    story_first_meeting_description: 'لم أكن أعلم بعد، لكن قلبي كان قد بدأ بالفعل يجد طريقه إليكِ.',
    story_love_confession_label: 'اليوم الذي قلت فيه "أحبك"',
    story_love_confession_message: 'ثلاث كلمات صغيرة — وفجأة أصبح العالم أدفأ، وأنعم، وأجمل بلا حدود.',
    
    gallery_eyebrow: 'Our Album',
    gallery_title: 'Memories',
    
    final_eyebrow: 'رسالة أخيرة',
    final_title: 'للأبد ودائماً',
    final_text: 'أينما ذهب بنا الحياة، سيجد قلبي دائماً طريقه العائد إليكِ. أنتِ حلمي الذي أريد أن أعيشه كل يوم، ونبضتي التي أشتاق إليها في كل لحظة. شكراً لأنكِ أنتِ.'
  }
}

export default async function handler(req, res) {
  // CORS and Cache Control
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
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
      let r = await fetch(
        `${SUPABASE_URL}/rest/v1/sites?select=slug,visitor_password,admin_password,created_at,updated_at,is_active,language&order=created_at.desc`,
        { headers: restHeaders }
      )

      if (!r.ok) {
        // Fallback fetch if is_active or language is not in PostgREST schema cache yet
        r = await fetch(
          `${SUPABASE_URL}/rest/v1/sites?select=slug,visitor_password,admin_password,created_at,updated_at&order=created_at.desc`,
          { headers: restHeaders }
        )
      }

      if (!r.ok) {
        const errText = await r.text().catch(() => '')
        return res.status(500).json({ error: `فشل جلب قائمة المواقع: ${r.status} - ${errText}` })
      }

      const rows = await r.json()

      const decryptedSites = rows.map((row) => ({
        slug: row.slug,
        site_password: decrypt(row.visitor_password),
        admin_password: decrypt(row.admin_password),
        created_at: row.created_at,
        updated_at: row.updated_at,
        is_active: row.is_active !== undefined ? row.is_active !== false : true,
        language: row.language || 'ar',
      }))

      return res.status(200).json({ sites: decryptedSites })
    }

    if (req.method === 'POST') {
      const { slug, sitePassword = 'soulove', adminPassword = 'soulove', language = 'ar' } = req.body || {}

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

      const defaultFields = getDefaultFields(language)
      let insertRes = await fetch(`${SUPABASE_URL}/rest/v1/sites`, {
        method: 'POST',
        headers: restHeaders,
        body: JSON.stringify({
          slug: cleanSlug,
          site_name: cleanSlug,
          visitor_password: encryptedVisitorPass,
          admin_password: encryptedAdminPass,
          language: language,
          is_active: true,
          ...defaultFields,
        }),
      })

      if (!insertRes.ok) {
        // Fallback insert without language and is_active if schema cache is missing them
        insertRes = await fetch(`${SUPABASE_URL}/rest/v1/sites`, {
          method: 'POST',
          headers: restHeaders,
          body: JSON.stringify({
            slug: cleanSlug,
            site_name: cleanSlug,
            visitor_password: encryptedVisitorPass,
            admin_password: encryptedAdminPass,
            ...defaultFields,
          }),
        })
      }

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
          is_active: newRow.is_active !== undefined ? newRow.is_active !== false : true,
          language: newRow.language || 'ar',
        },
      })
    }

    if (req.method === 'PUT') {
      const { slug, isActive, language } = req.body || {}
      if (!slug) {
        return res.status(400).json({ error: 'slug_required' })
      }

      const updateData = {}
      if (isActive !== undefined) updateData.is_active = Boolean(isActive)
      if (language !== undefined) updateData.language = String(language)

      const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/sites?slug=eq.${encodeURIComponent(slug)}`, {
        method: 'PATCH',
        headers: restHeaders,
        body: JSON.stringify(updateData),
      })

      return res.status(200).json({ success: true })
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
