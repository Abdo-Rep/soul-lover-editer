import { Heart, Pause, Play, SkipBack, SkipForward } from 'lucide-react'
import { useMusic } from '../context/MusicContext'

function Waveform({ isPlaying }) {
  const bars = [0.45, 0.75, 1, 0.6, 0.85]

  return (
    <div className="flex h-7 items-end gap-0.5" aria-hidden="true">
      {bars.map((scale, index) => (
        <span
          key={index}
          className={`w-0.5 rounded-full bg-rose-400 ${isPlaying ? 'music-bar' : ''}`}
          style={{
            height: `${scale * 100}%`,
            animationDelay: isPlaying ? `${index * 0.12}s` : undefined,
          }}
        />
      ))}
    </div>
  )
}

export default function MusicPlayer() {
  const {
    hasSource,
    isPlaying,
    togglePlayback,
    musicTitle,
    progress,
    currentTimeLabel,
    durationLabel,
    seekTo,
    skipBackward,
    skipForward,
    duration,
  } = useMusic()

  const handleSeek = (event) => {
    if (!hasSource || !duration) return

    const rect = event.currentTarget.getBoundingClientRect()
    const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1)
    seekTo(ratio * duration)
  }

  return (
    <div
      dir="ltr"
      className="theme-music-shell w-full rounded-full px-2.5 py-1.5 sm:px-3.5 sm:py-2 shadow-lg"
    >
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Controls (Left side) */}
        <button
          type="button"
          onClick={skipBackward}
          disabled={!hasSource}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-rose-400 transition hover:bg-rose-50 active:scale-95 disabled:opacity-40"
          aria-label="الأغنية السابقة"
        >
          <SkipBack size={15} />
        </button>

        <button
          type="button"
          onClick={togglePlayback}
          disabled={!hasSource}
          className="theme-music-play flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-md transition hover:brightness-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={isPlaying ? 'إيقاف' : 'تشغيل'}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
        </button>

        <button
          type="button"
          onClick={skipForward}
          disabled={!hasSource}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-rose-400 transition hover:bg-rose-50 active:scale-95 disabled:opacity-40"
          aria-label="الأغنية التالية"
        >
          <SkipForward size={15} />
        </button>

        {/* Track Title and Seekbar (Middle) */}
        <div className="min-w-0 flex-1 px-1">
          <p className="truncate text-right text-xs sm:text-sm font-medium text-rose-900 pt-1" dir="rtl">
            {hasSource ? musicTitle : 'ارفع ملف صوت من الداشبورد'}
          </p>

          <button
            type="button"
            onClick={handleSeek}
            disabled={!hasSource}
            className="mt-0.5 block w-full disabled:cursor-not-allowed"
            aria-label="شريط التقدم"
          >
            <span className="block h-1 overflow-hidden rounded-full bg-rose-100/80">
              <span
                className="block h-full rounded-full bg-rose-400 transition-[width] duration-150"
                style={{ width: `${progress * 100}%` }}
              />
            </span>
          </button>

          <div className="mt-0.5 flex items-center justify-between text-[10px] font-medium text-rose-400 sm:text-[11px]">
            <span>{currentTimeLabel}</span>
            <span>{durationLabel}</span>
          </div>
        </div>

        {/* Waveform Animation */}
        <div className="hidden shrink-0 sm:block">
          <Waveform isPlaying={isPlaying && hasSource} />
        </div>

        {/* Heart Icon (Far right side) */}
        <div className="glass-card flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-rose-300/30 shadow-sm">
          <Heart size={15} className="text-rose-500" fill="currentColor" />
        </div>
      </div>
    </div>
  )
}
