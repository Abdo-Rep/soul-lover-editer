import React, { useState } from 'react'
import { Calendar, Heart, Sparkles } from 'lucide-react'
import { formatDateLong } from '../utils/formatDate'
import { RevealItem } from './Reveal'

function CardConnector() {
  return (
    <div className="flex justify-center py-2" aria-hidden="true">
      <div className="flex flex-col items-center gap-1">
        <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-tr from-[var(--theme-400)] to-[var(--theme-500)] flex items-center justify-center text-[7px] text-white font-bold">
          ♥
        </span>
        <span className="h-7 w-0.5 bg-gradient-to-b from-[var(--theme-300)] via-[var(--theme-200)] to-transparent dark:from-[var(--theme-500)] dark:via-[var(--theme-800)] rounded-full" />
      </div>
    </div>
  )
}

// Crisp Elegant Romantic Date Badge (Strictly matches Dashboard Theme)
function RomanticDateBadge({ date, className = '' }) {
  if (!date) return null
  const formatted = formatDateLong(date)
  if (!formatted) return null

  return (
    <div className={`flex justify-center ${className}`}>
      <span className="inline-flex items-center gap-2 rounded-full px-4.5 py-1.5 text-xs sm:text-sm font-extrabold transition-all duration-300 border border-[var(--theme-300)]/70 dark:border-[var(--theme-400)]/40 bg-[var(--theme-100)]/80 dark:bg-[var(--theme-900)]/40 text-[var(--theme-800)] dark:text-[var(--theme-200)] backdrop-blur-md hover:scale-105">
        <Calendar size={13} className="text-[var(--theme-500)] dark:text-[var(--theme-400)]" />
        <span className="font-display tracking-wide">{formatted}</span>
        <Heart size={11} className="text-[var(--theme-500)] fill-[var(--theme-500)] dark:text-[var(--theme-400)] dark:fill-[var(--theme-400)]" />
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
        <article className="group relative overflow-hidden rounded-3xl border border-rose-100 dark:border-rose-800/60 bg-white/95 dark:bg-slate-900/95 p-6 sm:p-7 shadow-md dark:shadow-rose-950/20 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg text-center">
          <RomanticDateBadge date={date} className="mb-4" />

          {/* Milestone Badge in Exact Theme Color */}
          <div className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[var(--theme-500)] via-[var(--theme-600)] to-[var(--theme-500)] px-4.5 py-1.5 text-sm font-bold text-white mb-3.5 shadow-xs">
            <Sparkles size={15} className="text-white" />
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
        <article className="group relative overflow-hidden rounded-3xl border border-rose-200/80 dark:border-rose-700/60 bg-gradient-to-b from-white to-rose-50/40 dark:from-slate-900/95 dark:to-slate-800/90 p-6 sm:p-7 shadow-md dark:shadow-rose-950/20 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg text-center">
          <RomanticDateBadge date={date} className="mb-4" />

          {/* Confession Badge in Exact Theme Color */}
          <div className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[var(--theme-500)] via-[var(--theme-600)] to-[var(--theme-500)] px-4.5 py-1.5 text-sm font-bold text-white mb-3.5 shadow-xs">
            <Heart size={15} className="fill-white text-white" />
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
                <div className="mx-auto mb-2 w-fit rounded-full border border-[var(--theme-300)]/70 dark:border-[var(--theme-400)]/40 bg-[var(--theme-100)]/80 dark:bg-[var(--theme-900)]/40 px-3.5 py-0.5 text-center transition-transform duration-300 group-hover:scale-105">
                  <span className="text-xs sm:text-sm font-bold text-[var(--theme-800)] dark:text-[var(--theme-200)] tracking-wide flex items-center justify-center gap-1.5">
                    <Calendar size={13} className="text-[var(--theme-500)] dark:text-[var(--theme-400)] shrink-0" />
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
    </>
  )
}

export default function StoryTimeline({ children }) {
  return (
    <div role="list" className="mx-auto flex w-full flex-col items-center gap-2 max-w-xl">
      {children}
    </div>
  )
}
