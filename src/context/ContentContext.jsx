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
import { isSupabaseConfigured } from '../lib/supabase'
import { getSeedContent, nextItemId } from '../utils/contentMerge'
import { applySiteTheme } from '../utils/theme'
import ThemeApplier from '../components/ThemeApplier'
import {
  isAudioFile,
  loadSiteContent,
  saveRemoteContent,
  setAdminPasswordForSync,
  uploadAsset,
  verifySitePassword,
} from '../utils/supabaseContent'

const ContentContext = createContext(null)

function createInitialContent() {
  return getSeedContent()
}

function resolveMusicSrc(content) {
  if (content.music.src === '') return ''

  if (content.music.src?.startsWith('http')) {
    const version = encodeURIComponent(content.music.fileName || 'track')
    const joiner = content.music.src.includes('?') ? '&' : '?'
    return `${content.music.src}${joiner}v=${version}`
  }

  return musicAsset || ''
}

export function ContentProvider({ children }) {
  const [content, setContent] = useState(createInitialContent)
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured)
  const [syncStatus, setSyncStatus] = useState(
    isSupabaseConfigured ? 'loading' : 'error',
  )
  const [syncError, setSyncError] = useState(
    isSupabaseConfigured ? '' : 'تعذّر الاتصال بالخادم',
  )
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
        if (historyIndex >= 0 && JSON.stringify(prev[historyIndex]) === JSON.stringify(content)) {
          return prev
        }
        const nextHistory = prev.slice(0, historyIndex + 1)
        if (nextHistory.length > 0 && JSON.stringify(nextHistory[nextHistory.length - 1]) === JSON.stringify(content)) {
          return prev
        }
        const updated = [...nextHistory, content].slice(-50)
        setHistoryIndex(updated.length - 1)
        return updated
      })
    }, 400)

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

  const patchContent = useCallback((updater) => {
    setContent((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      contentRef.current = next
      return next
    })
    setSyncStatus((status) => (status === 'error' ? 'error' : 'ready'))
  }, [])

  const applyLoadedContent = useCallback((remote) => {
    applySiteTheme(remote.appearance)
    contentRef.current = remote
    persistedContentRef.current = remote
    setPersistedContent(remote)
    setContent(remote)
    setSyncStatus('ready')
    setSyncError('')
  }, [])

  const loadFromDatabase = useCallback(async () => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase غير مُعدّ')
    }

    setSyncStatus('loading')
    setSyncError('')

    try {
      const remote = await loadSiteContent()
      applyLoadedContent(remote)
      return remote
    } catch (error) {
      setSyncStatus('error')
      setSyncError(error.message || 'تعذّر تحميل المحتوى من Supabase')
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [applyLoadedContent])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false)
      return
    }

    loadFromDatabase().catch(() => { })
  }, [loadFromDatabase])

  const saveChanges = useCallback(async (password) => {
    if (!isSupabaseConfigured) {
      const message = 'Supabase غير مُعدّ — لا يمكن الحفظ'
      setSyncError(message)
      throw new Error(message)
    }

    if (!password) {
      const message = 'سجّل خروج ثم ادخل من جديد بكلمة المرور الحالية'
      setSyncError(message)
      throw new Error(message)
    }

    const snapshot = contentRef.current
    setSyncStatus('saving')
    setSyncError('')

    try {
      await saveRemoteContent(snapshot, password)
      persistedContentRef.current = snapshot
      setPersistedContent(snapshot)

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
        setAdminPasswordForSync(nextLoginPassword)
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
    const expected = persistedContentRef.current?.adminPassword || persistedContentRef.current?.password || 'ThisIsLove'
    return password === expected
  }, [])

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
      patchContent((prev) => ({ ...prev, [field]: value }))
    },
    [patchContent],
  )

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
      patchContent((prev) => ({
        ...prev,
        memories: prev.memories.map((memory) =>
          memory.id === id ? { ...memory, ...patch } : memory,
        ),
      }))
    },
    [patchContent],
  )

  const addMemory = useCallback(() => {
    patchContent((prev) => {
      const id = nextItemId(prev.memories)
      return {
        ...prev,
        memories: [...prev.memories, { id, image: '', date: '', text: '' }],
      }
    })
  }, [patchContent])

  const removeMemory = useCallback(
    (id) => {
      patchContent((prev) => ({
        ...prev,
        memories: prev.memories.filter((memory) => memory.id !== id),
      }))
    },
    [patchContent],
  )

  const updateGalleryItem = useCallback(
    (id, patch) => {
      patchContent((prev) => ({
        ...prev,
        galleryItems: (prev.galleryItems ?? []).map((item) =>
          item.id === id ? { ...item, ...patch } : item,
        ),
      }))
    },
    [patchContent],
  )

  const addGalleryItem = useCallback(() => {
    patchContent((prev) => {
      const id = nextItemId(prev.galleryItems ?? [])
      return {
        ...prev,
        galleryItems: [
          ...(prev.galleryItems ?? []),
          { id, image: '', date: '', text: '' },
        ],
      }
    })
  }, [patchContent])

  const removeGalleryItem = useCallback(
    (id) => {
      patchContent((prev) => ({
        ...prev,
        galleryItems: (prev.galleryItems ?? []).filter((item) => item.id !== id),
      }))
    },
    [patchContent],
  )

  const updateWishlistItem = useCallback(
    (id, patch) => {
      patchContent((prev) => ({
        ...prev,
        wishlist: (prev.wishlist ?? []).map((item) =>
          item.id === id ? { ...item, ...patch } : item,
        ),
      }))
    },
    [patchContent],
  )

  const addWishlistItem = useCallback((text = '') => {
    patchContent((prev) => {
      const id = nextItemId(prev.wishlist ?? [])
      return {
        ...prev,
        wishlist: [
          ...(prev.wishlist ?? []),
          { id, text, completed: false },
        ],
      }
    })
  }, [patchContent])

  const removeWishlistItem = useCallback(
    (id) => {
      patchContent((prev) => ({
        ...prev,
        wishlist: (prev.wishlist ?? []).filter((item) => item.id !== id),
      }))
    },
    [patchContent],
  )

  const toggleWishlistItem = useCallback(
    (id) => {
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
      const image = await uploadAsset(file, 'story')
      patchContent((prev) => ({
        ...prev,
        memories: prev.memories.map((memory) =>
          memory.id === id ? { ...memory, image } : memory,
        ),
      }))
      return image
    },
    [patchContent],
  )

  const uploadGalleryImage = useCallback(
    async (id, file) => {
      const image = await uploadAsset(file, 'gallery')
      patchContent((prev) => ({
        ...prev,
        galleryItems: (prev.galleryItems ?? []).map((item) =>
          item.id === id ? { ...item, image } : item,
        ),
      }))
      return image
    },
    [patchContent],
  )

  const getInitialTracks = useCallback((musicObj) => {
    const tracks = musicObj?.tracks || []
    const result = []
    const targetCount = Math.max(20, tracks.length)
    for (let i = 0; i < targetCount; i++) {
      if (tracks[i]) {
        result.push(tracks[i])
      } else if (i === 0 && musicObj?.src) {
        result.push({
          id: 'default',
          title: musicObj.title || 'أغنيتنا',
          fileName: musicObj.fileName || 'romantic.mp3',
          src: musicObj.src,
        })
      } else {
        result.push({
          id: `track-slot-${i}`,
          title: `أغنية ${i + 1}`,
          fileName: '',
          src: '',
        })
      }
    }
    return result
  }, [])

  const uploadMusic = useCallback(
    async (file, index = 0) => {
      const MAX_AUDIO_SIZE = 12 * 1024 * 1024 // 12 MB
      if (file.size > MAX_AUDIO_SIZE) {
        const message = 'حجم ملف الأغنية أكثر من 12 ميجابايت (الحد الأقصى 12 MB)'
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
        const url = await uploadAsset(file, 'music')
        patchContent((prev) => {
          const currentTracks = getInitialTracks(prev.music)
          currentTracks[index] = {
            ...currentTracks[index],
            title: currentTracks[index]?.title || file.name.split('.').slice(0, -1).join('.') || `أغنية ${index + 1}`,
            fileName: file.name,
            src: url,
          }

          const firstActiveTrack = currentTracks.find((t) => t.src)
          const mainSrc = firstActiveTrack ? firstActiveTrack.src : ''
          const mainFileName = firstActiveTrack ? firstActiveTrack.fileName : ''
          const mainTitle = firstActiveTrack ? firstActiveTrack.title : ''

          return {
            ...prev,
            music: {
              ...prev.music,
              src: mainSrc,
              fileName: mainFileName,
              title: mainTitle,
              tracks: currentTracks,
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
    [patchContent, getInitialTracks],
  )

  const removeMusic = useCallback(
    (index = 0) => {
      patchContent((prev) => {
        const currentTracks = getInitialTracks(prev.music)
        if (currentTracks[index]) {
          currentTracks[index] = {
            ...currentTracks[index],
            fileName: '',
            src: '',
          }
        }

        const firstActiveTrack = currentTracks.find((t) => t.src)
        return {
          ...prev,
          music: {
            ...prev.music,
            src: firstActiveTrack ? firstActiveTrack.src : '',
            fileName: firstActiveTrack ? firstActiveTrack.fileName : '',
            title: firstActiveTrack ? firstActiveTrack.title : '',
            tracks: currentTracks,
          },
        }
      })
    },
    [patchContent, getInitialTracks],
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
      isDirty,
      syncStatus,
      syncError,
      isSupabaseConfigured,
      musicUploadingIndex,
      musicUploadError,
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
      uploadMusic,
      removeMusic,
      updateMusicTrackTitle,
      saveChanges,
      loadFromDatabase,
      verifyPassword,
      undo,
      redo,
      canUndo,
      canRedo,
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
      uploadMusic,
      removeMusic,
      updateMusicTrackTitle,
      saveChanges,
      loadFromDatabase,
      verifyPassword,
      undo,
      redo,
      canUndo,
      canRedo,
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
