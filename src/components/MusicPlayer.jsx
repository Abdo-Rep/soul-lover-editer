import { useState, useId } from 'react'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
  ListMusic,
  ChevronDown,
  Music,
  Disc,
  Volume2,
  RotateCcw,
  RotateCw,
} from 'lucide-react'
import { useMusic } from '../context/MusicContext'

function isVoiceTrack(title = '') {
  const t = String(title).toLowerCase()
  return t.includes('صوتية') || t.includes('بصوتي') || t.includes('رسالة') || t.includes('تسجيل') || t.includes('voice') || t.includes('mic')
}

export default function MusicPlayer() {
  const {
    hasSource,
    isPlaying,
    musicTitle,
    currentTime,
    duration,
    progress,
    currentTimeLabel,
    durationLabel,
    togglePlayback,
    skipForward,
    skipBackward,
    seekTo,
    audioRef,
    tracks = [],
    currentTrackIndex = 0,
    setCurrentTrackIndex,
  } = useMusic()

  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false)
  const [showPlaylistDrawer, setShowPlaylistDrawer] = useState(false)
  const [volume, setVolume] = useState(0.35)
  const sliderId = useId()
  const volumeSliderId = useId()

  const handleVolumeChange = (e) => {
    const v = Number(e.target.value)
    setVolume(v)
    if (audioRef?.current) audioRef.current.volume = v
  }

  if (!hasSource) {
    return (
      <div className="mx-auto w-full max-w-sm rounded-full border border-rose-100 bg-white/90 p-2.5 shadow-lg backdrop-blur-md text-center text-xs font-semibold text-rose-400">
        🎵 يرجى رفع ملف صوتي من الداشبورد لتشغيل الموسيقى
      </div>
    )
  }

  const isVoice = isVoiceTrack(musicTitle)

  const handleSliderChange = (e) => {
    const nextTime = Number(e.target.value)
    if (!Number.isNaN(nextTime)) {
      seekTo(nextTime)
    }
  }

  const handleSeekBack10 = () => seekTo(Math.max(0, currentTime - 10))
  const handleSeekForward10 = () => seekTo(Math.min(duration, currentTime + 10))

  const handleSelectTrack = (idx) => {
    if (setCurrentTrackIndex) {
      setCurrentTrackIndex(idx)
    }
    setShowPlaylistDrawer(false)
  }

  return (
    <>
      {/* 1. COMPACT FLOATING MINI PLAYER BAR (AT BOTTOM OF SCREEN) */}
      <div className="mx-auto w-full max-w-sm rounded-full border border-rose-100/90 dark:border-rose-800/50 bg-white/95 dark:bg-slate-900/95 p-1.5 shadow-xl shadow-rose-900/10 dark:shadow-rose-950/30 backdrop-blur-md transition-all duration-300 hover:shadow-2xl">
        <div className="flex items-center gap-2.5 px-1">
          {/* Play / Pause Neumorphic Round Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              togglePlayback()
            }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 to-pink-400 text-white shadow-md shadow-rose-200 dark:shadow-rose-900 transition hover:scale-105 active:scale-95"
            aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
          >
            {isPlaying ? (
              <Pause size={17} className="fill-white" />
            ) : (
              <Play size={17} className="ml-0.5 fill-white" />
            )}
          </button>

          {/* Center Info Bar (Clicking opens Full Player) */}
          <button
            type="button"
            onClick={() => setIsFullPlayerOpen(true)}
            className="flex flex-1 flex-col text-right cursor-pointer overflow-hidden py-0.5"
          >
            <div className="flex items-center gap-1.5 justify-between">
              <span className="truncate text-xs font-bold text-rose-900 dark:text-rose-100 font-display">
                {musicTitle || 'أغنيتنا'}
              </span>
              {isVoice && (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-rose-100 dark:bg-rose-900/60 px-2 py-0.5 text-[9px] font-extrabold text-rose-700 dark:text-rose-300">
                  🎙️ بصوتي
                </span>
              )}
            </div>

            {/* Glowing Mini Progress Line */}
            <div className="relative mt-1 h-1 w-full overflow-hidden rounded-full bg-rose-100 dark:bg-rose-900/40">
              <div
                className="h-full bg-gradient-to-r from-rose-400 to-pink-500 transition-all duration-200"
                style={{ width: `${progress * 100}%` }}
              />
            </div>

            <div className="mt-0.5 flex justify-between text-[9px] font-semibold text-rose-400 dark:text-rose-500">
              <span>{currentTimeLabel}</span>
              <span>{durationLabel}</span>
            </div>
          </button>

          {/* Next Track Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              skipForward()
            }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-rose-400 dark:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/40 hover:text-rose-600 dark:hover:text-rose-300 transition active:scale-95"
            title="الأغنية التالية"
            aria-label="الأغنية التالية"
          >
            <SkipForward size={16} />
          </button>

          {/* Previous Track Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              skipBackward()
            }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-rose-400 dark:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/40 hover:text-rose-600 dark:hover:text-rose-300 transition active:scale-95"
            title="الأغنية السابقة"
            aria-label="الأغنية السابقة"
          >
            <SkipBack size={16} />
          </button>

          {/* Full Player Toggle Icon */}
          <button
            type="button"
            onClick={() => setIsFullPlayerOpen(true)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-rose-400 dark:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/40 hover:text-rose-600 dark:hover:text-rose-300 transition"
            title="تكبير المشغل"
          >
            <ListMusic size={16} />
          </button>
        </div>
      </div>

      {/* 2. FULL-SCREEN DYNAMIC NEUMORPHIC MUSIC PLAYER MODAL */}
      {isFullPlayerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-[var(--theme-50)] via-[var(--theme-100)] to-[var(--theme-50)] p-4 sm:p-6 dir-rtl animate-in fade-in duration-200"
          onClick={() => setIsFullPlayerOpen(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-[36px] theme-neumorph-card p-6 flex flex-col items-center justify-between min-h-[520px] max-h-[90dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Header Toolbar (Neumorphic Style) */}
            <div className="w-full flex items-center justify-between pb-2">
              <button
                type="button"
                onClick={() => setIsFullPlayerOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-full theme-neumorph-btn transition hover:scale-105 active:scale-95"
                title="إغلاق"
              >
                <ChevronDown size={22} />
              </button>

              <div className="text-center">
                <span className="text-[10px] font-black text-rose-500 tracking-[0.2em] uppercase">
                  يُعزف الآن
                </span>
                <h4 className="text-xs font-bold text-rose-900 font-display mt-0.5">
                  {musicTitle || 'أغنيتنا'}
                </h4>
              </div>

              <button
                type="button"
                onClick={() => setShowPlaylistDrawer((prev) => !prev)}
                className={`flex h-11 w-11 items-center justify-center rounded-full transition active:scale-95 ${
                  showPlaylistDrawer
                    ? 'theme-neumorph-btn-active'
                    : 'theme-neumorph-btn'
                }`}
                title="قائمة الأغاني"
              >
                <ListMusic size={18} />
              </button>
            </div>

            {/* PLAYLIST DRAWER (TOGGLED) */}
            {showPlaylistDrawer ? (
              <div className="w-full my-auto space-y-2.5 py-4 max-h-[380px] overflow-y-auto romantic-scrollbar">
                <h5 className="text-xs font-bold text-rose-900 mb-3 px-1 text-right">
                  قائمة التشغيل ({tracks.length} مقاطع):
                </h5>
                {tracks.map((tr, idx) => (
                  <button
                    key={tr.id || idx}
                    type="button"
                    onClick={() => handleSelectTrack(idx)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-right transition ${
                      idx === currentTrackIndex
                        ? 'theme-neumorph-btn-active font-bold'
                        : 'theme-neumorph-btn font-semibold'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {isVoiceTrack(tr.title) ? (
                        <span>🎙️</span>
                      ) : (
                        <Music size={15} className={idx === currentTrackIndex ? 'text-white' : 'text-rose-600'} />
                      )}
                      <span className="text-xs truncate">{tr.title || `أغنية ${idx + 1}`}</span>
                    </div>

                    {idx === currentTrackIndex && isPlaying && (
                      <span className="flex items-center gap-0.5">
                        <span className="h-2 w-0.5 bg-white animate-bounce" />
                        <span className="h-3 w-0.5 bg-white animate-bounce delay-100" />
                        <span className="h-2 w-0.5 bg-white animate-bounce delay-200" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              /* MAIN NEUMORPHIC ARTWORK & CONTROLS */
              <>
                {/* 3D Circular Neumorphic Album Artwork Container with Audio Equalizer Visualizer */}
                <div className="relative my-6 flex items-center justify-center">
                  {/* Glowing outer pulse aura when playing — smaller size for GPU perf */}
                  {isPlaying && (
                    <div className="absolute h-40 w-40 rounded-full bg-rose-400/15 animate-ping pointer-events-none" style={{ animationDuration: '2.5s' }} />
                  )}
                  <div className="relative h-52 w-52 rounded-full theme-neumorph-disc-ring p-3 flex items-center justify-center">
                    <div
                      className={`relative h-full w-full rounded-full theme-neumorph-disc flex flex-col items-center justify-center text-white shadow-inner overflow-hidden ${
                        isPlaying ? 'shadow-[inset_0_0_24px_rgba(0,0,0,0.3)]' : ''
                      }`}
                    >
                      {/* Dynamic Audio Waveform Equalizer Inside the Circle */}
                      {isPlaying ? (
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="relative flex items-center justify-center">
                            <Disc size={46} className="text-white/90 animate-[spin_10s_linear_infinite]" />
                            <Heart size={16} className="absolute fill-white text-white animate-pulse" />
                          </div>

                          {/* 7-Bar Equalizer Sound Wave Visualizer */}
                          <div className="flex items-end justify-center gap-1.5 h-11 px-4 mt-1">
                            <span className="w-1.5 rounded-full bg-white/95 animate-[bounce_0.8s_ease-in-out_infinite] h-4 shadow-sm" style={{ animationDelay: '0s' }} />
                            <span className="w-1.5 rounded-full bg-white/95 animate-[bounce_0.6s_ease-in-out_infinite] h-9 shadow-sm" style={{ animationDelay: '0.15s' }} />
                            <span className="w-1.5 rounded-full bg-white/95 animate-[bounce_0.75s_ease-in-out_infinite] h-6 shadow-sm" style={{ animationDelay: '0.3s' }} />
                            <span className="w-1.5 rounded-full bg-white/95 animate-[bounce_0.5s_ease-in-out_infinite] h-10 shadow-sm" style={{ animationDelay: '0.1s' }} />
                            <span className="w-1.5 rounded-full bg-white/95 animate-[bounce_0.9s_ease-in-out_infinite] h-5 shadow-sm" style={{ animationDelay: '0.25s' }} />
                            <span className="w-1.5 rounded-full bg-white/95 animate-[bounce_0.65s_ease-in-out_infinite] h-8 shadow-sm" style={{ animationDelay: '0.4s' }} />
                            <span className="w-1.5 rounded-full bg-white/95 animate-[bounce_0.8s_ease-in-out_infinite] h-4 shadow-sm" style={{ animationDelay: '0.2s' }} />
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center">
                          <Disc size={64} className="text-white/90" />
                          <Heart size={22} className="fill-white text-white mt-1 animate-pulse" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Track Title & Subtitle */}
                <div className="text-center my-2">
                  <h3 className="text-xl font-extrabold text-rose-900 font-display flex items-center justify-center gap-2">
                    <span>{musicTitle || 'أغنيتنا'}</span>
                    {isVoice && (
                      <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-xs font-bold text-rose-600 shadow-xs">
                        🎙️ بصوتي
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-rose-600 font-bold mt-1">soulove 💖</p>
                </div>

                {/* Neumorphic Progress Slider */}
                <div className="w-full px-2 my-3">
                  <input
                    id={sliderId}
                    type="range"
                    min={0}
                    max={duration || 100}
                    step={0.1}
                    value={currentTime}
                    onChange={handleSliderChange}
                    aria-label="شريط التقدم"
                    aria-valuemin={0}
                    aria-valuemax={Math.round(duration || 100)}
                    aria-valuenow={Math.round(currentTime)}
                    aria-valuetext={`${currentTimeLabel} من ${durationLabel}`}
                    className="w-full h-2 rounded-lg bg-rose-200/60 dark:bg-rose-900/40 appearance-none cursor-pointer accent-[var(--theme-500)] focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                  />
                  <div className="flex justify-between text-xs font-extrabold text-rose-700 mt-1.5">
                    <span>{currentTimeLabel}</span>
                    <span>{durationLabel}</span>
                  </div>
                </div>

                {/* Round 3D Neumorphic Control Buttons */}
                <div className="w-full flex items-center justify-center gap-4 my-2">
                  {/* Next Track (renders on far Right in RTL) */}
                  <button
                    type="button"
                    onClick={skipForward}
                    className="flex h-11 w-11 items-center justify-center rounded-full theme-neumorph-btn transition hover:scale-105 active:scale-95"
                    title="المقطع التالي"
                    aria-label="المقطع التالي"
                  >
                    <SkipForward size={18} />
                  </button>

                  {/* Seek forward 10s */}
                  <button
                    type="button"
                    onClick={handleSeekForward10}
                    className="flex h-9 w-9 items-center justify-center rounded-full theme-neumorph-btn transition hover:scale-105 active:scale-95 text-rose-500"
                    title="تقديم 10 ثواني"
                    aria-label="تقديم 10 ثواني"
                  >
                    <RotateCw size={16} />
                  </button>

                  {/* Main Large Play/Pause Button */}
                  <button
                    type="button"
                    onClick={togglePlayback}
                    className="flex h-16 w-16 items-center justify-center rounded-full theme-neumorph-btn-active transition hover:scale-105 active:scale-95"
                    title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
                    aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
                  >
                    {isPlaying ? (
                      <Pause size={28} className="fill-white" />
                    ) : (
                      <Play size={28} className="ml-1 fill-white" />
                    )}
                  </button>

                  {/* Seek back 10s */}
                  <button
                    type="button"
                    onClick={handleSeekBack10}
                    className="flex h-9 w-9 items-center justify-center rounded-full theme-neumorph-btn transition hover:scale-105 active:scale-95 text-rose-500"
                    title="ترجيع 10 ثواني"
                    aria-label="ترجيع 10 ثواني"
                  >
                    <RotateCcw size={16} />
                  </button>

                  {/* Previous Track (renders on far Left in RTL) */}
                  <button
                    type="button"
                    onClick={skipBackward}
                    className="flex h-11 w-11 items-center justify-center rounded-full theme-neumorph-btn transition hover:scale-105 active:scale-95"
                    title="المقطع السابق"
                    aria-label="المقطع السابق"
                  >
                    <SkipBack size={18} />
                  </button>
                </div>

                {/* Volume Control */}
                <div className="w-full px-3 mt-3 flex items-center gap-3">
                  <Volume2 size={14} className="text-rose-400 shrink-0" />
                  <input
                    id={volumeSliderId}
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={handleVolumeChange}
                    aria-label="مستوى الصوت"
                    className="flex-1 h-1.5 rounded-full bg-rose-200/60 appearance-none cursor-pointer accent-[var(--theme-500)] focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                  />
                  <span className="text-[10px] font-bold text-rose-400 w-7 text-left">{Math.round(volume * 100)}%</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
