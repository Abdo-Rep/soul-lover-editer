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

export function rowToContent(row, memories = [], galleryItems = [], wishlistItems = []) {
  if (!row) return null

  // Intelligently parse music_src to restore multi-track playlists, countdowns & custom buttons
  let musicSrc = row.music_src || ''
  let musicTracks = []
  let countdownsList = []
  let welcomeNextButton = ''
  let storyMemoriesButton = ''
  let galleryFinalButton = ''
  let countdownsNextButton = ''
  let appearanceMode = 'light'

  if (musicSrc.startsWith('{') || musicSrc.startsWith('[')) {
    try {
      const parsed = JSON.parse(musicSrc)
      if (parsed.appearanceMode) {
        appearanceMode = parsed.appearanceMode
      }
      if (parsed.countdowns && Array.isArray(parsed.countdowns)) {
        countdownsList = parsed.countdowns
      }
      if (parsed.tracks && Array.isArray(parsed.tracks)) {
        musicTracks = parsed.tracks
        musicSrc = parsed.mainSrc || (musicTracks.find(t => t.src)?.src) || ''
      } else if (Array.isArray(parsed)) {
        musicTracks = parsed
        musicSrc = (musicTracks.find(t => t.src)?.src) || ''
      } else {
        musicSrc = parsed.mainSrc || ''
      }
      if (parsed.extraButtons) {
        welcomeNextButton = parsed.extraButtons.welcomeNextButton || ''
        storyMemoriesButton = parsed.extraButtons.storyMemoriesButton || ''
        galleryFinalButton = parsed.extraButtons.galleryFinalButton || ''
        countdownsNextButton = parsed.extraButtons.countdownsNextButton || ''
      }
    } catch {}
  }

  // Fallback check on date_love_confession
  let loveConfessionDate = row.date_love_confession || ''
  if (loveConfessionDate.startsWith('{') || loveConfessionDate.startsWith('[')) {
    try {
      const parsed = JSON.parse(loveConfessionDate)
      if (parsed.countdowns && Array.isArray(parsed.countdowns) && countdownsList.length === 0) {
        countdownsList = parsed.countdowns
      }
      if (parsed.appearanceMode && appearanceMode === 'light') {
        appearanceMode = parsed.appearanceMode
      }
      loveConfessionDate = parsed.loveConfession || ''
    } catch {}
  }

  return {
    siteName: row.site_name,
    password: decrypt(row.visitor_password),
    adminPassword: decrypt(row.admin_password),
    appearance: {
      mode: appearanceMode,
      primaryColor: row.primary_color,
      backgroundHeartColor: row.background_heart_color,
      heartOpacity: Number(row.heart_opacity || 0.65),
      backgroundHeart: row.background_heart_char,
      pushHeart: row.push_heart_char,
    },
    dates: {
      relationshipStart: row.date_relationship_start || '',
      firstMeeting: row.date_first_meeting || '',
      loveConfession: loveConfessionDate,
    },
    music: {
      fileName: row.music_file_name || 'romantic.mp3',
      title: row.music_title || 'أغنيتنا',
      src: musicSrc,
      volume: Number(row.music_volume || 0.35),
      tracks: musicTracks,
    },
    login: {
      eyebrow: row.login_eyebrow || 'هدية من قلبي',
      title: row.login_title || 'أهلاً يا حبيبتي',
      subtitle: row.login_subtitle || 'خلف هذا الباب عالم صغير صنعته لكِ وحدك — ذكرياتنا، قصتنا، وكل نبضة حب في قلبي.',
      placeholder: row.login_placeholder || 'كلمة المرور السرية',
      passwordLabel: row.login_password_label || 'كلمة المرور',
      button: row.login_button || 'افتحي قلبي',
      error: row.login_error || 'كلمة المرور غير صحيحة، حاولي مرة أخرى يا جميلتي.',
      footer: row.login_footer || 'صُنع بحب، لكِ وحدك',
    },
    welcome: {
      eyebrow: row.welcome_eyebrow || 'وصلتِ إليه أخيراً',
      title: row.welcome_title || 'مرحباً يا أجمل حب في حياتي',
      subtitle: row.welcome_subtitle || 'كل ما ينتظركِ هنا كُتب وأُعدّ بكِ في بالي — رحلة ناعمة عبر قصتنا، وقتنا، والحب الذي نعيشه معاً.',
      nextButton: welcomeNextButton || row.welcome_next_button || '',
    },
    story: {
      eyebrow: row.story_eyebrow || 'A Love Story',
      title: row.story_title || 'Our Story',
      firstMeeting: {
        label: row.story_first_meeting_label || 'أول يوم التقينا فيه',
        description: row.story_first_meeting_description || 'لم أكن أعلم بعد، لكن قلبي كان قد بدأ بالفعل يجد طريقه إليكِ.',
      },
      loveConfession: {
        label: row.story_love_confession_label || 'اليوم الذي قلت فيه "أحبك"',
        message: row.story_love_confession_message || 'ثلاث كلمات صغيرة — وفجأة أصبح العالم أدفأ، وأنعم، وأجمل بلا حدود.',
      },
      memoriesButton: storyMemoriesButton || row.story_memories_button || '',
    },
    gallery: {
      eyebrow: row.gallery_eyebrow || 'Our Album',
      title: row.gallery_title || 'Memories',
      finalButton: galleryFinalButton || row.gallery_final_button || '',
    },
    countdownsNextButton: countdownsNextButton || '',
    final: {
      eyebrow: row.final_eyebrow || 'رسالة أخيرة',
      title: row.final_title || 'للأبد ودائماً',
      text: row.final_text || 'أينما ذهب بنا الحياة، سيجد قلبي دائماً طريقه العائد إليكِ. أنتِ حلمي الذي أريد أن أعيشه كل يوم، ونبضتي التي أشتاق إليها في كل لحظة. شكراً لأنكِ أنتِ.',
    },
    memories: memories.map((m) => ({
      id: m.id,
      image: m.image,
      date: m.date,
      text: m.text,
    })),
    galleryItems: galleryItems.map((g) => ({
      id: g.id,
      url: g.url || g.image || '',
      image: g.image || g.url || '',
      date: g.date,
      text: g.description || '',
      description: g.description || '',
    })),
    wishlist: wishlistItems.map((w) => ({
      id: w.id,
      text: w.text,
      completed: Boolean(w.completed),
    })),
    countdowns: countdownsList,
  }
}

export async function fetchCompleteSite(pool, slug) {
  try {
    const siteR = await fetch(`${SUPABASE_URL}/rest/v1/sites?slug=eq.${slug}`, { headers: restHeaders })
    if (!siteR.ok) return null
    const siteData = await siteR.json()
    if (!Array.isArray(siteData) || siteData.length === 0) return null

    const row = siteData[0]
    const siteId = row.id

    const [memR, galR, wishR] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/memories?site_id=eq.${siteId}&order=created_at.asc`, { headers: restHeaders }),
      fetch(`${SUPABASE_URL}/rest/v1/gallery_items?site_id=eq.${siteId}&order=created_at.asc`, { headers: restHeaders }),
      fetch(`${SUPABASE_URL}/rest/v1/wishlist_items?site_id=eq.${siteId}&order=created_at.asc`, { headers: restHeaders }),
    ])

    const memories = memR.ok ? await memR.json() : []
    const galleryItems = galR.ok ? await galR.json() : []
    const wishlistItems = wishR.ok ? await wishR.json() : []

    return {
      row,
      content: rowToContent(row, memories, galleryItems, wishlistItems)
    }
  } catch (e) {
    console.error('fetchCompleteSite REST error:', e)
    return null
  }
}

export async function saveRelationalContent(pool, slug, content) {
  // 1. Get site metadata
  const siteR = await fetch(`${SUPABASE_URL}/rest/v1/sites?slug=eq.${slug}&select=id,visitor_password,admin_password`, { headers: restHeaders })
  if (!siteR.ok) throw new Error('site_not_found')
  const siteData = await siteR.json()
  if (!Array.isArray(siteData) || siteData.length === 0) throw new Error('site_not_found')

  const siteId = siteData[0].id
  const payload = {}

  if (content.siteName !== undefined) payload.site_name = content.siteName
  
  if (content.password !== undefined && content.password !== '') {
    const cleanVisitorPass = String(content.password).trim().replace(/[\u0600-\u06FF\s]/g, '')
    payload.visitor_password = encrypt(cleanVisitorPass)
  }
  if (content.adminPassword !== undefined && content.adminPassword !== '') {
    const cleanAdminPass = String(content.adminPassword).trim().replace(/[\u0600-\u06FF\s]/g, '')
    payload.admin_password = encrypt(cleanAdminPass)
  }

  if (content.appearance) {
    if (content.appearance.primaryColor !== undefined) payload.primary_color = content.appearance.primaryColor
    if (content.appearance.backgroundHeartColor !== undefined) payload.background_heart_color = content.appearance.backgroundHeartColor
    if (content.appearance.heartOpacity !== undefined) payload.heart_opacity = content.appearance.heartOpacity
    if (content.appearance.backgroundHeart !== undefined) payload.background_heart_char = content.appearance.backgroundHeart
    if (content.appearance.pushHeart !== undefined) payload.push_heart_char = content.appearance.pushHeart
  }

  if (content.dates) {
    if (content.dates.relationshipStart !== undefined) payload.date_relationship_start = content.dates.relationshipStart
    if (content.dates.firstMeeting !== undefined) payload.date_first_meeting = content.dates.firstMeeting
    if (content.dates.loveConfession !== undefined) {
      const rawDate = content.dates.loveConfession
      payload.date_love_confession = (typeof rawDate === 'string' && rawDate.startsWith('{')) ? '' : rawDate
    }
  }

  const mainSrcVal = content.music?.src || ''
  const tracksArr = content.music?.tracks || []
  const countdownsArr = content.countdowns || []
  
  payload.music_src = JSON.stringify({
    mainSrc: mainSrcVal,
    tracks: tracksArr,
    countdowns: countdownsArr,
    appearanceMode: content.appearance?.mode || 'light',
    extraButtons: {
      welcomeNextButton: content.welcome?.nextButton,
      storyMemoriesButton: content.story?.memoriesButton,
      galleryFinalButton: content.gallery?.finalButton,
      countdownsNextButton: content.countdownsNextButton,
    }
  })

  if (content.music) {
    if (content.music.fileName !== undefined) payload.music_file_name = content.music.fileName
    if (content.music.title !== undefined) payload.music_title = content.music.title
    if (content.music.volume !== undefined) payload.music_volume = content.music.volume
  }

  if (content.login) {
    if (content.login.eyebrow !== undefined) payload.login_eyebrow = content.login.eyebrow
    if (content.login.title !== undefined) payload.login_title = content.login.title
    if (content.login.subtitle !== undefined) payload.login_subtitle = content.login.subtitle
    if (content.login.placeholder !== undefined) payload.login_placeholder = content.login.placeholder
    if (content.login.passwordLabel !== undefined) payload.login_password_label = content.login.passwordLabel
    if (content.login.button !== undefined) payload.login_button = content.login.button
    if (content.login.error !== undefined) payload.login_error = content.login.error
    if (content.login.footer !== undefined) payload.login_footer = content.login.footer
  }

  if (content.welcome) {
    if (content.welcome.eyebrow !== undefined) payload.welcome_eyebrow = content.welcome.eyebrow
    if (content.welcome.title !== undefined) payload.welcome_title = content.welcome.title
    if (content.welcome.subtitle !== undefined) payload.welcome_subtitle = content.welcome.subtitle
  }

  if (content.story) {
    if (content.story.eyebrow !== undefined) payload.story_eyebrow = content.story.eyebrow
    if (content.story.title !== undefined) payload.story_title = content.story.title
    if (content.story.firstMeeting) {
      if (content.story.firstMeeting.label !== undefined) payload.story_first_meeting_label = content.story.firstMeeting.label
      if (content.story.firstMeeting.description !== undefined) payload.story_first_meeting_description = content.story.firstMeeting.description
    }
    if (content.story.loveConfession) {
      if (content.story.loveConfession.label !== undefined) payload.story_love_confession_label = content.story.loveConfession.label
      if (content.story.loveConfession.message !== undefined) payload.story_love_confession_message = content.story.loveConfession.message
    }
  }

  if (content.gallery) {
    if (content.gallery.eyebrow !== undefined) payload.gallery_eyebrow = content.gallery.eyebrow
    if (content.gallery.title !== undefined) payload.gallery_title = content.gallery.title
  }

  if (content.final) {
    if (content.final.eyebrow !== undefined) payload.final_eyebrow = content.final.eyebrow
    if (content.final.title !== undefined) payload.final_title = content.final.title
    if (content.final.text !== undefined) payload.final_text = content.final.text
  }

  payload.updated_at = new Date().toISOString()

  // ⚡ Smart Dirty-Section Update: Skip heavy relational deletes/inserts when only text/titles changed!
  const dirtySections = Array.isArray(content._dirtySections) ? content._dirtySections : null
  const hasDirtyList = Array.isArray(dirtySections) && dirtySections.length > 0
  const shouldUpdateMemories = !hasDirtyList || dirtySections.includes('memories')
  const shouldUpdateGallery = !hasDirtyList || dirtySections.includes('galleryItems')
  const shouldUpdateWishlist = !hasDirtyList || dirtySections.includes('wishlist')

  const step1 = [
    fetch(`${SUPABASE_URL}/rest/v1/sites?id=eq.${siteId}`, {
      method: 'PATCH',
      headers: restHeaders,
      body: JSON.stringify(payload)
    })
  ]

  if (shouldUpdateMemories && content.memories && Array.isArray(content.memories)) {
    step1.push(fetch(`${SUPABASE_URL}/rest/v1/memories?site_id=eq.${siteId}`, { method: 'DELETE', headers: restHeaders }))
  }
  if (shouldUpdateGallery && content.galleryItems && Array.isArray(content.galleryItems)) {
    step1.push(fetch(`${SUPABASE_URL}/rest/v1/gallery_items?site_id=eq.${siteId}`, { method: 'DELETE', headers: restHeaders }))
  }
  if (shouldUpdateWishlist && content.wishlist && Array.isArray(content.wishlist)) {
    step1.push(fetch(`${SUPABASE_URL}/rest/v1/wishlist_items?site_id=eq.${siteId}`, { method: 'DELETE', headers: restHeaders }))
  }

  await Promise.all(step1)

  const step2 = []

  if (shouldUpdateMemories && content.memories && Array.isArray(content.memories) && content.memories.length > 0) {
    const memsToInsert = content.memories.map(m => ({
      site_id: siteId,
      tenant_slug: slug,
      image: m.image || '',
      date: m.date || '',
      text: m.text || ''
    }))
    step2.push(fetch(`${SUPABASE_URL}/rest/v1/memories`, { method: 'POST', headers: restHeaders, body: JSON.stringify(memsToInsert) }))
  }

  if (shouldUpdateGallery && content.galleryItems && Array.isArray(content.galleryItems) && content.galleryItems.length > 0) {
    const itemsToInsert = content.galleryItems.map(item => ({
      site_id: siteId,
      tenant_slug: slug,
      url: item.url || item.image || '',
      date: item.date || '',
      description: item.text || item.description || ''
    }))
    step2.push(fetch(`${SUPABASE_URL}/rest/v1/gallery_items`, { method: 'POST', headers: restHeaders, body: JSON.stringify(itemsToInsert) }))
  }

  if (shouldUpdateWishlist && content.wishlist && Array.isArray(content.wishlist) && content.wishlist.length > 0) {
    const wishToInsert = content.wishlist.map(item => ({
      site_id: siteId,
      tenant_slug: slug,
      text: item.text || '',
      completed: Boolean(item.completed)
    }))
    step2.push(fetch(`${SUPABASE_URL}/rest/v1/wishlist_items`, { method: 'POST', headers: restHeaders, body: JSON.stringify(wishToInsert) }))
  }

  if (step2.length > 0) {
    await Promise.all(step2)
  }

  return {
    row: {
      visitor_password: payload.visitor_password || siteData[0].visitor_password,
      admin_password: payload.admin_password || siteData[0].admin_password,
      updated_at: payload.updated_at,
    },
    content,
  }
}
