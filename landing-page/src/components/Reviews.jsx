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
    <section
      className="py-8 sm:py-14 px-4 max-w-lg mx-auto"
      style={{ fontFamily: "'Cairo', 'Almarai', system-ui, sans-serif" }}
    >
      <div className="text-center mb-8 space-y-2.5">
        {badge && (
          <span
            className="inline-block px-3 py-1 rounded-full text-[11px] font-bold text-[#ff8fa3]"
            style={{ background: '#161b33', border: '1px solid rgba(255, 59, 104, 0.3)' }}
          >
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
            className="rounded-2xl p-4 sm:p-5 text-right space-y-3 flex flex-col justify-between"
            style={{
              background: 'rgba(14, 18, 38, 0.85)',
              border: '1px solid rgba(255, 59, 104, 0.22)',
              boxShadow: '0 8px 25px -8px rgba(0, 0, 0, 0.6), 0 0 15px 0 rgba(255, 59, 104, 0.08)',
            }}
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
              <div
                className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(6, 78, 59, 0.5)', border: '1px solid rgba(16, 185, 129, 0.3)' }}
              >
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
