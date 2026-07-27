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

  const tracks = useMemo(() => {
    if (content?.music?.tracks && content.music.tracks.length > 0) {
      return content.music.tracks.filter((t) => t.src)
    }
    return [
      {
        id: 'default',
        title: content?.music?.title || 'أغنيتنا',
        fileName: content?.music?.fileName || '',
        src: musicSrc || '',
      },
    ].filter((t) => t.src)
  }, [content, musicSrc])

  const currentTrack = tracks[currentTrackIndex] || tracks[0]
  const activeMusicSrc = currentTrack?.src || ''

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !activeMusicSrc) return
    audio.src = activeMusicSrc
    audio.load()
    setCurrentTime(0)
    setDuration(0)
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false))
    }
  }, [activeMusicSrc])

  const persistPreference = useCallback((playing) => {
    sessionStorage.setItem(MUSIC_KEY, String(playing))
    setIsPlaying(playing)
  }, [])

  const playMusic = useCallback(async () => {
    const audio = audioRef.current
    if (!audio || !activeMusicSrc) return false

    audio.volume = content.music.volume

    try {
      await audio.play()
      persistPreference(true)
      return true
    } catch {
      persistPreference(false)
      return false
    }
  }, [content.music.volume, activeMusicSrc, persistPreference])

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
  }, [tracks])

  const prevTrack = useCallback(() => {
    if (tracks.length <= 1) return
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length)
    setIsPlaying(true)
    sessionStorage.setItem(MUSIC_KEY, 'true')
  }, [tracks])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return undefined

    let lastTimeUpdate = 0
    const onTimeUpdate = () => {
      const now = performance.now()
      if (now - lastTimeUpdate > 250) {
        lastTimeUpdate = now
        setCurrentTime(audio.currentTime)
      }
    }
    const onLoadedMetadata = () => setDuration(audio.duration || 0)
    const onDurationChange = () => setDuration(audio.duration || 0)
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
  }, [activeMusicSrc, tracks, nextTrack])

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
      pauseMusic,
      playMusic,
      requestMusicStart,
      seekTo,
      skipBackward: prevTrack,
      skipForward: nextTrack,
      togglePlayback,
      tryWelcomeMusicStart,
    }),
    [
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
