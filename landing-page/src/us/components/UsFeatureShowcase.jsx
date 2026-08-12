import React from 'react'
import {
  Lock,
  Music,
  Calendar,
  Heart,
  Sparkles,
  QrCode,
  ShieldCheck,
  Star,
} from 'lucide-react'

const ICON_MAP = {
  Lock: Lock,
  Music: Music,
  Calendar: Calendar,
  Heart: Heart,
  Sparkles: Sparkles,
  QrCode: QrCode,
  ShieldCheck: ShieldCheck,
  Star: Star,
}

export default function UsFeatureShowcase({ featuresSection = {} }) {
  const {
    badge = 'Everything For an Unforgettable Gift 🔥',
    title = 'Exclusive Features Designed to Touch Their Heart',
    subtitle = 'Every detail is thoughtfully crafted to give your partner goosebumps and create a lasting memory from the moment they scan the QR code.',
    items = [],
  } = featuresSection

  return (
    <section className="py-10 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Section Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#ff3b68]/30 bg-[#ff3b68]/10 text-[#ff758c] text-xs font-bold">
            <Sparkles size={13} />
            <span>{badge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white leading-snug">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* 6 Luxury Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
          {items.map((item, index) => {
            const IconComponent = ICON_MAP[item.icon] || Sparkles
            return (
              <div
                key={index}
                className="group relative p-4.5 rounded-2xl bg-[#0f142d] border border-white/10 hover:border-[#ff3b68]/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#ff3b68]/10 space-y-2.5 text-left"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform"
                  style={{
                    background: 'linear-gradient(135deg, #ff3b68 0%, #ff527b 100%)',
                  }}
                >
                  <IconComponent size={20} />
                </div>
                <h3 className="text-sm font-extrabold text-white">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
