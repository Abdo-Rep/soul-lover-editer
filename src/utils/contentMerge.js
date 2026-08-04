import { defaultContent } from '../data/defaultContent'
import { normalizeAppearance } from './theme'

function withoutTrailingHeart(text) {
  if (typeof text !== 'string') return text
  return text.replace(/\s*(?:❤️|❤|♥|💕|💖|💗|💓|💝)\s*$/u, '').trimEnd()
}

function mergeSection(base, patch) {
  if (!patch) return base
  if (Array.isArray(base)) return patch
  return { ...base, ...patch }
}

function resolveGalleryItems(stored) {
  if (Array.isArray(stored.galleryItems) && stored.galleryItems.length > 0) {
    return stored.galleryItems
  }

  const fromMemories = (stored.memories ?? []).filter((item) =>
    item.image?.startsWith('http'),
  )

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
  let currentMax = 0
  items.forEach((item) => {
    const numId = Number(item?.id)
    if (Number.isFinite(numId) && numId > currentMax) {
      currentMax = numId
    }
  })
  return items.map((item, index) => {
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
  if (url.includes('/storage/v1/object/public/')) {
    const parts = url.split('/storage/v1/object/public/')
    if (parts.length > 1) {
      return `/api/storage/${parts[1]}`
    }
  }
  return url
}

export function mergeContent(stored) {
  if (!stored || Object.keys(stored).length === 0) {
    return structuredClone(defaultContent)
  }

  const mergedMusic = mergeSection(defaultContent.music, stored.music)
  const sanitizedMusic = {
    ...mergedMusic,
    src: sanitizeMediaUrl(mergedMusic.src),
    tracks: (mergedMusic.tracks || []).map((t) => ({
      ...t,
      src: sanitizeMediaUrl(t.src),
    })),
  }

  return {
    ...defaultContent,
    ...stored,
    siteName: stored.siteName || defaultContent.siteName,
    password: stored.password ?? '',
    adminPassword: stored.adminPassword ?? '',
    dates: mergeSection(defaultContent.dates, stored.dates),
    music: sanitizedMusic,
    login: mergeSection(defaultContent.login, stored.login),
    welcome: mergeSection(defaultContent.welcome, stored.welcome),
    story: {
      ...defaultContent.story,
      ...stored.story,
      memoriesButton: stored.story?.memoriesButton ?? defaultContent.story.memoriesButton,
      firstMeeting: mergeSection(
        defaultContent.story.firstMeeting,
        stored.story?.firstMeeting,
      ),
      loveConfession: mergeSection(
        defaultContent.story.loveConfession,
        stored.story?.loveConfession,
      ),
    },
    gallery: mergeSection(defaultContent.gallery, stored.gallery),
    final: mergeSection(defaultContent.final, stored.final),
    appearance: normalizeAppearance({
      ...defaultContent.appearance,
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
    wishlist: ensureUniqueIds(Array.isArray(stored.wishlist) ? stored.wishlist : defaultContent.wishlist),
    countdowns: ensureUniqueIds(Array.isArray(stored.countdowns) ? stored.countdowns : []),
    countdownsNextButton: stored.countdownsNextButton ?? defaultContent.countdownsNextButton,
  }
}

export function getSeedContent() {
  return structuredClone(defaultContent)
}

export function nextItemId(items = []) {
  if (!Array.isArray(items) || items.length === 0) return 1
  const maxId = items.reduce((max, item) => {
    const numId = Number(item?.id)
    return Number.isFinite(numId) && numId > max ? numId : max
  }, 0)
  return maxId + 1
}
