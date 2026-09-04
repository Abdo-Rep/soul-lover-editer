import { defaultContent } from '../data/defaultContent'
import { normalizeAppearance } from './theme'


function mergeSection(base, patch) {
  if (!patch) return base
  if (Array.isArray(base)) return patch
  return { ...base, ...patch }
}

function resolveGalleryItems(stored) {
  if (Array.isArray(stored.galleryItems)) {
    return stored.galleryItems.filter(Boolean)
  }

  const fromMemories = (stored.memories ?? [])
    .filter(Boolean)
    .filter((item) => typeof item.image === 'string' && item.image.startsWith('http'))

  if (fromMemories.length > 0) {
    return fromMemories.map((item, index) => ({
      ...item,
      id: item.id ?? index + 1,
    }))
  }

  return []
}

function ensureUniqueIds(items = []) {
  if (!Array.isArray(items)) return []
  const cleanItems = items.filter(Boolean)
  let currentMax = 0
  cleanItems.forEach((item) => {
    const numId = Number(item?.id)
    if (Number.isFinite(numId) && numId > currentMax) {
      currentMax = numId
    }
  })
  return cleanItems.map((item, index) => {
    const numId = Number(item?.id)
    if (Number.isFinite(numId) && numId > 0) {
      return item
    }
    currentMax += 1
    return { ...item, id: currentMax || index + 1 }
  })
}

function sanitizeMediaUrl(url) {
  if (!url || typeof url !== 'string') return url
  if (url.startsWith('/') || url.startsWith('blob:') || url.startsWith('data:')) return url

  let objectPath = ''
  
  const rawMarker = '/storage/v1/object/public/site-media/'
  const signMarker = '/storage/v1/object/sign/site-media/'
  
  if (url.includes(rawMarker)) {
    objectPath = url.split(rawMarker)[1]?.split('?')[0] || ''
  } else if (url.includes(signMarker)) {
    objectPath = url.split(signMarker)[1]?.split('?')[0] || ''
  } else if (url.includes('/site-media/')) {
    objectPath = url.split('/site-media/')[1]?.split('?')[0] || ''
  }

  if (objectPath) {
    try {
      objectPath = decodeURIComponent(objectPath)
    } catch {}
    return `/api/media?path=${encodeURIComponent(objectPath)}`
  }

  return url
}

export function getSeedContent(language = 'ar') {
  const seed = structuredClone(defaultContent)
  seed.language = language

  if (language === 'es') {
    seed.login = {
      eyebrow: 'Un regalo de mi corazón',
      title: 'Bienvenida mi amor',
      subtitle: 'Detrás de esta puerta hay un pequeño mundo que construí para ti sola: nuestros recuerdos, nuestra historia y cada latido de amor en mi corazón.',
      placeholder: 'Contraseña secreta',
      passwordLabel: 'Contraseña',
      button: 'Abre mi corazón',
      error: 'Contraseña incorrecta, inténtalo de nuevo mi bella.',
      footer: 'Hecho con amor, solo para ti',
    }
    seed.welcome = {
      eyebrow: 'Finalmente llegaste',
      title: 'Bienvenida, el amor más bello de mi vida',
      subtitle: 'Todo lo que te espera aquí fue escrito y preparado pensando en ti: un viaje suave a través de nuestra historia, nuestro tiempo y el amor que vivimos juntos.',
      nextButton: '',
    }
    seed.story = {
      eyebrow: 'Una historia de amor',
      title: 'Nuestra Historia',
      firstMeeting: {
        label: 'El primer día que nos conocimos',
        description: 'Aún no lo sabía, pero mi corazón ya estaba encontrando su camino hacia ti.',
      },
      loveConfession: {
        label: 'El día que dije "Te amo"',
        message: 'Tres pequeñas palabras, y de repente el mundo se volvió más cálido, más suave e infinitamente más hermoso.',
      },
      memoriesButton: '',
    }
    seed.gallery = {
      eyebrow: 'Nuestro Álbum',
      title: 'Recuerdos',
      finalButton: '',
    }
    seed.final = {
      eyebrow: 'Una carta final',
      title: 'Por siempre y para siempre',
      text: 'Dondequiera que nos lleve la vida, mi corazón siempre encontrará el camino de regreso a ti. Eres mi sueño que quiero vivir todos los días, y mi pulso que extraño a cada momento. Gracias por ser tú.',
    }
    seed.music = {
      fileName: 'romantic.mp3',
      title: 'Nuestra canción',
      src: '',
      volume: 0.35,
    }
  } else if (language === 'en' || language === 'en-GB') {
    seed.login = {
      eyebrow: 'A gift from my heart',
      title: 'Welcome my love',
      subtitle: 'Behind this door is a small world I built for you alone — our memories, our story, and every heartbeat of love in my heart.',
      placeholder: 'Secret password',
      passwordLabel: 'Password',
      button: 'Open my heart',
      error: 'Incorrect password, try again my beautiful.',
      footer: 'Made with love, for you alone',
    }
    seed.welcome = {
      eyebrow: 'You finally arrived',
      title: 'Welcome, the most beautiful love in my life',
      subtitle: 'Everything waiting for you here was written and prepared with you in mind — a gentle journey through our story, our time, and the love we live together.',
      nextButton: '',
    }
    seed.story = {
      eyebrow: 'A Love Story',
      title: 'Our Story',
      firstMeeting: {
        label: 'The first day we met',
        description: 'I did not know it yet, but my heart was already finding its way to you.',
      },
      loveConfession: {
        label: 'The day I said "I love you"',
        message: 'Three small words — and suddenly the world became warmer, softer, and infinitely more beautiful.',
      },
      memoriesButton: '',
    }
    seed.gallery = {
      eyebrow: 'Our Album',
      title: 'Memories',
      finalButton: '',
    }
    seed.final = {
      eyebrow: 'A final letter',
      title: 'Forever and always',
      text: 'Wherever life takes us, my heart will always find its way back to you. You are my dream that I want to live every day, and my pulse that I miss every moment. Thank you for being you.',
    }
  }

  return seed
}

export function mergeContent(stored) {
  const lang = stored?.language || 'ar'
  const baseDefault = getSeedContent(lang)

  if (!stored || Object.keys(stored).length === 0) {
    return baseDefault
  }

  const mergedMusic = mergeSection(baseDefault.music, stored.music)
  const sanitizedMusic = {
    ...mergedMusic,
    src: sanitizeMediaUrl(mergedMusic.src),
    tracks: (mergedMusic.tracks || []).filter(Boolean).map((t) => ({
      ...t,
      src: sanitizeMediaUrl(t.src),
    })),
  }

  return {
    ...stored,
    language: lang,
    siteName: stored.siteName ?? '',
    password: stored.password ?? '',
    adminPassword: stored.adminPassword ?? '',
    dates: stored.dates ? { ...stored.dates } : { relationshipStart: '', firstMeeting: '', loveConfession: '' },
    music: sanitizedMusic,
    login: stored.login ? { ...stored.login } : { eyebrow: '', title: '', subtitle: '', placeholder: '', passwordLabel: '', button: '', error: '', footer: '' },
    welcome: stored.welcome ? { ...stored.welcome } : { eyebrow: '', title: '', subtitle: '', nextButton: '' },
    story: stored.story ? {
      ...stored.story,
      memoriesButton: stored.story.memoriesButton ?? '',
      firstMeeting: stored.story.firstMeeting ? { ...stored.story.firstMeeting } : { label: '', description: '' },
      loveConfession: stored.story.loveConfession ? { ...stored.story.loveConfession } : { label: '', message: '' },
    } : { eyebrow: '', title: '', memoriesButton: '', firstMeeting: { label: '', description: '' }, loveConfession: { label: '', message: '' } },
    gallery: stored.gallery ? { ...stored.gallery } : { eyebrow: '', title: '', finalButton: '' },
    final: stored.final ? { ...stored.final } : { eyebrow: '', title: '', text: '' },
    appearance: normalizeAppearance({
      ...baseDefault.appearance,
      ...stored.appearance,
    }),
    memories: ensureUniqueIds(stored.memories ?? []).map((m) => ({
      ...m,
      image: sanitizeMediaUrl(m.image),
    })),
    galleryItems: ensureUniqueIds(resolveGalleryItems(stored)).map((item) => ({
      ...item,
      image: sanitizeMediaUrl(item.image),
      url: sanitizeMediaUrl(item.url || item.image),
    })),
    wishlist: ensureUniqueIds(Array.isArray(stored.wishlist) ? stored.wishlist : []),
    countdowns: ensureUniqueIds(Array.isArray(stored.countdowns) ? stored.countdowns : []),
    countdownsNextButton: stored.countdownsNextButton ?? '',
  }
}

export function nextItemId(items = []) {
  if (!Array.isArray(items) || items.length === 0) return 1
  const maxId = items.reduce((max, item) => {
    const numId = Number(item?.id)
    return Number.isFinite(numId) && numId > max ? numId : max
  }, 0)
  return maxId + 1
}
