import dotenv from 'dotenv'
dotenv.config()

import bcrypt from 'bcryptjs'
import { encrypt, decrypt } from './cryptoHelper.js'
import { fetchWithResilience, sanitizeDatabaseError } from './fetchHelper.js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || ''
const SECRET_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const JWT_TOKEN = process.env.SERVICE_ROLE_JWT || ''

const restHeaders = {
  'apikey': SECRET_KEY,
  'Authorization': `Bearer ${JWT_TOKEN || SECRET_KEY}`,
  'Content-Type': 'application/json',
  'Accept-Profile': 'romantic-old-version',
  'Content-Profile': 'romantic-old-version',
  'Prefer': 'resolution=merge-duplicates,return=representation'
}

function getDefaultFields() {
  // Pure Arabic master template (soulove)
  return {
    primary_color: '#ef4444',
    background_heart_color: '#be123c',
    heart_opacity: 0.8,
    background_heart_char: '♥',
    push_heart_char: '♥',
    date_first_meeting: '2025-01-08',
    date_love_confession: '2025-03-02',
    music_file_name: 'تامر_عاشور_-_خليني_في_حضنك___بدون_موسيقى__(128k).m4a',
    music_title: 'اغنيتنا ♥',
    music_src: JSON.stringify({
      mainSrc: '/api/media?path=soulove%2Fmusic%2Fmusic-1787616306798.m4a',
      tracks: [
        {
          id: 'track-1',
          title: 'اغنيتنا ♥',
          fileName: 'تامر_عاشور_-_خليني_في_حضنك___بدون_موسيقى__(128k).m4a',
          src: '/api/media?path=soulove%2Fmusic%2Fmusic-1787616306798.m4a',
          localUrl: '',
          sizeBytes: 1963391,
        },
      ],
      countdowns: [
        {
          id: 3,
          title: 'فرحنا',
          date: '2027-01-28',
          time: '08:00',
          description: 'كل ثانية بتمر بتقربنا أكتر للمناسبة الحلوة دي 💖',
        },
      ],
      appearanceMode: 'light',
      extraButtons: {
        welcomeNextButton: '',
        storyMemoriesButton: '',
        galleryFinalButton: '',
        countdownsNextButton: '',
      },
    }),
    music_volume: 0.35,

    login_eyebrow: '♥',
    login_title: 'روح قلبي 😍',
    login_subtitle: 'هديه صغنتوته وعسوله زيك كدا يروحي 🥰♥',
    login_placeholder: 'تاريخ ميلادك يروحي',
    login_password_label: 'Password',
    login_button: 'unlock',
    login_error: 'كلمة المرور غلط، حاولي تاني.',
    login_footer: '♥',

    welcome_eyebrow: '♥',
    welcome_title: 'بنوتي والحته اللى ف قلبي',
    welcome_subtitle: 'بحبك يروح قلبي من اول لحظه عيني شافتك فيها وانا دماغي مش بتفكر غير فيكي، مهما الدنيا شغلتني بتفضلي ف قلبي وعقلبي ومش بنساكي، \nالويب سايت دا هديه بسيطه نحتفظ فيه بصورنا واغانينا ولحظتنا الحلوه اتمني يعجبك 🥹♥',

    story_eyebrow: '♥',
    story_title: 'Our Story',
    story_first_meeting_label: 'أول يوم اتقابلنا فيه',
    story_first_meeting_description: 'اليوم دا عرفت اني مش هكمل المشوار لوحدي، عشان انتي رفيقه حياتي 🥹♥',
    story_love_confession_label: 'اليوم الى قولتلك فيه بحبك♥️',
    story_love_confession_message: 'لما شوفت الأبتسامه علي وشك قلبي كان بيتنطط جوا صدري 😂♥',

    gallery_eyebrow: '♥',
    gallery_title: 'Memories',

    final_eyebrow: '♥',
    final_title: 'For you',
    final_text: 'أينما ذهب بنا الحياة، سيجد قلبي دائماً طريقه العائد إليكِ. أنتِ حلمي الذي أريد أن أعيشه كل يوم، ونبضتي التي أشتاق إليها في كل لحظة. شكراً لأنكِ أنتِ.',
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

  // 1. Authenticate Super Admin against env / Vercel or Supabase REST super_admins
  const authHeader = req.headers.authorization || ''
  let token = authHeader.replace(/^Bearer\s+/i, '').trim() || req.query.token
  let email = (req.headers['x-admin-email'] || req.headers['X-Admin-Email'] || req.query.email || '').trim()

  if (token && token.includes(':')) {
    const parts = token.split(':')
    email = parts[0]
    token = parts[1]
  }

  let isAuthorized = false

  const SUPER_ADMIN_EMAIL = (process.env.SUPER_ADMIN_EMAIL || '').toLowerCase().trim()
  const SUPER_ADMIN_PASSWORD = (process.env.SUPER_ADMIN_PASSWORD || '').trim()

  if (email && token) {
    const cleanEmail = email.toLowerCase().trim()
    const cleanToken = String(token).trim()

    // 1. Direct check exclusively from environment variables (.env / Vercel)
    if (SUPER_ADMIN_EMAIL && SUPER_ADMIN_PASSWORD && cleanEmail === SUPER_ADMIN_EMAIL && cleanToken === SUPER_ADMIN_PASSWORD) {
      isAuthorized = true
    } else {
      // 2. Database check from super_admins table
      try {
        const r = await fetchWithResilience(
          `${SUPABASE_URL}/rest/v1/super_admins?email=eq.${encodeURIComponent(cleanEmail)}`,
          { headers: restHeaders }
        )
        if (r.ok) {
          const rows = await r.json()
          if (Array.isArray(rows) && rows.length > 0) {
            const hash = rows[0].password_hash
            const match = await bcrypt.compare(cleanToken, hash)
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
      let r = await fetchWithResilience(
        `${SUPABASE_URL}/rest/v1/sites?select=slug,visitor_password,admin_password,created_at,updated_at,is_active,language&order=created_at.desc`,
        { headers: restHeaders }
      )

      if (!r.ok) {
        // Fallback fetch if is_active or language is not in PostgREST schema cache yet
        r = await fetchWithResilience(
          `${SUPABASE_URL}/rest/v1/sites?select=slug,visitor_password,admin_password,created_at,updated_at&order=created_at.desc`,
          { headers: restHeaders }
        )
      }

      if (!r.ok) {
        const errText = await r.text().catch(() => '')
        const cleanMsg = sanitizeDatabaseError(errText, `تعذّر جلب قائمة المواقع (${r.status})`)
        return res.status(r.status || 500).json({ error: cleanMsg })
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
      const { slug, sitePassword = 'love', adminPassword = 'love', language = 'ar' } = req.body || {}

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

      const defaultFields = getDefaultFields()
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

      // Seed memories, gallery_items, and wishlist_items from soulove master template
      const siteId = newRow?.id
      if (siteId) {
        await Promise.allSettled([
          fetch(`${SUPABASE_URL}/rest/v1/memories`, {
            method: 'POST',
            headers: restHeaders,
            body: JSON.stringify([
              { site_id: siteId, tenant_slug: cleanSlug, image: '/api/media?path=soulove%2Fmemories%2Fmemories-1787269070700.webp', date: '2026-08-11', text: '' },
              { site_id: siteId, tenant_slug: cleanSlug, image: '/api/media?path=soulove%2Fmemories%2Fmemories-1787324274952.webp', date: '2025-03-19', text: 'اكتر صورة بنحبها♥️♥️' },
              { site_id: siteId, tenant_slug: cleanSlug, image: '/api/media?path=soulove%2Fmemories%2Fmemories-1787324274932.webp', date: '2025-06-10', text: 'خطوبتنا😍♥️' }
            ])
          }),
          fetch(`${SUPABASE_URL}/rest/v1/gallery_items`, {
            method: 'POST',
            headers: restHeaders,
            body: JSON.stringify([
              { site_id: siteId, tenant_slug: cleanSlug, url: '/api/media?path=soulove%2Fgallery%2Fgallery-1787324224909.webp', description: 'اول مره نسافر مع بعض♥️' },
              { site_id: siteId, tenant_slug: cleanSlug, url: '/api/media?path=soulove%2Fgallery%2Fgallery-1787324224874.webp', description: 'خطوبتنا♥️♥️' },
              { site_id: siteId, tenant_slug: cleanSlug, url: '/api/media?path=soulove%2Fgallery%2Fgallery-1787324224855.webp', description: 'صورتنا المفضله♥️♥️' },
              { site_id: siteId, tenant_slug: cleanSlug, url: '/api/media?path=soulove%2Fgallery%2Fgallery-1787324224869.webp', description: '' },
              { site_id: siteId, tenant_slug: cleanSlug, url: '/api/media?path=soulove%2Fgallery%2Fgallery-1787324224859.webp', description: '' }
            ])
          }),
          fetch(`${SUPABASE_URL}/rest/v1/wishlist_items`, {
            method: 'POST',
            headers: restHeaders,
            body: JSON.stringify([
              { site_id: siteId, tenant_slug: cleanSlug, text: 'نروح البحر ونتمشي علي الرمله بليل 🌊', completed: false },
              { site_id: siteId, tenant_slug: cleanSlug, text: 'اشرب قهوه من ايديكي الحلوين 😍', completed: false },
              { site_id: siteId, tenant_slug: cleanSlug, text: 'نقعد في مكان هادي ونتكلم براحتنا ♥', completed: false }
            ])
          })
        ])
      }

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

      await fetchWithResilience(`${SUPABASE_URL}/rest/v1/sites?slug=eq.${encodeURIComponent(slug)}`, {
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

      const delRes = await fetchWithResilience(`${SUPABASE_URL}/rest/v1/sites?slug=eq.${encodeURIComponent(slug)}`, {
        method: 'DELETE',
        headers: {
          ...restHeaders,
          'Prefer': 'return=representation'
        },
      })

      if (!delRes.ok) {
        const errText = await delRes.text().catch(() => '')
        throw new Error(`فشل حذف الموقع من قاعدة البيانات: ${errText}`)
      }

      return res.status(200).json({ success: true, deletedSlug: slug })
    }

    return res.status(405).json({ error: 'method_not_allowed' })
  } catch (err) {
    console.error('API /super-admin error:', err)
    const isTimeout = err.name === 'TimeoutError' || err.message?.includes('timeout') || err.message?.includes('aborted')
    const message = isTimeout
      ? 'استغرق خادم قاعدة البيانات وقتاً أطول من المتوقع للاستجابة. يرجى إعادة المحاولة.'
      : sanitizeDatabaseError(err.message, 'حدث خطأ غير متوقع أثناء معالجة الطلب.')
    return res.status(isTimeout ? 504 : 500).json({ error: message })
  }
}
