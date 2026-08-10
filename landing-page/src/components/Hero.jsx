import React from 'react'
import { Heart, Sparkles, Music, Play, ShieldCheck, Gift } from 'lucide-react'

export default function Hero({ hero = {}, onOpenOrder, onScrollToDemo }) {
  const {
    badge = 'الهدية الأكثر رومانسية وابتكاراً لعام 2026 🎁',
    titleLine1 = 'اجعل قصة حبكم تعيش للأبد',
    titleLine2 = 'في موقع إلكتروني خاص بكما 💖',
    subtitle = 'موقع محمي بكلمة سر يجمع أجمل لحظاتكم، أغانيكم، رسائلكم الصوتية، عدادات أهم أيامكم، وقائمة أمنيات تفاعلية مع كود QR مطبوع يفتح بلمسة واحدة.',
    trustBadge = 'أكثر من 1,500+ عميل سعيد 💖',
  } = hero

  return (
    <header className="relative pt-20 pb-8 sm:pt-28 sm:pb-14 px-4 text-center max-w-lg mx-auto">
      {/* Background Ambient Glow */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#ff3b68]/15 rounded-full blur-[90px] pointer-events-none" />

      <div className="relative z-10 space-y-4 sm:space-y-6">
        {/* Top Badge */}
        {badge && (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#161b33]/90 border border-[#ff3b68]/30 text-[#ff8fa3] text-[11px] sm:text-xs font-bold shadow-md shadow-[#ff3b68]/10 backdrop-blur-md">
            <Sparkles size={13} className="text-[#ff3b68] animate-pulse" />
            <span>{badge}</span>
          </div>
        )}

        {/* Main Headline */}
        <h1 className="text-[26px] sm:text-4xl md:text-5xl font-extrabold text-white leading-[1.35] tracking-normal">
          {titleLine1} <br />
          <span className="romantic-gradient-text">{titleLine2}</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium px-2">
          {subtitle}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 pt-2">
          <button
            type="button"
            onClick={onOpenOrder}
            className="w-full py-3.5 sm:py-4 rounded-2xl btn-romantic-primary text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#ff3b68]/30"
          >
            <Gift size={18} />
            <span>اصنع موقعك الآن بضغطة زر 🚀</span>
          </button>

          <button
            type="button"
            onClick={onScrollToDemo}
            className="w-full py-3 rounded-2xl bg-[#141933] hover:bg-[#1a2142] border border-[#252f5a] text-slate-200 hover:text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Play size={15} className="text-[#ff3b68]" />
            <span>جرب النموذج الحي المباشر ✨</span>
          </button>
        </div>

        {/* Trust Badges */}
        <div className="pt-4 grid grid-cols-3 gap-2 text-[10px] sm:text-xs text-slate-400 font-bold border-t border-white/5">
          <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/5">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span>خصوصية وقفل</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/5">
            <Music size={16} className="text-[#ff3b68]" />
            <span>أغاني ورسائل</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/5">
            <Heart size={16} className="text-[#ff758c] fill-[#ff758c]" />
            <span className="truncate">{trustBadge}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
