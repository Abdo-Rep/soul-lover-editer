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
    <section
      className="py-8 sm:py-14 px-4 max-w-lg mx-auto"
      style={{ fontFamily: "'Cairo', 'Almarai', system-ui, sans-serif" }}
    >
      <div className="text-center mb-8 space-y-2.5">
        {badge && (
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[#ff8fa3] text-[11px] font-bold"
            style={{ background: '#161b33', border: '1px solid rgba(255, 59, 104, 0.3)' }}
          >
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
              className="rounded-2xl p-4 sm:p-5 transition-all duration-300 text-right space-y-2.5 group"
              style={{
                background: 'rgba(14, 18, 38, 0.85)',
                border: '1px solid rgba(255, 59, 104, 0.22)',
                boxShadow: '0 8px 25px -8px rgba(0, 0, 0, 0.6), 0 0 15px 0 rgba(255, 59, 104, 0.08)',
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-transform group-hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #ff3b68 0%, #ff758c 100%)',
                  boxShadow: '0 4px 15px rgba(255, 59, 104, 0.3)',
                }}
              >
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
