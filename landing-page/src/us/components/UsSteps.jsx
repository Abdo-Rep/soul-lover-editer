import React from 'react'
import { Sparkles, ArrowRight } from 'lucide-react'

export default function UsSteps({ stepsSection = {} }) {
  const {
    badge = 'Fast & Effortless ⚡',
    title = 'How It Works in 3 Simple Steps',
    subtitle = 'No technical skills required. We build and deliver your personalized website ready to surprise your partner in under 30 minutes.',
    items = [],
  } = stepsSection

  return (
    <section className="py-10 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Section Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-bold">
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

        {/* 3 Step Cards */}
        <div className="space-y-3.5 pt-2">
          {items.map((step, index) => (
            <div
              key={index}
              className="p-4.5 rounded-2xl bg-[#0f142d] border border-white/10 flex items-start gap-4 text-left hover:border-[#ff3b68]/40 transition-colors"
            >
              {/* Step Number Badge */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-base shrink-0 shadow-md"
                style={{
                  background: 'linear-gradient(135deg, #ff3b68 0%, #ff527b 100%)',
                }}
              >
                {step.num || `0${index + 1}`}
              </div>

              {/* Step Text */}
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-white">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
