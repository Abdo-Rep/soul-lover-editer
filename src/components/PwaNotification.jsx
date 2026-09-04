import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Smartphone } from 'lucide-react'

export default function PwaNotification() {
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    // Only show on client browser, not inside already installed PWA
    if (typeof window === 'undefined') return
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone
    if (isStandalone) return

    // Show subtle toast once per session if PWA install prompt is triggered or on mobile visit
    const handler = (e) => {
      e.preventDefault()
      triggerToast()
    }

    const triggerToast = () => {
      const hasShown = sessionStorage.getItem('soulove-pwa-toast-shown')
      if (!hasShown) {
        setShowToast(true)
        sessionStorage.setItem('soulove-pwa-toast-shown', 'true')
        setTimeout(() => setShowToast(false), 4500)
      }
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Fallback for mobile devices where event fires early or iOS Safari
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    if (isMobile) {
      const timer = setTimeout(triggerToast, 2000)
      return () => {
        clearTimeout(timer)
        window.removeEventListener('beforeinstallprompt', handler)
      }
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  return (
    <AnimatePresence>
      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-[90%] max-w-sm"
        >
          <div className="flex items-center gap-3 rounded-2xl bg-rose-900/90 backdrop-blur-md px-4 py-3 text-white shadow-xl border border-rose-700/50">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-300">
              <Smartphone size={20} />
            </div>
            <div className="flex-1 text-right dir-rtl">
              <p className="text-xs font-semibold text-rose-100">تنبيه التطبيق 📱</p>
              <p className="text-[11px] text-rose-200/90 leading-tight mt-0.5">
                يمكنك إضافة هذا الموقع لشاشتك الرئيسية للتصفح كـ تطبيق كامل
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
