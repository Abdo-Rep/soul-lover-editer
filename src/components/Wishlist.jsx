import { useState } from 'react'
import { Heart, Check, Sparkles, Trophy, Star, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useContent } from '../context/ContentContext'
import NextButton from './NextButton'

export default function Wishlist({ onNext }) {
  const { content, toggleWishlistItem, t } = useContent()
  const wishlist = content.wishlist ?? []

  const isEn = content.language === 'en' || content.language === 'en-GB'
  const isEs = content.language === 'es'

  const handleToggle = (id) => {
    toggleWishlistItem(id)
  }

  const completedCount = wishlist.filter((item) => item.completed).length
  const progressPercent = wishlist.length > 0 ? Math.round((completedCount / wishlist.length) * 100) : 0
  const isAllCompleted = wishlist.length > 0 && completedCount === wishlist.length

  return (
    <div className={`w-full max-w-lg mx-auto px-3 sm:px-4 py-4 ${isEn || isEs ? 'dir-ltr' : 'dir-rtl'}`}>
      {/* 👑 LUXURY HEADER & BADGES */}
      <div className="text-center mb-6">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 rounded-full border border-rose-200/80 bg-gradient-to-r from-rose-100/90 via-white/95 to-pink-100/90 px-4 py-1.5 text-xs font-extrabold text-rose-800 shadow-md shadow-rose-900/5 mb-3.5 backdrop-blur-md"
        >
          <Sparkles size={14} className="text-rose-500 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="font-display tracking-wide">
            {isEs ? 'Nuestra lista de deseos 💖' : isEn ? 'Our Bucket List 💖' : 'أمنياتنا السعيدة 💖'}
          </span>
          <Heart size={13} className="text-rose-500 fill-rose-500 animate-pulse" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="font-display text-2xl sm:text-3xl font-black text-rose-950 mb-2 tracking-tight drop-shadow-xs"
        >
          {isEs ? 'Cosas que quiero hacer contigo 💖' : isEn ? 'Things I want to do with you 💖' : 'حاجات نفسي نعملها سوا 💖'}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-xs sm:text-sm text-rose-700/90 max-w-md mx-auto font-bold leading-relaxed"
        >
          {isEs ? 'Pequeños sueños e ilusiones, los marcamos juntos al cumplirlos 💕' : isEn ? 'Small dreams we wish for, marking them together as we live them 💕' : 'أحلام صغيرة وحاجات حلوة بنتمناها، وكل ما نعمل حاجة منهم بنعلم عليها سوا 💕'}
        </motion.p>
      </div>

      {/* 💖 LUXURY PROGRESS CARD */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="group relative overflow-hidden rounded-[30px] border border-rose-200/90 bg-gradient-to-br from-white/95 via-rose-50/60 to-pink-50/90 p-5 mb-6 shadow-xl shadow-rose-900/10 backdrop-blur-xl transition-all duration-500 hover:shadow-2xl hover:shadow-rose-300/25"
      >
        {/* Ambient Glow */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br from-rose-300/30 to-pink-200/20 blur-2xl transition-all duration-500 group-hover:scale-150" />

        <div className="flex justify-between items-center mb-3.5">
          {/* Percentage badge with Rose Gradient & Glow */}
          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 px-4 py-1 text-xs font-black text-white shadow-md shadow-rose-300/80">
            <Star size={12} className="fill-white text-white" />
            <span>{progressPercent}%</span>
          </span>

          {/* Right Status */}
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-black text-rose-900 font-display">
              {isAllCompleted
                ? (isEs ? '🎉 ¡Cumplimos todos nuestros sueños juntos!' : isEn ? '🎉 We achieved all our dreams together!' : '🎉 أنجزنا كل أحلامنا سوا!')
                : (isEs ? `${completedCount} de ${wishlist.length} deseos cumplidos` : isEn ? `${completedCount} of ${wishlist.length} wishes completed` : `${completedCount} من أصل ${wishlist.length} أحلام تم تحقيقها`)}
            </span>
            <Trophy size={16} className={isAllCompleted ? 'text-amber-500 animate-bounce' : 'text-rose-400'} />
          </div>
        </div>

        {/* Progress Track */}
        <div className="relative w-full h-3.5 bg-rose-100/80 rounded-full overflow-hidden p-0.5 shadow-inner border border-rose-200/60">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 rounded-full shadow-md shadow-rose-300 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/25 animate-pulse" />
          </motion.div>
        </div>
      </motion.div>

      {/* 🌹 LUXURY ROMANTIC WISH CARDS LIST */}
      <div className="space-y-3.5 max-h-[52dvh] overflow-y-auto pr-1 romantic-scrollbar pb-4">
        {wishlist.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-[30px] border border-rose-200/80 bg-white/90 p-8 text-center backdrop-blur-md shadow-lg shadow-rose-900/5"
          >
            <Heart className="mx-auto mb-3 text-rose-400 fill-rose-100 animate-bounce" size={44} />
            <h4 className="text-base font-extrabold text-rose-900 font-display">
              {isEs ? '¡La lista está vacía! 💖' : isEn ? 'The list is empty! 💖' : 'القائمة فارغة الآن 💖'}
            </h4>
            <p className="text-xs text-rose-500 font-semibold mt-1">
              {isEs ? 'Puedes agregar deseos desde el panel de control' : isEn ? 'You can add dreams from the dashboard' : 'يمكنك إضافة الأحلام والأمنيات الجميلة من لوحة التحكم'}
            </p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {wishlist.map((item, index) => {
              const isDone = Boolean(item.completed)
              return (
                <motion.div
                  key={item.id || index}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleToggle(item.id)}
                  className={`group relative overflow-hidden rounded-[24px] border p-4 cursor-pointer transition-all duration-300 flex items-center justify-between gap-3 text-right backdrop-blur-md ${
                    isDone
                      ? 'border-rose-300/80 bg-gradient-to-r from-rose-100/90 via-white/95 to-pink-100/80 dark:border-rose-700/60 dark:from-slate-900/95 dark:to-rose-950/70 shadow-sm'
                      : 'border-rose-100 dark:border-rose-800/60 bg-gradient-to-r from-white/95 via-rose-50/40 to-pink-50/50 dark:from-slate-900/95 dark:to-slate-800/90 shadow-md shadow-rose-900/5 hover:border-rose-300 dark:hover:border-rose-600 hover:shadow-xl hover:shadow-rose-300/20 dark:hover:shadow-rose-900/30 hover:-translate-y-0.5'
                  }`}
                >
                  {/* Left Side: Dynamic Status Badge */}
                  {isDone ? (
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-3.5 py-1 text-xs font-black text-white shadow-sm shadow-rose-200 dark:shadow-rose-900">
                      <CheckCircle2 size={13} className="text-white" />
                      <span>{isEs ? 'Logrado 💖' : isEn ? 'Done 💖' : 'تم بحب 💖'}</span>
                    </span>
                  ) : (
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-rose-200/90 dark:border-rose-700/60 bg-gradient-to-r from-rose-50 via-white to-pink-50 dark:from-slate-800/90 dark:to-slate-900 px-3.5 py-1 text-xs font-extrabold text-rose-700 dark:text-rose-200 shadow-xs group-hover:border-rose-300">
                      <Sparkles size={12} className="text-rose-500 dark:text-rose-400" />
                      <span>{isEs ? 'Sueño por cumplir ✨' : isEn ? 'A dream we wait for ✨' : 'حُلم ننتظره ✨'}</span>
                    </span>
                  )}


                  {/* Right Side: Text & Interactive Romantic Heart Button */}
                  <div className="flex items-center gap-3.5 flex-1 min-w-0 justify-end dir-rtl">
                    <span
                      className={`text-sm sm:text-base font-extrabold leading-relaxed truncate ${
                        isDone ? 'text-rose-900/50 dark:text-rose-300/60 line-through' : 'text-rose-950 dark:text-white font-display'
                      }`}
                    >
                      {item.text}
                    </span>

                    {/* Round 3D Interactive Heart Checkbox */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggle(item.id)
                      }}
                      aria-label={isDone ? 'إلغاء التحديد' : 'تحديد كمنجز'}
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                        isDone
                          ? 'bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-md shadow-rose-200 scale-105'
                          : 'border border-rose-200 dark:border-rose-800 bg-gradient-to-tr from-rose-50 to-pink-50 dark:from-slate-800 dark:to-slate-900 text-rose-500 shadow-xs group-hover:scale-110 group-hover:border-rose-400 group-hover:bg-rose-500 group-hover:text-white'
                      }`}
                    >
                      {isDone ? (
                        <Check size={20} strokeWidth={3} className="text-white" />
                      ) : (
                        <Heart size={19} className="fill-current" />
                      )}
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>

      {/* 🚀 NEXT STEP BUTTON */}
      {onNext && (
        <div className="mt-6 w-full flex justify-center">
          <NextButton onClick={onNext} defaultText={t.finalTab || 'الرسالة الأخيرة 💌'} />
        </div>
      )}
    </div>
  )
}
