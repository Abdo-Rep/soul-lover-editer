import { useEffect, useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles, X, Home, Image, Plus, Calendar, Clock, Heart } from 'lucide-react'
import BackButton from './BackButton'
import MusicPlayer from './MusicPlayer'
import { useMusic } from '../context/MusicContext'
import { useContent } from '../context/ContentContext'

export default function RomanticShell({
  children,
  showMusic = false,
  showBack = false,
  onBack,
  showGalleryToggle = false,
  onGalleryToggle,
  isGalleryOpen = false,
  showNavMenu = false,
  currentStep = 'welcome',
  onNavigate,
}) {
  const { tryWelcomeMusicStart } = useMusic()
  const { content } = useContent()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const lang = content?.language || 'ar'
  const isEn = lang === 'en' || lang === 'en-GB'
  const isEs = lang === 'es'

  const navItems = [
    { id: 'welcome', label: isEs ? 'Inicio' : isEn ? 'Home' : 'الرئيسية', icon: Home },
    { id: 'story', label: isEs ? 'Nuestra Historia' : isEn ? 'Our Story' : 'القصة', icon: Calendar },
    { id: 'countdowns', label: isEs ? 'Contadores' : isEn ? 'Countdowns' : 'العدادات التنازلية', icon: Clock },
    { id: 'wishlist', label: isEs ? 'Lista de Deseos' : isEn ? 'Wishlist' : 'قائمة الأمنيات', icon: Sparkles },
    { id: 'final', label: isEs ? 'Página Final' : isEn ? 'Final Page' : 'الصفحة الأخيرة', icon: Heart },
  ]

  useEffect(() => {
    if (showMusic) {
      tryWelcomeMusicStart()
    }
  }, [showMusic, tryWelcomeMusicStart])

  // Close menu on escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }
    if (isMenuOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMenuOpen])

  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      {/* Backdrop for open navigation menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/15 dark:bg-black/30 backdrop-blur-[2px]"
          />
        )}
      </AnimatePresence>

      {(showBack || showGalleryToggle || showNavMenu) ? (
        <div
          className="pointer-events-none fixed inset-x-0 z-50 flex justify-center px-5 sm:px-6"
          style={{ top: 'max(0.75rem, env(safe-area-inset-top))' }}
        >
          <div className="w-full max-w-[26rem] mx-auto pointer-events-auto flex justify-between items-center overflow-visible">
            {showBack ? (
              <BackButton onClick={onBack} />
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              {/* 1. Gallery Icon (First in top action controls) */}
              {showGalleryToggle ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false)
                    onGalleryToggle?.()
                  }}
                  className="glass-card flex h-10 w-10 items-center justify-center rounded-full text-rose-600 dark:text-rose-300 shadow-md backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  title={isGalleryOpen ? (isEs ? "Cerrar recuerdos" : isEn ? "Close memories" : "إغلاق المعرض") : (isEs ? "Recuerdos" : isEn ? "Our Memories" : "المعرض")}
                >
                  {isGalleryOpen ? <X size={20} /> : <Image size={20} />}
                </button>
              ) : null}

              {/* 2. Plus / Menu Button with vertical dropdown */}
              {showNavMenu ? (
                <div className="relative" ref={menuRef}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsMenuOpen((prev) => !prev)
                    }}
                    className={`glass-card flex h-10 w-10 items-center justify-center rounded-full shadow-md backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                      isMenuOpen
                        ? 'bg-rose-500 text-white dark:bg-rose-600'
                        : 'text-rose-600 dark:text-rose-300'
                    }`}
                    title={isMenuOpen ? (isEs ? "Cerrar menú" : isEn ? "Close menu" : "إغلاق القائمة") : (isEs ? "Navegación" : isEn ? "Quick Navigation" : "التنقل السريع")}
                    aria-expanded={isMenuOpen}
                  >
                    <Plus
                      size={22}
                      className={`transition-transform duration-300 ease-out ${
                        isMenuOpen ? 'rotate-45' : 'rotate-0'
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.92 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute top-12 end-0 z-50 flex flex-col gap-1 p-2 rounded-2xl border border-rose-200/80 dark:border-rose-800/60 bg-white dark:bg-slate-900 shadow-2xl backdrop-blur-xl min-w-[170px]"
                      >
                        {navItems.map(({ id, label, icon: Icon }) => {
                          const isActive = !isGalleryOpen && currentStep === id
                          return (
                            <button
                              key={id}
                              type="button"
                              onClick={() => {
                                setIsMenuOpen(false)
                                onNavigate?.(id)
                              }}
                              className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-start cursor-pointer ${
                                isActive
                                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xs'
                                  : 'text-rose-700 dark:text-rose-200 hover:bg-rose-50 dark:hover:bg-slate-800 active:scale-95'
                              }`}
                            >
                              <Icon size={16} className={isActive ? 'text-white' : 'text-rose-500 dark:text-rose-400'} />
                              <span>{label}</span>
                            </button>
                          )
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <div className="relative z-10 flex min-h-dvh flex-col">
        <main
          className="flex w-full flex-1 flex-col items-center justify-start overflow-x-hidden px-5 py-10 sm:px-6"
          style={{
            paddingBottom: 'calc(6.5rem + env(safe-area-inset-bottom))',
          }}
        >
          {children}
        </main>
      </div>

      {showMusic ? (
        <div
          className="pointer-events-none fixed inset-x-0 z-30 flex justify-center px-5 sm:px-6"
          style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          <div className="flow-screen pointer-events-auto w-full">
            <MusicPlayer />
          </div>
        </div>
      ) : null}
    </div>
  )
}
