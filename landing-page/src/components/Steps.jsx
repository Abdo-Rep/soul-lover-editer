import React from 'react'
import { MessageSquarePlus, UploadCloud, Rocket, Sparkles, CheckCircle } from 'lucide-react'

const STEP_ICONS = [MessageSquarePlus, UploadCloud, Rocket, CheckCircle, Sparkles]

export default function Steps({ stepsSection = {} }) {
  const {
    badge = 'سهل وسريع ⚡',
    title = 'كيف يعمل في 3 خطوات بسيطة؟',
    subtitle = 'لا تحتاج لأي خبرة تقنية، نحن نجهز كل شيء من أجلك ونسلمك الموقع جاهزاً لتقديمه كأفخم هدية.',
    items = [],
  } = stepsSection

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

      <div className="space-y-3">
        {items.map((step, idx) => {
          const Icon = STEP_ICONS[idx % STEP_ICONS.length]
          return (
            <div
              key={idx}
              className="glow-card rounded-2xl p-4 sm:p-5 text-right space-y-2 relative group"
            >
              <div className="flex justify-between items-center">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ff3b68] to-[#ff758c] flex items-center justify-center text-white shadow-md shadow-[#ff3b68]/25">
                  <Icon size={18} />
                </div>
                <span className="text-2xl font-black text-slate-700/70 font-mono">
                  {step.num || `0${idx + 1}`}
                </span>
              </div>

              <h3 className="text-sm sm:text-base font-black text-white group-hover:text-[#ff8fa3] transition-colors">
                {step.title}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                {step.desc}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
