import React from 'react'
import { Heart, Sparkles, Music, Play, ShieldCheck, Gift } from 'lucide-react'

export default function UsHero({ hero = {}, onOpenOrder, onScrollToDemo }) {
  const {
    badge = 'The Most Romantic & Creative Gift of 2026 🎁',
    titleLine1 = 'Make Your Love Story',
    titleLine2 = 'Live Forever Online 💖',
    subtitle = 'A private, password-protected custom website celebrating your favorite photos, special songs, audio messages, live anniversary countdowns, and an interactive couples bucket list with a printable luxury QR keepsake card.',
    trustBadge = 'Loved by 2,500+ Happy Couples Worldwide ⭐⭐⭐⭐⭐',
  } = hero

  return (
    <section className="relative pt-24 pb-12 px-4 overflow-hidden text-center">
      {/* Background Radial Glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full pointer-events-none opacity-25 blur-3xl"
        style={{
          background: 'radial-gradient(circle, #ff3b68 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-lg mx-auto space-y-5">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#ff3b68]/40 bg-[#ff3b68]/10 text-[#ff758c] text-xs font-bold tracking-wide shadow-sm animate-pulse">
          <Sparkles size={14} className="text-[#ff3b68]" />
          <span>{badge}</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight">
          {titleLine1}{' '}
          <span
            className="text-transparent bg-clip-text"
            style={{
              backgroundImage: 'linear-gradient(135deg, #ff3b68 0%, #ff8da1 100%)',
            }}
          >
            {titleLine2}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm text-slate-300 leading-relaxed font-medium">
          {subtitle}
        </p>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => onOpenOrder && onOpenOrder()}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#ff3b68]/30 hover:shadow-[#ff3b68]/50 active:scale-95 transition-all cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #ff3b68 0%, #ff527b 100%)',
              border: 'none',
            }}
          >
            <Gift size={18} />
            <span>Create Your Website Now 🚀</span>
          </button>

          <button
            type="button"
            onClick={onScrollToDemo}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#0f142d] hover:bg-[#161c3d] border border-white/15 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Play size={14} className="text-[#ff3b68] fill-[#ff3b68]" />
            <span>Watch Live Interactive Demo 📱</span>
          </button>
        </div>

        {/* Trust Badges Bar */}
        <div className="pt-4 flex items-center justify-center gap-4 text-xs font-semibold text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span>100% Private & Password Locked</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Heart size={14} className="text-[#ff3b68] fill-[#ff3b68]" />
            <span>{trustBadge}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
