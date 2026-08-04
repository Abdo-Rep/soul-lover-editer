import { useState, useEffect } from 'react'
import { Smartphone, Download, X, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showBanner, setShowBanner] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    // Check if already in standalone mode
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
    if (outcome === 'accepted') {
      setShowBanner(false)
    }
    setDeferredPrompt(null)
  }

  if (installed || !showBanner) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        className="mb-6 overflow-hidden rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50 via-white to-pink-50 p-4 shadow-md dir-rtl"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-md shadow-rose-200">
              <Smartphone size={20} />
            </div>
            <div>
              <h4 className="flex items-center gap-1.5 text-xs font-black text-rose-900 sm:text-sm font-display">
                <span>تثبيت لوحة التحكم كـ تطبيق على هاتفك 📲</span>
                <Sparkles size={14} className="text-rose-500" />
              </h4>
              <p className="mt-0.5 text-[11px] font-semibold text-rose-600 sm:text-xs">
                احصل على وصول سريع وسلس للوحة التحكم وموقعك بنقرة واحدة من شاشة الموبايل!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md transition hover:brightness-105 active:scale-95 cursor-pointer"
            >
              <Download size={15} />
              <span>تثبيت الآن ✨</span>
            </button>

            <button
              type="button"
              onClick={() => setShowBanner(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-400 hover:bg-rose-100 transition"
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
