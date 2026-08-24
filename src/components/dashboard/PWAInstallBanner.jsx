import { useState, useEffect } from 'react'
import { Smartphone, Download, X, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function PWAInstallBanner({ dark = false }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showBanner, setShowBanner] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setInstalled(true)
      return
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowBanner(true)
    }

    const handleAppInstalled = () => {
      setInstalled(true)
      setShowBanner(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setShowBanner(false)
    setDeferredPrompt(null)
  }

  if (installed || !showBanner) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        className="pwa-install-banner mb-4 overflow-hidden rounded-2xl p-4 dir-rtl"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="pwa-banner-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white">
              <Smartphone size={20} />
            </div>
            <div>
              <h4 className="pwa-banner-title flex items-center gap-1.5 text-xs font-black sm:text-sm">
                <span>تثبيت لوحة التحكم كـ تطبيق 📲</span>
                <Sparkles size={14} className="text-[var(--theme-400)] dark:text-[var(--theme-300)]" />
              </h4>
              <p className="pwa-banner-desc mt-0.5 text-[11px] font-semibold sm:text-xs">
                احصل على وصول سريع وسلس بنقرة واحدة من شاشة الموبايل!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleInstallClick}
              className="pwa-banner-btn flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition active:scale-95 cursor-pointer"
            >
              <Download size={15} />
              <span>تثبيت الآن ✨</span>
            </button>

            <button
              type="button"
              onClick={() => setShowBanner(false)}
              className="pwa-banner-close flex h-8 w-8 items-center justify-center rounded-lg transition"
              title="إغلاق"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
