import React, { useState } from 'react'
import { Sparkles, ChevronDown } from 'lucide-react'

export default function UsFAQ({ faqsSection = {} }) {
  const {
    badge = 'Instant Answers 💡',
    title = 'Frequently Asked Questions',
    subtitle = 'Everything you need to know about ordering, delivery, and gifting.',
    items = [],
  } = faqsSection

  const [openIdx, setOpenIdx] = useState(0)

  const toggleFaq = (idx) => {
    setOpenIdx(openIdx === idx ? -1 : idx)
  }

  return (
    <section className="py-10 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Section Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-bold">
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

        {/* Accordion List */}
        <div className="space-y-3 pt-2">
          {items.map((faq, index) => {
            const isOpen = openIdx === index
            return (
              <div
                key={index}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden text-left ${
                  isOpen
                    ? 'bg-[#12183b] border-[#ff3b68]/50 shadow-md'
                    : 'bg-[#0f142d] border-white/10 hover:border-white/20'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full p-4 flex items-center justify-between gap-3 text-left cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-extrabold text-white">
                    {faq.q}
                  </span>
                  <div
                    className={`w-6 h-6 rounded-full bg-white/5 flex items-center justify-center shrink-0 text-slate-300 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-[#ff3b68]' : ''
                    }`}
                  >
                    <ChevronDown size={14} />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-300 leading-relaxed border-t border-white/5">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
