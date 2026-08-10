import React, { useState } from 'react'
import { ExternalLink, KeyRound, Heart, Copy, Check } from 'lucide-react'

export default function PhonePreview({ demo = {}, onOpenOrder }) {
  const {
    url = 'https://soul-lover-gules.vercel.app/ssss',
    password = 'love',
    hintText = '🔑 كلمة السر لتجربة الموقع الحي بالأسفل هي:',
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
    <section
      id="demo-section"
      className="py-8 sm:py-14 px-4 max-w-lg mx-auto text-center"
      style={{ fontFamily: "'Cairo', 'Almarai', system-ui, sans-serif" }}
    >
      <div className="space-y-3 mb-6">
        <span
          className="inline-block px-3 py-1 rounded-full text-[11px] font-bold text-[#ff8fa3]"
          style={{ background: '#161b33', border: '1px solid rgba(255, 59, 104, 0.3)' }}
        >
          معاينة حية ومباشرة 📱
        </span>
        <h2 className="text-xl sm:text-3xl font-black text-white">
          جرب <span className="romantic-gradient-text">الموقع الحقيقي</span> بنفسك!
        </h2>
        <p className="text-xs text-slate-300 font-medium px-2">
          تصفح الموقع وشغّل الأغاني وجرب كل شيء مباشرة من هاتفك الآن:
        </p>

        {/* 🔑 Glowing Demo Password Banner */}
        <div className="pt-1">
          <div
            className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-2xl text-amber-200 text-xs font-bold shadow-md shadow-amber-500/10 backdrop-blur-md"
            style={{
              background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.15), rgba(255, 59, 104, 0.15), rgba(168, 85, 247, 0.15))',
              border: '1px solid rgba(251, 191, 36, 0.4)',
            }}
          >
            <KeyRound size={15} className="text-amber-400 animate-bounce" />
            <span className="text-[11px]">{hintText}</span>
            <span className="px-2.5 py-0.5 rounded-lg bg-amber-400 text-slate-950 font-black font-mono tracking-wider text-xs">
              {password}
            </span>
            <button
              type="button"
              onClick={handleCopyPassword}
              className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-white text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
              title="نسخ كلمة السر"
            >
              {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span>{copied ? 'تم!' : 'نسخ'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 📱 6.7" Xiaomi / Flagship Phone Frame (Full 20:9 Aspect Ratio) */}
      <div className="relative mx-auto w-full max-w-[380px] sm:max-w-[400px]">
        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-[#ff3b68]/20 blur-3xl rounded-[42px] pointer-events-none" />

        <div
          className="relative z-10 w-full h-[740px] sm:h-[790px] flex flex-col justify-between shadow-2xl overflow-hidden"
          style={{
            background: '#070913',
            borderRadius: '40px',
            border: '4px solid #232d56',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 35px rgba(255, 59, 104, 0.2)',
          }}
        >
          
          {/* Top Status Bar with Xiaomi-Style Dot Camera */}
          <div className="h-9 w-full bg-[#0b0e20] flex items-center justify-between px-5 text-[10px] text-slate-400 font-mono border-b border-white/5 shrink-0 z-20 relative">
            <span className="text-[11px] font-bold text-slate-300">9:41</span>
            
            {/* Center Dot Camera Punch-Hole */}
            <div className="w-3.5 h-3.5 rounded-full bg-slate-950 border border-white/10 flex items-center justify-center shadow-inner">
              <div className="w-1.5 h-1.5 rounded-full bg-[#182042]" />
            </div>

            <span className="text-[#ff3b68] flex items-center gap-1 font-bold">
              <span>Soulove</span>
              <Heart size={10} fill="currentColor" />
            </span>
          </div>

          {/* Real Interactive Iframe loading the live site */}
          <div className="flex-1 w-full h-full relative bg-slate-950">
            <iframe
              src={url}
              title="Soulove Live Demo Site"
              className="w-full h-full border-0"
              allow="autoplay; encrypted-media; fullscreen"
              loading="lazy"
            />
          </div>

          {/* Bottom Bar Info & Home Indicator */}
          <div className="p-2.5 bg-[#0b0e20] border-t border-white/10 flex flex-col items-center gap-1.5 shrink-0 z-20">
            <div className="w-full flex items-center justify-between px-3 text-xs">
              <span className="text-[10px] text-slate-300 font-bold">موقع حقيقي متجاوب 6.7" ✨</span>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#ff8fa3] hover:text-white flex items-center gap-1 text-[10px] font-bold"
              >
                <span>ملء الشاشة</span>
                <ExternalLink size={11} />
              </a>
            </div>
            {/* Phone Home Bar */}
            <div className="w-32 h-1 rounded-full bg-white/20" />
          </div>

        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2.5">
        <button
          type="button"
          onClick={onOpenOrder}
          className="w-full py-4 rounded-2xl text-white font-black text-sm cursor-pointer transition-all active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #ff3b68 0%, #ff527b 100%)',
            color: '#ffffff',
            boxShadow: '0 10px 25px -4px rgba(255, 59, 104, 0.5)',
            border: 'none',
          }}
        >
          أريد إنشاء موقع مثل هذا بالضبط الآن! 🚀
        </button>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 rounded-2xl text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          style={{
            background: '#141933',
            border: '1px solid #252f5a',
          }}
        >
          <ExternalLink size={13} className="text-[#ff3b68]" />
          <span>فتح الرابط التجريبي في صفحة كاملة 🌐</span>
        </a>
      </div>
    </section>
  )
}
