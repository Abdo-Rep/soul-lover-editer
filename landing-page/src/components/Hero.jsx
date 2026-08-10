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
    <header
      className="relative pt-20 pb-8 sm:pt-28 sm:pb-14 px-4 text-center max-w-lg mx-auto"
      style={{ fontFamily: "'Cairo', 'Almarai', system-ui, sans-serif" }}
    >
      {/* Background Ambient Glow */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#ff3b68]/15 rounded-full blur-[90px] pointer-events-none" />

      <div className="relative z-10 space-y-4 sm:space-y-6">
        {/* Top Badge */}
        {badge && (
          <div
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[#ff8fa3] text-[11px] sm:text-xs font-bold shadow-md backdrop-blur-md"
            style={{
              background: 'rgba(22, 27, 51, 0.9)',
              border: '1px solid rgba(255, 59, 104, 0.3)',
              boxShadow: '0 4px 15px rgba(255, 59, 104, 0.1)',
            }}
          >
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
            className="w-full py-4 rounded-2xl text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #ff3b68 0%, #ff527b 100%)',
              color: '#ffffff',
              boxShadow: '0 10px 25px -4px rgba(255, 59, 104, 0.5)',
              border: 'none',
            }}
          >
            <Gift size={18} />
            <span>اصنع موقعك الآن بضغطة زر 🚀</span>
          </button>

          <button
            type="button"
            onClick={onScrollToDemo}
            className="w-full py-3.5 rounded-2xl text-slate-200 hover:text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            style={{
              background: '#141933',
              border: '1px solid #252f5a',
            }}
          >
            <Play size={15} className="text-[#ff3b68]" />
            <span>جرب النموذج الحي المباشر ✨</span>
          </button>
        </div>

        {/* Trust Badges */}
        <div className="pt-4 grid grid-cols-3 gap-2 text-[10px] sm:text-xs text-slate-300 font-bold border-t border-white/10">
          <div
            className="flex flex-col items-center justify-center text-center gap-1.5 p-2.5 rounded-2xl min-h-[68px]"
            style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
          >
            <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
            <span className="leading-tight">خصوصية وقفل</span>
          </div>

          <div
            className="flex flex-col items-center justify-center text-center gap-1.5 p-2.5 rounded-2xl min-h-[68px]"
            style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
          >
            <Music size={18} className="text-[#ff3b68] shrink-0" />
            <span className="leading-tight">أغاني ورسائل</span>
          </div>

          <div
            className="flex flex-col items-center justify-center text-center gap-1.5 p-2.5 rounded-2xl min-h-[68px]"
            style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
          >
            <Heart size={18} className="text-[#ff758c] fill-[#ff758c] shrink-0" />
            <span className="leading-tight text-[9.5px] sm:text-xs">{trustBadge || '+1,500 عميل سعيد 💖'}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
