import React, { useState } from 'react'
import { Sparkles, KeyRound, ExternalLink, Gift, Copy, Check } from 'lucide-react'

export default function UsPhonePreview({ demo = {}, onOpenOrder }) {
  const {
    url = 'https://soul-lover-gules.vercel.app/ssss',
    password = 'love',
    hintText = '🔑 Password to test the live romantic preview below:',
  } = demo

  const [copied, setCopied] = useState(false)

  const handleCopyPassword = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(password)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <section id="demo-section" className="py-10 px-4 scroll-mt-20">
      <div className="max-w-lg mx-auto space-y-6 text-center">
        {/* Section Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-bold">
            <Sparkles size={13} />
            <span>Interactive Live Experience 📱</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white leading-snug">
            Try a Live Romantic Demo
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
            Experience the music player, timeline memories, and love letter countdowns right inside this phone mockup.
          </p>
        </div>

        {/* Password Hint Card */}
        <div className="p-3.5 rounded-2xl bg-[#0f142d] border border-[#ff3b68]/30 flex items-center justify-between gap-2 max-w-sm mx-auto shadow-lg">
          <div className="flex items-center gap-2 text-left">
            <div className="w-8 h-8 rounded-xl bg-[#ff3b68]/20 text-[#ff3b68] flex items-center justify-center shrink-0">
              <KeyRound size={16} />
            </div>
            <div>
              <span className="text-[11px] text-slate-300 block leading-tight">
                {hintText}
              </span>
              <span className="text-sm font-black text-white font-mono tracking-widest">
                {password}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyPassword}
            className="px-3 py-1.5 rounded-xl bg-[#ff3b68] hover:bg-[#ff527b] text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95 shrink-0"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>

        {/* 📱 3D Smartphone Frame Mockup */}
        <div className="relative mx-auto w-full max-w-[320px] aspect-[9/18.5] rounded-[42px] p-3 bg-gradient-to-b from-[#2a304e] via-[#12162b] to-[#0a0d1d] shadow-2xl shadow-[#ff3b68]/15 border-4 border-[#252b47]">
          {/* Dynamic Island Speaker Notch */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-20 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-[#111] mr-1.5" />
            <div className="w-8 h-1 rounded-full bg-[#1e2338]" />
          </div>

          {/* Screen Container (Iframe) */}
          <div className="w-full h-full rounded-[32px] overflow-hidden bg-[#070913] relative border border-white/5">
            <iframe
              src={url}
              title="Soulove Live Demo"
              className="w-full h-full border-0"
              loading="lazy"
              allow="autoplay"
            />
          </div>
        </div>

        {/* Open Direct Link Option */}
        <div className="pt-2 flex flex-col items-center gap-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[#ff758c] hover:text-white font-bold transition-colors"
          >
            <span>Open preview in a full new tab</span>
            <ExternalLink size={13} />
          </a>

          <button
            type="button"
            onClick={() => onOpenOrder && onOpenOrder()}
            className="mt-2 w-full max-w-sm py-3.5 rounded-2xl text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#ff3b68]/30 active:scale-95 transition-all cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #ff3b68 0%, #ff527b 100%)',
              border: 'none',
            }}
          >
            <Gift size={16} />
            <span>I Want a Website Like This for My Partner 💖</span>
          </button>
        </div>
      </div>
    </section>
  )
}
