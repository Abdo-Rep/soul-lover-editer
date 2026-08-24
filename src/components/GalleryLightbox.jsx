import { AnimatePresence, motion } from 'framer-motion'
import { X, ChevronRight, ChevronLeft } from 'lucide-react'
import { formatDateLong } from '../utils/formatDate'
import { useState } from 'react'
import { createPortal } from 'react-dom'

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? -40 : direction < 0 ? 40 : 0,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction > 0 ? 40 : direction < 0 ? -40 : 0,
    opacity: 0,
  }),
}

export default function GalleryLightbox({
  items,
  activeIndex,
  onClose,
  onIndexChange,
}) {
  const dragThreshold = 50
  const [direction, setDirection] = useState(0) // 1 = next, -1 = prev

  const item = items[activeIndex]
  if (!item) return null

  const formattedDate = item.date ? formatDateLong(item.date) : null
  const hasCaption = Boolean(formattedDate || item.text?.trim())

  const goNext = () => {
    if (activeIndex < items.length - 1) {
      setDirection(1)
      onIndexChange(activeIndex + 1)
    }
  }

  const goPrev = () => {
    if (activeIndex > 0) {
      setDirection(-1)
      onIndexChange(activeIndex - 1)
    }
  }

  const handleBackdropPointerDown = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3 sm:p-4 select-none touch-action-manipulation"
      onPointerDown={handleBackdropPointerDown}
      onClick={handleBackdropPointerDown}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="relative w-full max-w-sm md:max-w-md bg-white border border-rose-100/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Content Wrapper */}
        <div className="relative flex flex-col w-full p-0 m-0 overflow-hidden">
          {/* Floating Close Button directly on top of the image */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white shadow-md transition-all active:scale-95 border border-white/20"
            aria-label="إغلاق"
          >
            <X size={16} />
          </button>

          {/* Floating Image Counter Badge directly on top of the image */}
          <span className="absolute top-3 left-3 z-30 px-3 py-1 text-xs font-semibold text-white/95 bg-black/50 rounded-full shadow-md border border-white/20">
            {activeIndex + 1} / {items.length}
          </span>

          {/* Navigation Buttons overlay */}
          <button
            type="button"
            onClick={goNext}
            disabled={activeIndex === items.length - 1}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 hover:bg-white text-rose-600 shadow-md disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95"
            aria-label="التالي"
          >
            <ChevronLeft size={20} />
          </button>

          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={item.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.18, ease: 'easeOut' }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.1}
              onDragEnd={(_, info) => {
                if (info.offset.x < -dragThreshold) {
                  goPrev()
                } else if (info.offset.x > dragThreshold) {
                  goNext()
                }
              }}
              className="flex w-full flex-col items-center p-0 m-0"
            >
              {/* Image Container Edge-to-Edge */}
              <div className="w-full flex justify-center p-0 m-0 overflow-hidden bg-neutral-100/90">
                {(item.image || item.url) ? (
                  <img
                    src={item.image || item.url}
                    alt={item.text || item.description || 'ذكرى'}
                    className="w-full h-auto max-h-[62dvh] object-contain block p-0 m-0 border-none shadow-none"
                    style={{ objectPosition: item.objectPosition || 'center' }}
                    draggable={false}
                  />
                ) : (
                  <div className="flex aspect-square w-full items-center justify-center bg-gradient-to-br from-rose-100 to-pink-100 text-6xl text-rose-300 py-12">
                    ♥
                  </div>
                )}
              </div>

              {/* Caption */}
              {hasCaption && (
                <div className="w-full text-center px-4 py-4 bg-white flex flex-col items-center">
                  {formattedDate && (
                    <div className="inline-flex items-center justify-center gap-2 rounded-full border border-pink-200/80 bg-pink-50/90 px-5 py-1.5 text-xs sm:text-sm font-extrabold text-rose-800 shadow-xs mb-2">
                      <span className="text-pink-500 text-sm">🩷</span>
                      <span className="font-display tracking-wide">{formattedDate}</span>
                      <span className="text-pink-500 text-sm">📅</span>
                    </div>
                  )}
                  {(item.text || item.description)?.trim() && (
                    <p className="text-sm sm:text-base font-bold leading-relaxed text-rose-900 text-center px-2" dir="rtl">
                      {item.text || item.description}
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <button
            type="button"
            onClick={goPrev}
            disabled={activeIndex === 0}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 hover:bg-white text-rose-600 shadow-md disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95"
            aria-label="السابق"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  )
}
