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

export function MusicProvider({ children }) {
  const { content, musicSrc } = useContent()
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(() => readMusicPreference() === true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)

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
  const activeMusicSrc = currentTrack?.src || ''

  // 1️⃣ Prevent redundant audio.load() and source reset stutter
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !activeMusicSrc) return
    const currentSrc = audio.getAttribute('src') || ''
    if (currentSrc !== activeMusicSrc) {
      audio.src = activeMusicSrc
      audio.load()
      setCurrentTime(0)
      setDuration(0)
      if (isPlaying) {
        audio.play().catch(() => setIsPlaying(false))
      }
    }
  }, [activeMusicSrc, safeIndex, isPlaying])

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
    } catch {
      persistPreference(false)
      return false
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
    // If audio played for > 3 seconds or only 1 track exists, restart from beginning
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
      }
    }

    let lastTimeUpdate = 0
    const onTimeUpdate = () => {
      const now = performance.now()
      if (now - lastTimeUpdate > 80) { // smooth 80ms update
        lastTimeUpdate = now
        setCurrentTime(audio.currentTime)
        if (Number.isFinite(audio.duration) && audio.duration > 0) {
          setDuration(audio.duration)
        } else {
          // If duration is Infinity or streaming WebM, track max time smoothly
          setDuration((prev) => Math.max(prev, audio.currentTime))
        }
      }
    }

    const onLoadedMetadata = syncDuration
    const onDurationChange = syncDuration
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onEnded = () => {
      if (tracks.length > 1) {
        nextTrack()
      } else {
        setIsPlaying(false)
        sessionStorage.setItem(MUSIC_KEY, 'false')
      }
    }

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('durationchange', onDurationChange)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onEnded)

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('durationchange', onDurationChange)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onEnded)
    }
  }, [activeMusicSrc, tracks.length, nextTrack, duration])

  const seekTo = useCallback(
    (time) => {
      const audio = audioRef.current
      if (!audio || !Number.isFinite(time)) return

      const nextTime = Math.min(Math.max(time, 0), duration || audio.duration || 0)
      audio.currentTime = nextTime
      setCurrentTime(nextTime)
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
