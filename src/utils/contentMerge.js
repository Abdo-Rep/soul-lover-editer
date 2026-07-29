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

export function mergeContent(stored) {
  if (!stored || Object.keys(stored).length === 0) {
    return structuredClone(defaultContent)
  }

  return {
    ...defaultContent,
    ...stored,
    siteName: stored.siteName || defaultContent.siteName,
    password: stored.password ?? '',
    adminPassword: stored.adminPassword ?? '',
    dates: mergeSection(defaultContent.dates, stored.dates),
    music: mergeSection(defaultContent.music, stored.music),
    login: mergeSection(defaultContent.login, stored.login),
    welcome: mergeSection(defaultContent.welcome, stored.welcome),
    story: {
      ...defaultContent.story,
      ...stored.story,
      memoriesButton: withoutTrailingHeart(
        stored.story?.memoriesButton ?? defaultContent.story.memoriesButton,
      ),
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
    memories: stored.memories ?? [],
    galleryItems: resolveGalleryItems(stored),
    wishlist: Array.isArray(stored.wishlist) ? stored.wishlist : defaultContent.wishlist,
  }
}

export function getSeedContent() {
  return structuredClone(defaultContent)
}

export function nextItemId(items) {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1
}
