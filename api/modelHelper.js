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

  const lang = row.language || 'ar'
  const isEs = lang === 'es'
  const isEn = lang === 'en' || lang === 'en-GB'

  const defaultLoginEyebrow = isEs ? 'Un regalo de mi corazón' : isEn ? 'A gift from my heart' : 'هدية من قلبي'
  const defaultLoginTitle = isEs ? 'Bienvenida mi amor' : isEn ? 'Welcome my love' : 'أهلاً يا حبيبتي'
  const defaultLoginSubtitle = isEs ? 'Detrás de esta puerta hay un pequeño mundo que construí para ti sola: nuestros recuerdos, nuestra historia y cada latido de amor en mi corazón.' : isEn ? 'Behind this door is a small world I built for you alone — our memories, our story, and every heartbeat of love in my heart.' : 'خلف هذا الباب عالم صغير صنعته لكِ وحدك — ذكرياتنا، قصتنا، وكل نبضة حب في قلبي.'
  const defaultLoginPlaceholder = isEs ? 'Contraseña secreta' : isEn ? 'Secret password' : 'كلمة المرور السرية'
  const defaultLoginPasswordLabel = isEs ? 'Contraseña' : isEn ? 'Password' : 'كلمة المرور'
  const defaultLoginButton = isEs ? 'Abre mi corazón' : isEn ? 'Open my heart' : 'افتحي قلبي'
  const defaultLoginError = isEs ? 'Contraseña incorrecta, inténtalo de nuevo mi bella.' : isEn ? 'Incorrect password, try again my beautiful.' : 'كلمة المرور غير صحيحة، حاولي مرة أخرى يا جميلتي.'
  const defaultLoginFooter = isEs ? 'Hecho con amor, solo para ti' : isEn ? 'Made with love, for you alone' : 'صُنع بحب، لكِ وحدك'

  const defaultWelcomeEyebrow = isEs ? 'Finalmente llegaste' : isEn ? 'You finally arrived' : 'وصلتِ إليه أخيراً'
  const defaultWelcomeTitle = isEs ? 'Bienvenida, el amor más bello de mi vida' : isEn ? 'Welcome, the most beautiful love in my life' : 'مرحباً يا أجمل حب في حياتي'
  const defaultWelcomeSubtitle = isEs ? 'Todo lo que te espera aquí fue escrito y preparado pensando en ti: un viaje suave a través de nuestra historia, nuestro tiempo y el amor que vivimos juntos.' : isEn ? 'Everything waiting for you here was written and prepared with you in mind — a gentle journey through our story, our time, and the love we live together.' : 'كل ما ينتظركِ هنا كُتب وأُعدّ بكِ في بالي — رحلة ناعمة عبر قصتنا، وقتنا، والحب الذي نعيشه معاً.'

  const defaultStoryEyebrow = isEs ? 'Una historia de amor' : 'A Love Story'
  const defaultStoryTitle = isEs ? 'Nuestra Historia' : 'Our Story'
  const defaultStoryFirstMeetingLabel = isEs ? 'El primer día que nos conocimos' : isEn ? 'The first day we met' : 'أول يوم التقينا فيه'
  const defaultStoryFirstMeetingDesc = isEs ? 'Aún no lo sabía, pero mi corazón ya estaba encontrando su camino hacia ti.' : isEn ? 'I did not know it yet, but my heart was already finding its way to you.' : 'لم أكن أعلم بعد، لكن قلبي كان قد بدأ بالفعل يجد طريقه إليكِ.'
  const defaultStoryLoveConfessionLabel = isEs ? 'El día que dije "Te amo"' : isEn ? 'The day I said "I love you"' : 'اليوم الذي قلت فيه "أحبك"'
  const defaultStoryLoveConfessionMsg = isEs ? 'Tres pequeñas palabras, y de repente el mundo se volvió más cálido, más suave e infinitamente más hermoso.' : isEn ? 'Three small words — and suddenly the world became warmer, softer, and infinitely more beautiful.' : 'ثلاث كلمات صغيرة — وفجأة أصبح العالم أدفأ، وأنعم، وأجمل بلا حدود.'

  const defaultFinalEyebrow = isEs ? 'Una carta final' : isEn ? 'A final letter' : 'رسالة أخيرة'
  const defaultFinalTitle = isEs ? 'Por siempre y para siempre' : isEn ? 'Forever and always' : 'للأبد ودائماً'
  const defaultFinalText = isEs ? 'Dondequiera que nos lleve la vida, mi corazón siempre encontrará el camino de regreso a ti. Eres mi sueño que quiero vivir todos los días, y mi pulso que extraño a cada momento. Gracias por ser tú.' : isEn ? 'Wherever life takes us, my heart will always find its way back to you. You are my dream that I want to live every day, and my pulse that I miss every moment. Thank you for being you.' : 'أينما ذهب بنا الحياة، سيجد قلبي دائماً طريقه العائد إليكِ. أنتِ حلمي الذي أريد أن أعيشه كل يوم، ونبضتي التي أشتاق إليها في كل لحظة. شكراً لأنكِ أنتِ.'

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
      title: row.music_title || (isEs ? 'Nuestra canción' : isEn ? 'Our Song' : 'أغنيتنا'),
      src: musicSrc,
      volume: Number(row.music_volume || 0.35),
      tracks: musicTracks,
    },
    login: {
      eyebrow: row.login_eyebrow || defaultLoginEyebrow,
      title: row.login_title || defaultLoginTitle,
      subtitle: row.login_subtitle || defaultLoginSubtitle,
      placeholder: row.login_placeholder || defaultLoginPlaceholder,
      passwordLabel: row.login_password_label || defaultLoginPasswordLabel,
      button: row.login_button || defaultLoginButton,
      error: row.login_error || defaultLoginError,
      footer: row.login_footer || defaultLoginFooter,
    },
    welcome: {
      eyebrow: row.welcome_eyebrow || defaultWelcomeEyebrow,
      title: row.welcome_title || defaultWelcomeTitle,
      subtitle: row.welcome_subtitle || defaultWelcomeSubtitle,
      nextButton: welcomeNextButton || row.welcome_next_button || '',
    },
    story: {
      eyebrow: row.story_eyebrow || defaultStoryEyebrow,
      title: row.story_title || defaultStoryTitle,
      firstMeeting: {
        label: row.story_first_meeting_label || defaultStoryFirstMeetingLabel,
        description: row.story_first_meeting_description || defaultStoryFirstMeetingDesc,
      },
      loveConfession: {
        label: row.story_love_confession_label || defaultStoryLoveConfessionLabel,
        message: row.story_love_confession_message || defaultStoryLoveConfessionMsg,
      },
      memoriesButton: storyMemoriesButton || row.story_memories_button || '',
    },
    gallery: {
      eyebrow: row.gallery_eyebrow || (isEs ? 'Nuestro Álbum' : 'Our Album'),
      title: row.gallery_title || (isEs ? 'Recuerdos' : 'Memories'),
      finalButton: galleryFinalButton || row.gallery_final_button || '',
    },
    countdownsNextButton: countdownsNextButton || '',
    final: {
      eyebrow: row.final_eyebrow || defaultFinalEyebrow,
      title: row.final_title || defaultFinalTitle,
      text: row.final_text || defaultFinalText,
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
