import { useState } from 'react'
import { Calendar } from 'lucide-react'
import { formatDateLong } from '../utils/formatDate'

export default function GalleryCard({ item, index = 0, onOpen }) {
  const formattedDate = item.date ? formatDateLong(item.date) : null
  const [isLoaded, setIsLoaded] = useState(false)
  const imgSrc = item.image || item.url

  const hasDate = Boolean(formattedDate)
  const hasText = Boolean(item.text?.trim() || item.description?.trim())

  return (
    <button
      type="button"
      onClick={() => onOpen(index)}
      className="group w-full text-center transition active:scale-[0.98] h-full"
    >
      <article className="overflow-hidden rounded-3xl border border-rose-100 dark:border-rose-800/50 bg-white dark:bg-slate-900/90 shadow-md shadow-rose-900/5 dark:shadow-rose-950/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-300/20 dark:hover:shadow-rose-900/30 text-center w-full h-full flex flex-col justify-between">
        <div className="relative aspect-square overflow-hidden bg-rose-50/60 dark:bg-slate-800/60 group/img cursor-pointer">
          {imgSrc ? (
            <>
              {!isLoaded && (
                <div className="absolute inset-0 bg-gradient-to-r from-rose-100 via-pink-100 to-rose-100 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 animate-pulse flex items-center justify-center">
                  <span className="text-rose-300 dark:text-rose-600 text-lg font-bold">♥</span>
                </div>
              )}
              <img
                src={imgSrc}
                alt={item.text || item.description || 'ذكرى'}
                onLoad={() => setIsLoaded(true)}
                className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${
                  isLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                loading="eager"
                decoding="async"
              />
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-rose-300/80 dark:text-rose-700/80">
              <span className="text-3xl">♥</span>
            </div>
          )}
        </div>

        {(hasDate || hasText) && (
          <div className="p-3 sm:p-3.5 flex-1 flex flex-col items-center justify-center">
            {hasDate && (
              <div className="mx-auto my-1 w-fit rounded-full border border-rose-100/90 dark:border-rose-700/60 bg-rose-50/80 dark:bg-rose-950/50 px-3 py-0.5 text-center shadow-xs flex items-center justify-center gap-1.5">
                <Calendar size={12} className="text-rose-500 dark:text-rose-400 shrink-0" />
                <span className="text-xs font-bold text-rose-800 dark:text-rose-200 tracking-wide">{formattedDate}</span>
              </div>
            )}
            {hasText && (
              <p className="mt-1 text-xs sm:text-sm font-semibold leading-relaxed text-rose-900 dark:text-rose-200 line-clamp-3 text-center">
                {item.text || item.description}
              </p>
            )}
          </div>
        )}
      </article>
    </button>
  )
}
