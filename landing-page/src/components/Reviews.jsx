import React from 'react'
import { Star, CheckCircle2 } from 'lucide-react'

export default function Reviews({ reviewsSection = {} }) {
  const {
    badge = 'تجارب حقيقية ⭐',
    title = 'أكثر من 1,500+ عميل سعيد أحبوا تجربتهم معنا',
    subtitle = 'قصص سعادة حقيقية بدأت بهدية مميزة وموقع يحفظ كل الذكريات للأبد.',
    items = [],
  } = reviewsSection

  return (
    <section className="py-8 sm:py-14 px-4 max-w-lg mx-auto">
      <div className="text-center mb-8 space-y-2.5">
        {badge && (
          <span className="inline-block px-3 py-1 rounded-full bg-[#161b33] border border-[#ff3b68]/30 text-[#ff8fa3] text-[11px] font-bold">
            {badge}
          </span>
        )}
        <h2 className="text-xl sm:text-3xl font-black text-white">
          {title}
        </h2>
        <p className="text-xs text-slate-300 font-medium px-2">
          {subtitle}
        </p>
      </div>

      <div className="space-y-3">
        {items.map((rev, i) => (
          <div
            key={i}
            className="glow-card rounded-2xl p-4 sm:p-5 text-right space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              {/* Stars */}
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(rev.rating || 5)].map((_, idx) => (
                  <Star key={idx} size={14} fill="currentColor" />
                ))}
              </div>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                "{rev.comment}"
              </p>
            </div>

            <div className="pt-2.5 border-t border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">{rev.name}</span>
                <span className="text-[10px] text-slate-400">{rev.date}</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-950/50 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                <CheckCircle2 size={11} />
                <span>مشتري موثق</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
