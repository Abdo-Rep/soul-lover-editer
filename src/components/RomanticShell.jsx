import { useEffect } from 'react'
import { Sparkles, X, Home, Image } from 'lucide-react'
import BackButton from './BackButton'
import MusicPlayer from './MusicPlayer'
import { useMusic } from '../context/MusicContext'

export default function RomanticShell({
  children,
  showMusic = false,
  showBack = false,
  onBack,
  showWishlistToggle = false,
  onWishlistToggle,
  isWishlistOpen = false,
  showGalleryToggle = false,
  onGalleryToggle,
  isGalleryOpen = false,
  showHome = false,
  onHomeClick,
}) {
  const { tryWelcomeMusicStart } = useMusic()

  useEffect(() => {
    if (showMusic) {
      tryWelcomeMusicStart()
    }
  }, [showMusic, tryWelcomeMusicStart])

  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      {(showBack || showWishlistToggle || showGalleryToggle || showHome) ? (
        <div
          className="pointer-events-none fixed inset-x-0 z-40 flex justify-center px-5 sm:px-6"
          style={{ top: 'max(0.75rem, env(safe-area-inset-top))' }}
        >
          <div className="flow-screen pointer-events-auto flex w-full justify-between items-center">
            {showBack ? (
              <BackButton onClick={onBack} />
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              {showHome ? (
                <button
                  type="button"
                  onClick={onHomeClick}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 border border-emerald-100/90 text-[#059669] shadow-xs backdrop-blur-md transition-all hover:scale-105 active:scale-95"
                  title="الرجوع للترحيب"
                >
                  <Home size={20} />
                </button>
              ) : null}

              {showGalleryToggle ? (
                <button
                  type="button"
                  onClick={onGalleryToggle}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 border border-emerald-100/90 text-[#059669] shadow-xs backdrop-blur-md transition-all hover:scale-105 active:scale-95"
                  title={isGalleryOpen ? "إغلاق ذكرياتنا" : "ذكرياتنا"}
                >
                  {isGalleryOpen ? <X size={20} /> : <Image size={20} />}
                </button>
              ) : null}

              {showWishlistToggle ? (
                <button
                  type="button"
                  onClick={onWishlistToggle}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 border border-emerald-100/90 text-[#059669] shadow-xs backdrop-blur-md transition-all hover:scale-105 active:scale-95"
                  title={isWishlistOpen ? "إغلاق قائمة الأمنيات" : "قائمة الأمنيات"}
                >
                  {isWishlistOpen ? <X size={20} /> : <Sparkles size={20} />}
                </button>
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
          className="pointer-events-none fixed inset-x-0 z-50 flex justify-center px-5 sm:px-6"
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
