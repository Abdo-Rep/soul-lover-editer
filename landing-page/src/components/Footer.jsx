import React from 'react'
import { Heart, ExternalLink } from 'lucide-react'

export default function Footer({ onOpenOrder }) {
  return (
    <footer
      className="border-t border-white/10 bg-[#050711] py-12 px-4 text-center"
      style={{ fontFamily: "'Cairo', 'Almarai', system-ui, sans-serif" }}
    >
      <div className="max-w-md mx-auto space-y-6">
        {/* Logo / Brand */}
        <div className="flex items-center justify-center gap-2">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white shadow-md"
            style={{
              background: 'linear-gradient(135deg, #ff3b68 0%, #ff758c 100%)',
              boxShadow: '0 4px 12px rgba(255, 59, 104, 0.4)',
            }}
          >
            <Heart size={18} fill="currentColor" />
          </div>
          <span className="text-xl font-black text-white tracking-wide">
            Soulove <span className="text-[#ff3b68]">💖</span>
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed font-medium">
          المنصة الرائدة في تحويل أجمل لحظات الحب والذكريات إلى تجارب رقمية فاخرة ومحمية تدوم للأبد.
        </p>

        {/* CTA Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={onOpenOrder}
            className="w-full py-3.5 px-6 rounded-2xl text-white font-black text-xs sm:text-sm cursor-pointer shadow-lg active:scale-95 transition-all"
            style={{
              background: 'linear-gradient(135deg, #ff3b68 0%, #ff527b 100%)',
              color: '#ffffff',
              boxShadow: '0 8px 20px -4px rgba(255, 59, 104, 0.5)',
              border: 'none',
            }}
          >
            اصنع موقعكم الخاص الآن 🚀
          </button>
        </div>

        {/* ⚡ Developed by APEX Badge (Direct Link) */}
        <div className="pt-4 border-t border-white/5 space-y-2 text-center" dir="ltr">
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-300 font-medium">
            <span>Developed by</span>
            <a
              href="https://apex-scale.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-extrabold text-cyan-400 hover:text-cyan-300 transition-all hover:scale-105 underline decoration-cyan-500/50 underline-offset-4 tracking-wider"
            >
              <span>APEX</span>
              <ExternalLink size={12} className="text-cyan-400" />
            </a>
          </div>

          <div className="text-[11px] text-slate-500">
            <span>© {new Date().getFullYear()} Soulove Platform. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
