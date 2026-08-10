import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { config } from '../data/config'
import { formatAudioTime } from '../utils/formatAudioTime'
import { useContent } from './ContentContext'

const MUSIC_KEY = config.music.storageKey
const PENDING_KEY = config.music.pendingStartKey
const SEEK_STEP = 10

const MusicContext = createContext(null)

function readMusicPreference() {
  const stored = sessionStorage.getItem(MUSIC_KEY)
  return stored === null ? null : stored === 'true'
}

// Convert http:// Supabase storage URLs to proxied /api/media URLs
// to avoid mixed-content blocking on HTTPS sites (Vercel)
function proxyMediaUrl(url) {
  if (!url || typeof url !== 'string') return url
  // Already a relative or blob URL — leave it
  if (url.startsWith('/') || url.startsWith('blob:')) return url
  
  // Match Supabase storage public URL pattern
  const marker1 = '/storage/v1/object/public/site-media/'
  const idx1 = url.indexOf(marker1)
  if (idx1 !== -1) {
    const objectPath = url.substring(idx1 + marker1.length)
    return `/api/media?path=${encodeURIComponent(objectPath)}`
  }

  // Match sanitized media.soulove.app custom proxy pattern
  const marker2 = '/supabase/site-media/'
  const idx2 = url.indexOf(marker2)
  if (idx2 !== -1) {
    const objectPath = url.substring(idx2 + marker2.length)
    return `/api/media?path=${encodeURIComponent(objectPath)}`
  }

  const marker3 = '/supabase/'
  const idx3 = url.indexOf(marker3)
  if (idx3 !== -1) {
    const objectPath = url.substring(idx3 + marker3.length)
    return `/api/media?path=${encodeURIComponent(objectPath)}`
  }

  return url
}

export function MusicProvider({ children }) {
  const { content, musicSrc } = useContent()
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(() => readMusicPreference() === true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const switchingRef = useRef(false)
  const targetVolumeRef = useRef(1)

  // Filter only valid, unique uploaded tracks
  const tracks = useMemo(() => {
    const rawList = (content?.music?.tracks && content.music.tracks.length > 0)
      ? content.music.tracks
      : [{
          id: 'default',
          title: content?.music?.title || 'أغنيتنا',
          fileName: content?.music?.fileName || '',
          src: content?.music?.src || musicSrc || '',
        }]

    const valid = rawList.filter((t) => Boolean(t.src && String(t.src).trim()))
    if (valid.length > 0) return valid

    if (musicSrc) {
      return [{
        id: 'fallback',
        title: content?.music?.title || 'أغنيتنا',
        fileName: content?.music?.fileName || '',
        src: musicSrc,
      }]
    }

    return []
  }, [content, musicSrc])

  // Bound index safely
  const safeIndex = currentTrackIndex >= tracks.length ? 0 : currentTrackIndex
  const currentTrack = tracks[safeIndex] || tracks[0]
  const activeMusicSrc = proxyMediaUrl(currentTrack?.src || '')

  // Store target volume from content
  useEffect(() => {
    if (content?.music?.volume !== undefined) {
      targetVolumeRef.current = content.music.volume
    }
  }, [content?.music?.volume])

  const prevSrcRef = useRef('')

  // 1️⃣ Reliable track switching — instant & non-blocking
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !activeMusicSrc) return

    if (prevSrcRef.current !== activeMusicSrc) {
      prevSrcRef.current = activeMusicSrc
      switchingRef.current = true

      audio.pause()
      audio.volume = targetVolumeRef.current || 1
      audio.currentTime = 0

      setCurrentTime(0)
      setDuration(currentTrack?.duration ? Number(currentTrack.duration) : 0)

      audio.src = activeMusicSrc
      audio.load()

      if (isPlaying) {
        const onCanPlay = () => {
          audio.removeEventListener('canplay', onCanPlay)
          switchingRef.current = false
          audio.play().catch(() => {
            setIsPlaying(false)
          })
        }
        audio.addEventListener('canplay', onCanPlay)
        // Fallback: try playing after 3 seconds even if canplay didn't fire
        setTimeout(() => {
          switchingRef.current = false
          if (isPlaying && audio.paused) {
            audio.play().catch(() => {})
          }
        }, 3000)
      } else {
        switchingRef.current = false
      }
    }
  }, [activeMusicSrc, isPlaying, currentTrack?.duration])

  const primeAudio = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !activeMusicSrc) return
    if (content?.music?.volume !== undefined) {
      audio.volume = content.music.volume
    }
    sessionStorage.setItem(PENDING_KEY, 'true')
    sessionStorage.setItem(MUSIC_KEY, 'true')
    setIsPlaying(true)
    audio.play().catch(() => {})
  }, [activeMusicSrc, content?.music?.volume])

  const persistPreference = useCallback((playing) => {
    sessionStorage.setItem(MUSIC_KEY, String(playing))
    setIsPlaying(playing)
  }, [])

  const playMusic = useCallback(async () => {
    const audio = audioRef.current
    if (!audio || !activeMusicSrc) return false

    if (content?.music?.volume !== undefined) {
      audio.volume = content.music.volume
    }

    try {
      await audio.play()
      persistPreference(true)
      return true
    } catch (err) {
      // If audio has no source loaded yet, load it and wait for canplay
      try {
        audio.src = activeMusicSrc
        audio.load()
        await new Promise((resolve, reject) => {
          const onReady = () => { audio.removeEventListener('error', onErr); resolve() }
          const onErr = () => { audio.removeEventListener('canplay', onReady); reject(new Error('load failed')) }
          audio.addEventListener('canplay', onReady, { once: true })
          audio.addEventListener('error', onErr, { once: true })
          // Timeout after 10 seconds
          setTimeout(() => { onReady() }, 10000)
        })
        await audio.play()
        persistPreference(true)
        return true
      } catch {
        persistPreference(false)
        return false
      }
    }
  }, [content?.music?.volume, activeMusicSrc, persistPreference])

  const pauseMusic = useCallback(() => {
    const audio = audioRef.current
    if (audio) audio.pause()
    persistPreference(false)
  }, [persistPreference])

  const togglePlayback = useCallback(async () => {
    if (isPlaying) {
      pauseMusic()
      return
    }

    await playMusic()
  }, [isPlaying, pauseMusic, playMusic])

  const nextTrack = useCallback(() => {
    if (tracks.length <= 1) return
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length)
    setIsPlaying(true)
    sessionStorage.setItem(MUSIC_KEY, 'true')
  }, [tracks.length])

  const prevTrack = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.currentTime > 3 || tracks.length <= 1) {
      audio.currentTime = 0
      setCurrentTime(0)
      if (!isPlaying) {
        playMusic()
      }
      return
    }
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length)
    setIsPlaying(true)
    sessionStorage.setItem(MUSIC_KEY, 'true')
  }, [tracks.length, isPlaying, playMusic])

  // 2️⃣ Instant playback & smooth duration sync (Zero delay)
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return undefined

    const syncDuration = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration)
      } else if (currentTrack?.duration) {
        setDuration(Number(currentTrack.duration))
      }
    }

    let lastTimeUpdate = 0
    const onTimeUpdate = () => {
      const now = performance.now()
      if (!isSeekingRef.current && now - lastTimeUpdate > 80) { // smooth 80ms update
        lastTimeUpdate = now
        setCurrentTime(audio.currentTime)
        if (Number.isFinite(audio.duration) && audio.duration > 0) {
          setDuration(audio.duration)
        } else if (currentTrack?.duration) {
          setDuration(Number(currentTrack.duration))
        } else if (audio.currentTime > 0) {
          setDuration(audio.currentTime)
        }
      }
    }

    const onLoadedMetadata = syncDuration
    const onDurationChange = syncDuration
    const onPlay = () => {
      if (!switchingRef.current) setIsPlaying(true)
    }
    const onPause = () => {
      // Don't override isPlaying during programmatic track switching
      if (!switchingRef.current) setIsPlaying(false)
    }
    const onEnded = () => {
      if (tracks.length > 1) {
        nextTrack()
      } else {
        setIsPlaying(false)
        sessionStorage.setItem(MUSIC_KEY, 'false')
      }
    }

    const onError = (e) => {
      console.warn('Audio playback error:', e?.target?.error)
      setIsPlaying(false)
    }

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('durationchange', onDurationChange)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('durationchange', onDurationChange)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
    }
  }, [activeMusicSrc, tracks.length, nextTrack, currentTrack?.duration])

  const isSeekingRef = useRef(false)
  const seekTo = useCallback(
    (time) => {
      const audio = audioRef.current
      if (!audio || !Number.isFinite(time)) return

      const maxDur = duration || audio.duration || 0
      const nextTime = Math.min(Math.max(time, 0), maxDur > 0 ? maxDur : time)
      isSeekingRef.current = true
      try {
        audio.currentTime = nextTime
      } catch {}
      setCurrentTime(nextTime)
      setTimeout(() => {
        isSeekingRef.current = false
      }, 250)
    },
    [duration],
  )

  const skipBackward = useCallback(() => {
    seekTo(currentTime - SEEK_STEP)
  }, [currentTime, seekTo])

  const skipForward = useCallback(() => {
    seekTo(currentTime + SEEK_STEP)
  }, [currentTime, seekTo])

  const requestMusicStart = useCallback(() => {
    sessionStorage.setItem(PENDING_KEY, 'true')
    sessionStorage.setItem(MUSIC_KEY, 'true')
    setIsPlaying(true)
  }, [])

  const tryWelcomeMusicStart = useCallback(async () => {
    const shouldStartFromLogin =
      sessionStorage.getItem(PENDING_KEY) === 'true'
    const prefersPlaying = readMusicPreference() === true

    if (!shouldStartFromLogin && !prefersPlaying) return

    if (shouldStartFromLogin) {
      sessionStorage.removeItem(PENDING_KEY)
    }

    await playMusic()
  }, [playMusic])

  const progress = duration > 0 ? Math.min(currentTime / duration, 1) : 0

  const value = useMemo(
    () => ({
      audioRef,
      hasSource: Boolean(activeMusicSrc),
      isPlaying,
      musicSrc: activeMusicSrc,
      musicTitle: currentTrack?.title || 'أغنيتنا',
      currentTime,
      duration,
      progress,
      currentTimeLabel: formatAudioTime(currentTime),
      durationLabel: formatAudioTime(duration, { padMinutes: true }),
      tracks,
      currentTrackIndex: safeIndex,
      setCurrentTrackIndex,
      pauseMusic,
      playMusic,
      primeAudio,
      requestMusicStart,
      seekTo,
      skipBackward: prevTrack,
      skipForward: nextTrack,
      togglePlayback,
      tryWelcomeMusicStart,
    }),
    [
      tracks,
      safeIndex,
      currentTrack?.title,
      currentTime,
      duration,
      isPlaying,
      activeMusicSrc,
      pauseMusic,
      playMusic,
      progress,
      requestMusicStart,
      seekTo,
      prevTrack,
      nextTrack,
      togglePlayback,
      tryWelcomeMusicStart,
    ],
  )

  return (
    <MusicContext.Provider value={value}>
      {activeMusicSrc ? (
        <audio ref={audioRef} src={activeMusicSrc} loop={tracks.length <= 1} preload="auto" />
      ) : null}
      {children}
    </MusicContext.Provider>
  )
}

export function useMusic() {
  const context = useContext(MusicContext)
  if (!context) {
    throw new Error('useMusic must be used within MusicProvider')
  }
  return context
}
