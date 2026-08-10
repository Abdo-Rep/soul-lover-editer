import React from 'react'
import { Lock, Music, Heart, Calendar, Sparkles, QrCode, Flame, Star, ShieldCheck, Gift } from 'lucide-react'

const ICON_MAP = {
  Lock: Lock,
  Music: Music,
  Calendar: Calendar,
  Heart: Heart,
  Sparkles: Sparkles,
  QrCode: QrCode,
  Flame: Flame,
  Star: Star,
  ShieldCheck: ShieldCheck,
  Gift: Gift,
}

export default function FeatureShowcase({ featuresSection = {} }) {
  const {
    badge = 'كل ما تحتاجه لهدية استثنائية 🔥',
    title = 'مميزات حصرية تجعل هديتك ذكرى لا تُنسى أبداً',
    subtitle = 'تم تصميم كل تفصيلة في الموقع لتبهر الطرف الآخر وتترك أثراً عاطفياً عميقاً من أول ثانية يفتح فيها الرابط.',
    items = [],
  } = featuresSection

  return (
    <section className="py-8 sm:py-14 px-4 max-w-lg mx-auto">
      <div className="text-center mb-8 space-y-2.5">
        {badge && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#161b33] border border-[#ff3b68]/30 text-[#ff8fa3] text-[11px] font-bold">
            <Flame size={13} className="text-[#ff3b68]" />
            <span>{badge}</span>
          </div>
        )}
        <h2 className="text-xl sm:text-3xl font-black text-white">
          {title}
        </h2>
        <p className="text-xs text-slate-300 font-medium px-2">
          {subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {items.map((feature, idx) => {
          const Icon = ICON_MAP[feature.icon] || Sparkles
          return (
            <div
              key={idx}
              className="glow-card rounded-2xl p-4 sm:p-5 transition-all duration-300 text-right space-y-2.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ff3b68] to-[#ff758c] flex items-center justify-center text-white shadow-md shadow-[#ff3b68]/20 group-hover:scale-105 transition-transform">
                <Icon size={20} />
              </div>

              <h3 className="text-sm sm:text-base font-black text-white group-hover:text-[#ff8fa3] transition-colors">
                {feature.title}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                {feature.desc}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
