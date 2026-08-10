import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function FAQ({ faqsSection = {} }) {
  const {
    badge = 'إجابات فورية 💡',
    title = 'الأسئلة الشائعة',
    subtitle = 'كل ما تحتاج معرفته عن كيفية عمل الموقع وتسليمه',
    items = [],
  } = faqsSection

  const [openIdx, setOpenIdx] = useState(0)

  return (
    <section className="py-8 sm:py-14 px-4 max-w-lg mx-auto">
      <div className="text-center mb-8 space-y-2.5">
        {badge && (
          <span className="inline-block px-3 py-1 rounded-full bg-[#161b33] border border-[#ff3b68]/30 text-[#ff8fa3] text-[11px] font-bold">
            {badge}
          </span>
        )}
        <h2 className="text-xl sm:text-3xl font-black text-white">
          {title}
        </h2>
        <p className="text-xs text-slate-300 font-medium px-2">
          {subtitle}
        </p>
      </div>

      <div className="space-y-2.5">
        {items.map((item, idx) => {
          const isOpen = openIdx === idx
          return (
            <div
              key={idx}
              className="glow-card rounded-2xl overflow-hidden transition-all duration-300 border border-white/10"
            >
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-4 text-right flex items-center justify-between gap-3 font-bold text-xs sm:text-sm text-white hover:text-[#ff8fa3] transition-colors cursor-pointer"
              >
                <span className="leading-snug">{item.q}</span>
                <ChevronDown
                  size={16}
                  className={`text-[#ff3b68] transition-transform duration-300 shrink-0 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-white/5 pt-2.5">
                  {item.a}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
