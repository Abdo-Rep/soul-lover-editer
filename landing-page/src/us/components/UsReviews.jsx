import React from 'react'
import { Star, Heart, Sparkles, MapPin } from 'lucide-react'

export default function UsReviews({ reviewsSection = {} }) {
  const {
    badge = 'Real Couples ⭐',
    title = 'Loved by Over 2,500+ Couples in the US',
    subtitle = 'Real stories from partners who gave the most meaningful, emotional gift.',
    items = [],
  } = reviewsSection

  return (
    <section className="py-10 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Section Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-bold">
            <Star size={13} className="fill-amber-300" />
            <span>{badge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white leading-snug">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Reviews Cards List */}
        <div className="space-y-3.5 pt-2">
          {items.map((rev, index) => (
            <div
              key={index}
              className="p-4.5 rounded-2xl bg-[#0f142d] border border-white/10 space-y-3 text-left hover:border-[#ff3b68]/40 transition-all shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                    <span>{rev.name}</span>
                    <Heart size={13} className="text-[#ff3b68] fill-[#ff3b68]" />
                  </h3>
                  {rev.location && (
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin size={10} className="text-slate-400" />
                      <span>{rev.location}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-0.5 text-amber-400">
                  {[...Array(rev.rating || 5)].map((_, i) => (
                    <Star key={i} size={13} className="fill-amber-400" />
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed italic">
                "{rev.comment}"
              </p>

              <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-white/5 pt-2">
                <span className="text-emerald-400 font-bold">✓ Verified Couple Purchase</span>
                <span>{rev.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
