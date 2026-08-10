import React from 'react'
import { Heart, Sparkles, ShieldCheck } from 'lucide-react'

export default function Footer({ onOpenOrder }) {
  return (
    <footer className="border-t border-white/10 bg-[#050711] py-14 px-4 text-center">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Logo / Brand */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-9 h-9 rounded-full bg-[#ff3b68] flex items-center justify-center text-white shadow-md shadow-[#ff3b68]/40">
            <Heart size={18} fill="currentColor" />
          </div>
          <span className="text-xl font-black text-white tracking-wide">
            Soulove <span className="text-[#ff3b68]">💖</span>
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
          المنصة الرائدة في تحويل أجمل لحظات الحب والذكريات إلى تجارب رقمية فاخرة ومحمية تدوم للأبد.
        </p>

        {/* CTA Bar */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onOpenOrder}
            className="px-6 py-3 rounded-xl btn-romantic-primary text-white text-xs sm:text-sm font-bold shadow-lg shadow-[#ff3b68]/30 cursor-pointer"
          >
            اصنع موقعكم الخاص الآن 🚀
          </button>
        </div>

        <div className="pt-6 border-t border-white/5 text-[11px] text-slate-500 font-medium flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>جميع الحقوق محفوظة © {new Date().getFullYear()} Soulove Platform.</span>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-300 cursor-pointer">سياسة الخصوصية والأمان</span>
            <span className="hover:text-slate-300 cursor-pointer">الشروط والأحكام</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
