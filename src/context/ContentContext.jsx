import { useLocation } from 'react-router-dom'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { defaultContent } from '../data/defaultContent'
import { musicAsset } from '../data/musicAsset'
import { getSeedContent, mergeContent, nextItemId } from '../utils/contentMerge'
import { applySiteTheme } from '../utils/theme'
import { useTranslation } from '../utils/i18n'
import ThemeApplier from '../components/ThemeApplier'
import {
  isAudioFile,
  loadSiteContent,
  saveRemoteContent,
  setAdminPasswordForSync,
  uploadAsset,
  deleteAsset,
  verifySitePassword,
  verifyAdminPassword,
} from '../utils/supabaseContent'
import { compressImageToUnder90KB } from '../utils/imageCompressor'
import { compressAudioToUnder4MB } from '../utils/audioCompressor'

function getSlugFromCurrentPath() {
  if (typeof window === 'undefined') return ''
  const parts = window.location.pathname.split('/').filter(Boolean)
  if (parts.length === 0) return ''
  if (parts[0] === 'soulove-admin' || parts[0] === 'api' || parts[0] === 'dashboard') return ''
  return parts[0]
}

function createInitialContent() {
  const slug = getSlugFromCurrentPath()
  if (slug) {
    const cached = readCache(slug)
    if (cached) return cached
    const cachedLang = typeof localStorage !== 'undefined' ? localStorage.getItem(`soulove-lang-${slug}`) : null
    if (cachedLang) return getSeedContent(cachedLang)
  }
  return getSeedContent()
}

function resolveMusicSrc(content) {
  if (!content?.music?.src) return ''
  const src = String(content.music.src).trim()
  if (!src) return ''

  if (src.startsWith('http') || src.startsWith('/uploads/') || src.startsWith('data:')) {
    return src
  }

  return musicAsset || ''
}

// ─── Cache helpers ────────────────────────────────────────────────────────────
function readCache(slug) {
  if (!slug) return null
  try {
    const raw = localStorage.getItem(`soulove-cache-${slug}`)
    return raw ? mergeContent(JSON.parse(raw)) : null
  } catch { return null }
}

function writeCache(slug, data) {
  if (!slug || !data) return
  try { 
    localStorage.setItem(`soulove-cache-${slug}`, JSON.stringify(data))
    if (data.language) {
      localStorage.setItem(`soulove-lang-${slug}`, data.language)
    }
  } catch { /* quota full */ }
}
// ──────────────────────────────────────────────────────────────────────────────

export function ContentProvider({ children }) {
  const [content, setContent] = useState(createInitialContent)
  const [syncStatus, setSyncStatus] = useState('loading')
  const isLoading = syncStatus === 'loading'
  const [syncError, setSyncError] = useState('')

  const { t, code: langCode, isRtl } = useTranslation(content?.language || 'ar')

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr'
    document.documentElement.lang = langCode
  }, [isRtl, langCode])
  const [musicUploadingIndex, setMusicUploadingIndex] = useState(null)
  const [musicUploadError, setMusicUploadError] = useState(null)
  const contentRef = useRef(content)
  const [persistedContent, setPersistedContent] = useState(content)
  const persistedContentRef = useRef(content)

  const isDirty = useMemo(() => {
    if (!content || !persistedContent) return false
    return JSON.stringify(content) !== JSON.stringify(persistedContent)
  }, [content, persistedContent])

  useEffect(() => {
    contentRef.current = content
  }, [content])

  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // Keep history synchronized with content updates
  useEffect(() => {
    if (!content) return

    const timer = setTimeout(() => {
      setHistory((prev) => {
        const nextHistory = prev.slice(0, historyIndex + 1)
        if (nextHistory.length > 0 && nextHistory[nextHistory.length - 1] === content) {
          return prev
        }
        const updated = [...nextHistory, content].slice(-30)
        setHistoryIndex(updated.length - 1)
        return updated
      })
    }, 1200)

    return () => clearTimeout(timer)
  }, [content, historyIndex])

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1
      setHistoryIndex(prevIndex)
      setContent(history[prevIndex])
      contentRef.current = history[prevIndex]
    }
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1
      setHistoryIndex(nextIndex)
      setContent(history[nextIndex])
      contentRef.current = history[nextIndex]
    }
  }, [history, historyIndex])

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  const userEditedRef = useRef(false)

  const patchContent = useCallback((updater) => {
    userEditedRef.current = true
    setContent((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      const merged = mergeContent(next)
      contentRef.current = merged
      return merged
    })
    setSyncStatus((status) => (status === 'error' ? 'error' : 'ready'))
  }, [])

  const applyLoadedContent = useCallback((remote, slug) => {
    applySiteTheme(remote.appearance)
    persistedContentRef.current = remote
    setPersistedContent(remote)
    if (!userEditedRef.current) {
      contentRef.current = remote
      setContent(remote)
    }
    setSyncStatus('ready')
    setSyncError('')
    if (slug) writeCache(slug, remote)
  }, [])

  const location = useLocation()

  const getClientSlug = useCallback(() => {
    const parts = location.pathname.split('/').filter(Boolean)
    if (parts.length === 0) return ''
    if (parts[0] === 'soulove-admin' || parts[0] === 'api' || parts[0] === 'dashboard') return ''
    return parts[0]
  }, [location.pathname])

  const [siteNotFound, setSiteNotFound] = useState(false)

  const loadFromDatabase = useCallback(async () => {
    const slug = getClientSlug()
    if (!slug) {
      setSiteNotFound(true)
      setSyncStatus('ready')
      return null
    }

    setSyncStatus('loading')
    setSyncError('')

    try {
      const remote = await loadSiteContent(slug)
      if (remote && !remote.siteNotFound) {
        setSiteNotFound(false)
        applyLoadedContent(remote, slug)
      } else {
        if (remote && remote.siteNotFound) {
          setContent((prev) => ({ ...prev, language: remote.language }))
        }
        setSiteNotFound(true)
        setSyncStatus('ready')
      }
      return remote
    } catch (error) {
      setSyncStatus('error')
      setSyncError(error.message || 'تعذّر تحميل المحتوى')
      if (!contentRef.current) {
        setSiteNotFound(true)
      }
      throw error
    }
  }, [applyLoadedContent, getClientSlug])

  useEffect(() => {
    const slug = getClientSlug()
    const parts = location.pathname.split('/').filter(Boolean)
    const isRootAdmin = parts[0] === 'soulove-admin' || parts[0] === 'api'

    setSiteNotFound(false)
    setHistory([])
    setHistoryIndex(-1)

    if (!slug || isRootAdmin) {
      const seed = getSeedContent()
      setContent(seed)
      setPersistedContent(seed)
      setSyncStatus('ready')
      return
    }

    // 1️⃣ Show cached content IMMEDIATELY (zero delay)
    const cached = readCache(slug)
    if (cached) {
      applySiteTheme(cached.appearance)
      contentRef.current = cached
      persistedContentRef.current = cached
      setContent(cached)
      setPersistedContent(cached)
      setSyncStatus('refreshing')
    } else {
      // No cache yet — show seed in the remembered language while fetching
      const cachedLang = typeof localStorage !== 'undefined' ? localStorage.getItem(`soulove-lang-${slug}`) : null
      const seed = getSeedContent(cachedLang || 'ar')
      setContent(seed)
      setPersistedContent(seed)
      setSyncStatus('loading')
    }

    // 2️⃣ Fetch fresh data silently in the background
    loadFromDatabase().catch(() => { })
  }, [location.pathname, loadFromDatabase, getClientSlug])

  // ⚡ Background Image Preloader — Pre-caches all memory & gallery photos instantly
  useEffect(() => {
    if (!content) return
    const imagesToPreload = [
      ...(content.memories || []).map((m) => m.image || m.url),
      ...(content.galleryItems || []).map((g) => g.image || g.url),
    ].filter((src) => Boolean(src && typeof src === 'string' && src.trim()))

    imagesToPreload.forEach((src) => {
      const img = new Image()
      img.src = src
    })
  }, [content])

  const dirtySectionsRef = useRef(new Set())

  const saveChanges = useCallback(async (password) => {
    const slug = getClientSlug()
    if (!slug) {
      const message = 'معرف الموقع غير موضح في الرابط'
      setSyncError(message)
      throw new Error(message)
    }

    if (!password) {
      const message = 'سجّل خروج ثم ادخل من جديد بكلمة المرور الحالية'
      setSyncError(message)
      throw new Error(message)
    }

    const snapshot = {
      ...contentRef.current,
      _dirtySections: Array.from(dirtySectionsRef.current),
    }
    setSyncStatus('saving')
    setSyncError('')

    try {
      await saveRemoteContent(snapshot, password, slug)
      persistedContentRef.current = contentRef.current
      setPersistedContent(contentRef.current)
      userEditedRef.current = false
      dirtySectionsRef.current.clear()
      if (slug) writeCache(slug, contentRef.current)

      let nextLoginPassword = null
      if (snapshot.adminPassword) {
        if (snapshot.adminPassword !== password) {
          nextLoginPassword = snapshot.adminPassword
        }
      } else if (snapshot.password) {
        if (snapshot.password !== password) {
          nextLoginPassword = snapshot.password
        }
      }

      if (nextLoginPassword) {
        setAdminPasswordForSync(nextLoginPassword, slug)
      }

      setSyncStatus('ready')
      return { nextLoginPassword }
    } catch (error) {
      setSyncStatus('error')
      if (error.message === 'invalid_password') {
        const message =
          'جلسة الدخول قديمة أو كلمة المرور اتغيّرت — سجّل خروج وادخل بالكلمة الحالية في قاعدة البيانات'
        setSyncError(message)
        throw Object.assign(new Error(message), { code: 'invalid_password' })
      }
      setSyncError(error.message || 'فشل الحفظ على Supabase')
      throw error
    }
  }, [])

  const verifyPassword = useCallback(async (password) => {
    const clean = String(password || '').trim()
    const slug = getClientSlug()
    if (slug) {
      const serverValid = await verifySitePassword(clean, slug)
      if (serverValid) return true
    }
    const expected = (persistedContentRef.current?.password || persistedContentRef.current?.adminPassword || 'soulove').trim()
    return clean === expected
  }, [getClientSlug])

  const verifyAdminPasswordFn = useCallback(async (password) => {
    const clean = String(password || '').trim()
    const slug = getClientSlug()
    if (slug) {
      const serverValid = await verifyAdminPassword(clean, slug)
      if (serverValid) return true
    }
    const expected = (persistedContentRef.current?.adminPassword || persistedContentRef.current?.password || 'soulove').trim()
    return clean === expected
  }, [getClientSlug])

  const updateField = useCallback(
    (section, field, value) => {
      patchContent((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }))
    },
    [patchContent],
  )

  const updateNestedField = useCallback(
    (section, nested, field, value) => {
      patchContent((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [nested]: {
            ...prev[section][nested],
            [field]: value,
          },
        },
      }))
    },
    [patchContent],
  )

  const updateRoot = useCallback(
    (field, value) => {
      patchContent((prev) => {
        if (typeof field === 'function') {
          return field(prev)
        }
        return { ...prev, [field]: value }
      })
    },
    [patchContent],
  )

  const addCountdown = useCallback(() => {
    patchContent((prev) => {
      const copy = [...(prev?.countdowns || [])]
      const id = `cnt-${Date.now()}`
      copy.push({
        id,
        title: 'مناسبة جديدة 🎂',
        date: new Date().toISOString().split('T')[0],
        time: '00:00',
        description: 'كل ثانية بتمر بتقربنا أكتر للمناسبة الحلوة دي 💖',
      })
      return { ...prev, countdowns: copy }
    })
  }, [patchContent])

  const updateCountdown = useCallback((index, field, val) => {
    patchContent((prev) => {
      const copy = [...(prev?.countdowns || [])]
      if (!copy[index]) return prev
      copy[index] = { ...copy[index], [field]: val }
      return { ...prev, countdowns: copy }
    })
  }, [patchContent])

  const removeCountdown = useCallback((index) => {
    patchContent((prev) => {
      const copy = (prev?.countdowns || []).filter((_, i) => i !== index)
      return { ...prev, countdowns: copy }
    })
  }, [patchContent])

  const updateDate = useCallback(
    (field, value) => {
      patchContent((prev) => ({
        ...prev,
        dates: { ...prev.dates, [field]: value },
      }))
    },
    [patchContent],
  )

  const updateMemory = useCallback(
    (id, patch) => {
      dirtySectionsRef.current.add('memories')
      patchContent((prev) => ({
        ...prev,
        memories: (prev.memories ?? []).map((memory) =>
          Number(memory.id) === Number(id) ? { ...memory, ...patch } : memory,
        ),
      }))
    },
    [patchContent],
  )

  const addMemory = useCallback(() => {
    dirtySectionsRef.current.add('memories')
    patchContent((prev) => {
      const currentList = prev.memories ?? []
      const id = nextItemId(currentList)
      return {
        ...prev,
        memories: [...currentList, { id, image: '', date: '', text: '' }],
      }
    })
  }, [patchContent])

  const removeMemory = useCallback(
    (id) => {
      dirtySectionsRef.current.add('memories')
      const target = (contentRef.current?.memories ?? []).find((m) => Number(m.id) === Number(id))
      if (target?.image) {
        deleteAsset(target.image, getClientSlug()).catch(() => {})
      }
      patchContent((prev) => ({
        ...prev,
        memories: (prev.memories ?? []).filter((memory) => Number(memory.id) !== Number(id)),
      }))
    },
    [patchContent, getClientSlug],
  )

  const updateGalleryItem = useCallback(
    (id, patch) => {
      dirtySectionsRef.current.add('galleryItems')
      patchContent((prev) => ({
        ...prev,
        galleryItems: (prev.galleryItems ?? []).map((item) =>
          Number(item.id) === Number(id) ? { ...item, ...patch } : item,
        ),
      }))
    },
    [patchContent],
  )

  const addGalleryItem = useCallback(() => {
    dirtySectionsRef.current.add('galleryItems')
    patchContent((prev) => {
      const currentList = prev.galleryItems ?? []
      const id = nextItemId(currentList)
      return {
        ...prev,
        galleryItems: [
          ...currentList,
          { id, image: '', date: '', text: '' },
        ],
      }
    })
  }, [patchContent])

  const removeGalleryItem = useCallback(
    (id) => {
      dirtySectionsRef.current.add('galleryItems')
      const target = (contentRef.current?.galleryItems ?? []).find((item) => Number(item.id) === Number(id))
      const imageUrl = target?.url || target?.image
      if (imageUrl) {
        deleteAsset(imageUrl, getClientSlug()).catch(() => {})
      }
      patchContent((prev) => ({
        ...prev,
        galleryItems: (prev.galleryItems ?? []).filter((item) => Number(item.id) !== Number(id)),
      }))
    },
    [patchContent, getClientSlug],
  )

  const updateWishlistItem = useCallback(
    (id, patch) => {
      dirtySectionsRef.current.add('wishlist')
      patchContent((prev) => ({
        ...prev,
        wishlist: (prev.wishlist ?? []).map((item) =>
          Number(item.id) === Number(id) ? { ...item, ...patch } : item,
        ),
      }))
    },
    [patchContent],
  )

  const addWishlistItem = useCallback((text = '') => {
    dirtySectionsRef.current.add('wishlist')
    patchContent((prev) => {
      const currentList = prev.wishlist ?? []
      const id = nextItemId(currentList)
      return {
        ...prev,
        wishlist: [
          ...currentList,
          { id, text: typeof text === 'string' ? text : '', completed: false },
        ],
      }
    })
  }, [patchContent])

  const removeWishlistItem = useCallback(
    (id) => {
      dirtySectionsRef.current.add('wishlist')
      patchContent((prev) => ({
        ...prev,
        wishlist: (prev.wishlist ?? []).filter((item) => Number(item.id) !== Number(id)),
      }))
    },
    [patchContent],
  )

  const toggleWishlistItem = useCallback(
    (id) => {
      dirtySectionsRef.current.add('wishlist')
      patchContent((prev) => ({
        ...prev,
        wishlist: (prev.wishlist ?? []).map((item) =>
          item.id === id ? { ...item, completed: !item.completed } : item,
        ),
      }))
    },
    [patchContent],
  )


  const uploadMemoryImage = useCallback(
    async (id, file) => {
      const slug = getClientSlug()
      const compressedFile = await compressImageToUnder90KB(file)
      let localPreview = ''
      try {
        if (compressedFile && typeof URL !== 'undefined' && URL.createObjectURL) {
          localPreview = URL.createObjectURL(compressedFile)
        }
      } catch {}

      if (localPreview) {
        patchContent((prev) => ({
          ...prev,
          memories: prev.memories.map((memory) =>
            memory.id === id ? { ...memory, image: localPreview } : memory,
          ),
        }))
      }

      const image = await uploadAsset(compressedFile, 'memories', slug)
      patchContent((prev) => ({
        ...prev,
        memories: prev.memories.map((memory) =>
          memory.id === id ? { ...memory, image } : memory,
        ),
      }))
      return image
    },
    [patchContent, getClientSlug],
  )

  const uploadGalleryImage = useCallback(
    async (id, file) => {
      const slug = getClientSlug()
      const compressedFile = await compressImageToUnder90KB(file)
      let localPreview = ''
      try {
        if (compressedFile && typeof URL !== 'undefined' && URL.createObjectURL) {
          localPreview = URL.createObjectURL(compressedFile)
        }
      } catch {}

      if (localPreview) {
        patchContent((prev) => ({
          ...prev,
          galleryItems: (prev.galleryItems ?? []).map((item) =>
            item.id === id ? { ...item, image: localPreview, url: localPreview } : item,
          ),
        }))
      }

      const image = await uploadAsset(compressedFile, 'gallery', slug)
      patchContent((prev) => ({
        ...prev,
        galleryItems: (prev.galleryItems ?? []).map((item) =>
          item.id === id ? { ...item, image, url: image } : item,
        ),
      }))
      return image
    },
    [patchContent, getClientSlug],
  )

  const getInitialTracks = useCallback((musicObj) => {
    const tracks = musicObj?.tracks || []
    if (tracks.length > 0) return [...tracks]
    if (musicObj?.src) {
      return [{
        id: 'default',
        title: musicObj.title || 'أغنيتنا',
        fileName: musicObj.fileName || 'romantic.mp3',
        src: musicObj.src,
      }]
    }
    return [{
      id: 'track-1',
      title: 'أغنية 1',
      fileName: '',
      src: '',
    }]
  }, [])

  const addMusicTrack = useCallback((options = {}) => {
    patchContent((prev) => {
      const currentTracks = getInitialTracks(prev.music)
      if (currentTracks.length >= 7) return prev
      const isVoice = Boolean(options?.isVoice)
      const newTrack = {
        id: `track-${Date.now()}`,
        title: isVoice ? 'رسالة بصوتي 🎙️' : `أغنية ${currentTracks.length + 1}`,
        fileName: '',
        src: '',
        isVoice,
      }
      return {
        ...prev,
        music: {
          ...prev.music,
          tracks: [...currentTracks, newTrack],
        },
      }
    })
  }, [patchContent, getInitialTracks])

  const uploadMusic = useCallback(
    async (file, index = 0, durationSeconds = 0) => {
      // Reset mode: clear the track src to allow re-recording/re-uploading
      if (!file) {
        patchContent((prev) => {
          const tracks = [...getInitialTracks(prev.music)]
          if (tracks[index]) {
            tracks[index] = {
              ...tracks[index],
              src: '',
              fileName: '',
              sizeBytes: 0,
            }
          }
          const firstActiveTrack = tracks.find((t) => t.src)
          return {
            ...prev,
            music: {
              ...prev.music,
              src: firstActiveTrack ? firstActiveTrack.src : '',
              fileName: firstActiveTrack ? firstActiveTrack.fileName : '',
              title: firstActiveTrack ? firstActiveTrack.title : prev.music?.title || '',
              tracks,
            },
          }
        })
        return ''
      }

      const SINGLE_MAX_SIZE = 9 * 1024 * 1024 // 9 MB
      const TOTAL_MAX_SIZE = 40 * 1024 * 1024 // 40 MB

      if (file.size > SINGLE_MAX_SIZE) {
        const message = 'حجم ملف الأغنية يفضل ألا يتجاوز 9 ميجابايت'
        setMusicUploadError({ index, message })
        throw new Error(message)
      }

      // Check total size limit (40MB across all 7 tracks)
      const currentTracks = getInitialTracks(contentRef.current?.music)
      let totalOtherSize = 0
      currentTracks.forEach((tr, idx) => {
        if (idx !== index && tr.sizeBytes) {
          totalOtherSize += tr.sizeBytes
        }
      })

      const remainingBudget = TOTAL_MAX_SIZE - totalOtherSize
      if (file.size > remainingBudget) {
        const remainingMB = Math.max(0, (remainingBudget / (1024 * 1024))).toFixed(1)
        const message = `مجموع الأغاني يتجاوز المسموح (المتبقي لك ${remainingMB} ميجابايت من أصل 40 MB إجمالاً)`
        setMusicUploadError({ index, message })
        throw new Error(message)
      }

      if (!isAudioFile(file)) {
        const message = 'الملف لازم يكون صوت (mp3, m4a, wav, ogg, flac...)'
        setMusicUploadError({ index, message })
        throw new Error(message)
      }

      setMusicUploadingIndex(index)
      setMusicUploadError(null)

      try {
        let localUrl = ''
        try {
          if (file && typeof URL !== 'undefined' && URL.createObjectURL) {
            localUrl = URL.createObjectURL(file)
          }
        } catch {}

        const slug = getClientSlug()
        const uploadFile = await compressAudioToUnder4MB(file)
        const url = await uploadAsset(uploadFile, 'music', slug)
        patchContent((prev) => {
          const tracks = getInitialTracks(prev.music)
          const reportedDuration = durationSeconds || file.durationSeconds || 0
          tracks[index] = {
            ...tracks[index],
            title: tracks[index]?.title || file.name?.split('.').slice(0, -1).join('.') || `أغنية ${index + 1}`,
            fileName: file.name || 'مقطع صوتي',
            src: url,
            localUrl: localUrl || url,
            sizeBytes: file.size,
            ...(reportedDuration ? { duration: reportedDuration } : {}),
          }

          const firstActiveTrack = tracks.find((t) => t.src)
          return {
            ...prev,
            music: {
              ...prev.music,
              src: firstActiveTrack ? firstActiveTrack.src : '',
              fileName: firstActiveTrack ? firstActiveTrack.fileName : '',
              title: firstActiveTrack ? firstActiveTrack.title : '',
              tracks,
            },
          }
        })
        return url
      } catch (error) {
        const message = error.message || 'فشل رفع الأغنية'
        setMusicUploadError({ index, message })
        throw new Error(message)
      } finally {
        setMusicUploadingIndex(null)
      }
    },
    [patchContent, getInitialTracks, getClientSlug],
  )

  const removeMusic = useCallback(
    (index = 0) => {
      const currentTracks = getInitialTracks(contentRef.current?.music)
      const targetTrack = currentTracks[index]
      if (targetTrack?.src) {
        deleteAsset(targetTrack.src, getClientSlug()).catch(() => {})
      }
      patchContent((prev) => {
        const tracksList = getInitialTracks(prev.music)
        const updated = tracksList.filter((_, idx) => idx !== index)
        const firstActiveTrack = updated.find((t) => t.src)
        return {
          ...prev,
          music: {
            ...prev.music,
            src: firstActiveTrack ? firstActiveTrack.src : '',
            fileName: firstActiveTrack ? firstActiveTrack.fileName : '',
            title: firstActiveTrack ? firstActiveTrack.title : '',
            tracks: updated.length > 0 ? updated : [{ id: 'track-1', title: 'أغنية 1', fileName: '', src: '' }],
          },
        }
      })
    },
    [patchContent, getInitialTracks, getClientSlug],
  )

  const updateMusicTrackTitle = useCallback(
    (index, title) => {
      patchContent((prev) => {
        const currentTracks = getInitialTracks(prev.music)
        currentTracks[index] = {
          ...currentTracks[index],
          title,
        }

        const firstActiveTrack = currentTracks.find((t) => t.src)
        return {
          ...prev,
          music: {
            ...prev.music,
            title: firstActiveTrack ? firstActiveTrack.title : (index === 0 ? title : (prev.music?.title || title)),
            tracks: currentTracks,
          },
        }
      })
    },
    [patchContent, getInitialTracks],
  )

  const musicSrc = resolveMusicSrc(content)

  const value = useMemo(
    () => ({
      content,
      musicSrc,
      isLoading,
      siteNotFound,
      isDirty,
      syncStatus,
      syncError,
      musicUploadingIndex,
      musicUploadError,
      verifyPassword,
      verifyAdminPassword: verifyAdminPasswordFn,
      updateField,
      updateNestedField,
      updateRoot,
      updateDate,
      updateMemory,
      addMemory,
      removeMemory,
      updateGalleryItem,
      addGalleryItem,
      removeGalleryItem,
      updateWishlistItem,
      addWishlistItem,
      removeWishlistItem,
      toggleWishlistItem,
      uploadMemoryImage,
      uploadGalleryImage,
      addCountdown,
      updateCountdown,
      removeCountdown,
      addMusicTrack,
      uploadMusic,
      removeMusic,
      updateMusicTrackTitle,
      saveChanges,
      loadFromDatabase,
      undo,
      redo,
      canUndo,
      canRedo,
      getClientSlug,
      t,
      langCode,
      isRtl,
    }),
    [
      content,
      musicSrc,
      isLoading,
      isDirty,
      syncStatus,
      syncError,
      musicUploadingIndex,
      musicUploadError,
      verifyPassword,
      verifyAdminPasswordFn,
      updateField,
      updateNestedField,
      updateRoot,
      addCountdown,
      updateCountdown,
      removeCountdown,
      updateDate,
      updateMemory,
      addMemory,
      removeMemory,
      updateGalleryItem,
      addGalleryItem,
      removeGalleryItem,
      updateWishlistItem,
      addWishlistItem,
      removeWishlistItem,
      toggleWishlistItem,
      uploadMemoryImage,
      uploadGalleryImage,
      uploadMusic,
      removeMusic,
      updateMusicTrackTitle,
      saveChanges,
      loadFromDatabase,
      undo,
      redo,
      canUndo,
      canRedo,
      getClientSlug,
      t,
      langCode,
      isRtl,
    ],
  )

  return (
    <ContentContext.Provider value={value}>
      <ThemeApplier appearance={content.appearance} />
      {children}
    </ContentContext.Provider>
  )
}

export function useContent() {
  const context = useContext(ContentContext)
  if (!context) {
    throw new Error('useContent must be used within ContentProvider')
  }
  return context
}
