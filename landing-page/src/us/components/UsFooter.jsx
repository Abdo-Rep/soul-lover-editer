import React from 'react'
import { Heart, ShieldCheck, Mail, Gift } from 'lucide-react'

export default function UsFooter({ onOpenOrder }) {
  return (
    <footer className="mt-12 py-10 px-4 border-t border-white/10 bg-[#050711] text-center text-slate-400">
      <div className="max-w-lg mx-auto space-y-5">
        {/* Brand */}
        <div className="flex items-center justify-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white shadow-md"
            style={{
              background: 'linear-gradient(135deg, #ff3b68 0%, #ff758c 100%)',
            }}
          >
            <Heart size={14} fill="currentColor" />
          </div>
          <span className="text-base font-black text-white tracking-wide">
            Soulove <span className="text-[#ff3b68]">💖</span>
          </span>
        </div>

        <p className="text-xs max-w-sm mx-auto leading-relaxed">
          Crafting unforgettable digital sanctuaries and romantic keepsakes for couples worldwide.
        </p>

        {/* Quick CTA */}
        <div>
          <button
            type="button"
            onClick={() => onOpenOrder && onOpenOrder()}
            className="px-6 py-2.5 rounded-xl bg-[#ff3b68]/20 hover:bg-[#ff3b68]/30 border border-[#ff3b68]/40 text-[#ff758c] hover:text-white text-xs font-extrabold inline-flex items-center gap-2 transition-all cursor-pointer"
          >
            <Gift size={14} />
            <span>Create Your Couple Sanctuary ($19.99)</span>
          </button>
        </div>

        {/* Copyright */}
        <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          <span>© 2026 Soulove Inc. All Rights Reserved.</span>
          <span className="text-slate-500">Made with 💖 for Lovers Everywhere</span>
        </div>
      </div>
    </footer>
  )
}
