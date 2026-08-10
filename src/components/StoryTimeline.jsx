import React, { useState } from 'react'
import { Calendar, Heart, Sparkles, X, ZoomIn } from 'lucide-react'
import { formatDateLong } from '../utils/formatDate'
import { RevealItem } from './Reveal'

function CardConnector() {
  return (
    <div className="flex justify-center py-2.5" aria-hidden="true">
      <div className="flex flex-col items-center gap-1.5">
        <span className="h-3 w-3 rounded-full bg-gradient-to-tr from-rose-400 to-pink-500 shadow-md shadow-rose-300 dark:shadow-rose-900 animate-pulse flex items-center justify-center text-[8px] text-white font-bold">
          ♥
        </span>
        <span className="h-8 w-0.5 bg-gradient-to-b from-rose-300 via-pink-200 to-transparent dark:from-rose-500 dark:via-rose-800 rounded-full" />
      </div>
    </div>
  )
}

// Breathtaking Glowing Romantic Date Badge
function RomanticDateBadge({ date, highlight = false, className = '' }) {
  if (!date) return null
  const formatted = formatDateLong(date)
  if (!formatted) return null

  return (
    <div className={`flex justify-center ${className}`}>
      <span
        className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs sm:text-sm font-extrabold shadow-lg transition-all duration-300 hover:scale-105 ${
          highlight
            ? 'bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 text-white shadow-rose-300/80 dark:shadow-rose-900/80 ring-2 ring-white/80 dark:ring-white/30'
            : 'border border-rose-200/90 dark:border-rose-700/60 bg-gradient-to-r from-rose-50/90 via-white to-pink-50/90 dark:from-slate-800/90 dark:via-slate-900 dark:to-slate-800/90 text-rose-800 dark:text-rose-200 shadow-rose-900/10 dark:shadow-rose-900/40 backdrop-blur-md hover:border-rose-300 dark:hover:border-rose-600'
        }`}
      >
        <Calendar size={14} className={highlight ? 'text-white' : 'text-rose-500 dark:text-rose-400'} />
        <span className="font-display tracking-wide">{formatted}</span>
        <Heart size={12} className={highlight ? 'text-white fill-white' : 'text-rose-500 fill-rose-500 dark:text-rose-400 dark:fill-rose-400 animate-pulse'} />
      </span>
    </div>
  )
}

export function TimelineMilestone({
  label,
  date,
  children,
  showConnector = true,
}) {
  return (
    <>
      <RevealItem as="div" role="listitem" className="mx-auto w-full max-w-lg">
        <article className="group relative overflow-hidden rounded-3xl border border-rose-100 dark:border-rose-800/60 bg-white/95 dark:bg-slate-900/95 p-6 sm:p-7 shadow-xl shadow-rose-900/5 dark:shadow-rose-950/40 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-rose-300/20 dark:hover:shadow-rose-900/40 text-center">
          {/* Ambient Glow */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gradient-to-br from-rose-200/35 to-pink-100/25 dark:from-rose-600/20 dark:to-pink-900/15 blur-2xl transition-all duration-500 group-hover:scale-150" />

          <RomanticDateBadge date={date} className="mb-4" />

          <div className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-50/90 dark:bg-rose-950/80 px-4 py-1.5 text-sm font-bold text-rose-900 dark:text-rose-100 border border-rose-200/80 dark:border-rose-700/60 mb-3.5 shadow-sm">
            <Sparkles size={15} className="text-rose-500 dark:text-rose-400" />
            <span className="font-display">{label}</span>
          </div>

          <div className="text-sm sm:text-base leading-relaxed text-rose-900 dark:text-rose-100 font-medium">
            {children}
          </div>
        </article>
      </RevealItem>
      {showConnector ? <CardConnector /> : null}
    </>
  )
}

export function TimelineLoveConfession({
  label,
  date,
  message,
  showConnector = true,
}) {
  return (
    <>
      <RevealItem as="div" role="listitem" className="mx-auto w-full max-w-lg">
        <article className="group relative overflow-hidden rounded-3xl border border-rose-200/80 dark:border-rose-700/60 bg-gradient-to-b from-white to-rose-50/40 dark:from-slate-900/95 dark:to-slate-800/90 p-6 sm:p-7 shadow-xl shadow-rose-900/5 dark:shadow-rose-950/40 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-rose-300/25 dark:hover:shadow-rose-900/40 text-center">
          <div className="pointer-events-none absolute -left-10 -bottom-10 h-36 w-36 rounded-full bg-gradient-to-tr from-rose-300/30 to-pink-200/20 dark:from-rose-600/20 dark:to-pink-900/15 blur-2xl transition-all duration-500 group-hover:scale-150" />

          <RomanticDateBadge date={date} highlight={true} className="mb-4" />

          <div className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 px-4.5 py-1.5 text-sm font-bold text-white shadow-md shadow-rose-200 dark:shadow-rose-900 mb-3.5">
            <Heart size={15} className="fill-white" />
            <span className="font-display">{label}</span>
          </div>

          <p className="text-sm sm:text-base leading-relaxed text-rose-900 dark:text-rose-100 font-medium">
            {message}
          </p>
        </article>
      </RevealItem>
      {showConnector ? <CardConnector /> : null}
    </>
  )
}

function hasMemoryContent(memory) {
  return Boolean(
    memory.image?.trim() || memory.url?.trim() || memory.date || memory.text?.trim(),
  )
}

export function isVisibleMemory(memory) {
  return hasMemoryContent(memory)
}

export function TimelineMemoryCard({ memory, showConnector = true, onImageClick, onOpen }) {
  const hasImage = Boolean(memory.image?.trim() || memory.url?.trim())
  const imgSrc = memory.image || memory.url
  const formattedDate = memory.date ? formatDateLong(memory.date) : null
  const hasDate = Boolean(formattedDate)
  const hasText = Boolean(memory.text?.trim())
  const [isLoaded, setIsLoaded] = useState(false)

  if (!hasImage && !hasDate && !hasText) return null

  const handleClick = () => {
    if (onOpen) onOpen()
    else if (onImageClick) onImageClick(imgSrc, memory.text || 'ذكرى')
  }

  return (
    <>
      <RevealItem as="div" role="listitem" className="w-full max-w-lg mx-auto">
        <article className="group overflow-hidden rounded-[28px] border border-rose-100/90 dark:border-rose-800/60 bg-white/95 dark:bg-slate-900/95 shadow-xl shadow-rose-900/5 dark:shadow-rose-955/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-rose-300/20 dark:hover:shadow-rose-900/30 text-center w-full flex flex-col justify-between">
          {hasImage ? (
            <button
              type="button"
              onClick={handleClick}
              className="relative block w-full overflow-hidden bg-rose-50/60 dark:bg-slate-800/60 group/img cursor-pointer"
            >
              {/* Skeleton Loading Shimmer until image is ready */}
              {!isLoaded && (
                <div className="absolute inset-0 min-h-[220px] bg-gradient-to-r from-rose-100 via-pink-100 to-rose-100 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 animate-pulse flex items-center justify-center">
                  <span className="text-rose-300 dark:text-rose-600 text-xl font-bold">♥</span>
                </div>
              )}
              <img
                src={imgSrc}
                alt={hasText ? memory.text : 'ذكرى'}
                onLoad={() => setIsLoaded(true)}
                className={`w-full h-auto object-contain block transition-all duration-500 group-hover/img:scale-[1.01] ${
                  isLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                loading="eager"
                decoding="async"
              />
            </button>
          ) : null}

          {(hasDate || hasText) ? (
            <div className="p-3.5 sm:p-4 flex-1 flex flex-col items-center justify-center">
              {/* 🎯 التاريخ بالعرض كأنه كلمة مكتوبة وعلى قد الكلام لتوفير المساحة */}
              {hasDate && (
                <div className="mx-auto mb-2 w-fit rounded-full border border-rose-100/90 dark:border-rose-700/60 bg-gradient-to-r from-rose-50/90 via-white to-pink-50/90 dark:from-slate-800/90 dark:via-slate-900 dark:to-slate-800/90 px-3.5 py-0.5 text-center shadow-xs transition-transform duration-300 group-hover:scale-105">
                  <span className="text-xs sm:text-sm font-bold text-rose-800 dark:text-rose-200 tracking-wide flex items-center justify-center gap-1.5">
                    <Calendar size={13} className="text-rose-500 dark:text-rose-400 shrink-0" />
                    <span>{formattedDate}</span>
                  </span>
                </div>
              )}

              {/* النص والكلام */}
              {hasText && (
                <p className="text-sm sm:text-base leading-relaxed text-rose-900 dark:text-rose-100 font-semibold text-center">
                  {memory.text}
                </p>
              )}
            </div>
          ) : null}
        </article>
      </RevealItem>
      {showConnector ? <CardConnector /> : null}
  )
}

export default function StoryTimeline({ children }) {
  return (
    <div role="list" className="mx-auto flex w-full flex-col items-center gap-2 max-w-xl">
      {children}
    </div>
  )
}
