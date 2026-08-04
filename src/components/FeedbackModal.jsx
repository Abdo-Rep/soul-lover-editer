import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react'

export default function FeedbackModal({ isOpen, onClose, type = 'success', title, message, autoDismissMs = 3500 }) {
  useEffect(() => {
    if (!isOpen || !autoDismissMs) return
    const timer = setTimeout(() => {
      onClose?.()
    }, autoDismissMs)
    return () => clearTimeout(timer)
  }, [isOpen, autoDismissMs, onClose])

  if (!isOpen || typeof document === 'undefined') return null

  const isSuccess = type === 'success'

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-sm rounded-3xl glass-card p-6 text-center shadow-2xl border border-white/20 overflow-hidden"
        >
          {/* Ambient Glow */}
          <div
            className={`absolute -top-12 -left-12 h-32 w-32 rounded-full blur-2xl opacity-40 ${
              isSuccess ? 'bg-emerald-400' : 'bg-rose-500'
            }`}
          />

          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 left-4 flex h-8 w-8 items-center justify-center rounded-full bg-rose-50/50 text-rose-400 hover:bg-rose-100 dark:bg-slate-800 dark:text-slate-300 transition"
            aria-label="إغلاق"
          >
            <X size={16} />
          </button>

          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 dark:bg-slate-800/80 shadow-inner">
            {isSuccess ? (
              <CheckCircle2 className="text-emerald-500" size={30} />
            ) : (
              <AlertCircle className="text-rose-500" size={30} />
            )}
          </div>

          <h3 className="text-base font-bold text-rose-900 dark:text-white mb-1.5 flex items-center justify-center gap-1.5">
            {isSuccess ? <Sparkles size={16} className="text-amber-400" /> : null}
            <span>{title}</span>
          </h3>

          <p className="text-xs text-rose-600/90 dark:text-slate-300 leading-relaxed font-medium">
            {message}
          </p>

          <button
            type="button"
            onClick={onClose}
            className="mt-5 w-full rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 py-2.5 text-xs font-bold text-white shadow-lg transition active:scale-95 hover:opacity-95"
          >
            {isSuccess ? 'حسناً 👍' : 'موافق'}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  )
}
