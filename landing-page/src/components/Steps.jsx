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
    <section
      className="py-8 sm:py-14 px-4 max-w-lg mx-auto"
      style={{ fontFamily: "'Cairo', 'Almarai', system-ui, sans-serif" }}
    >
      <div className="text-center mb-8 space-y-2.5">
        {badge && (
          <span
            className="inline-block px-3 py-1 rounded-full text-[11px] font-bold text-[#ff8fa3]"
            style={{ background: '#161b33', border: '1px solid rgba(255, 59, 104, 0.3)' }}
          >
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
              className="rounded-2xl p-4 sm:p-5 text-right space-y-2 relative group"
              style={{
                background: 'rgba(14, 18, 38, 0.85)',
                border: '1px solid rgba(255, 59, 104, 0.22)',
                boxShadow: '0 8px 25px -8px rgba(0, 0, 0, 0.6), 0 0 15px 0 rgba(255, 59, 104, 0.08)',
              }}
            >
              <div className="flex justify-between items-center">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                  style={{
                    background: 'linear-gradient(135deg, #ff3b68 0%, #ff758c 100%)',
                    boxShadow: '0 4px 15px rgba(255, 59, 104, 0.3)',
                  }}
                >
                  <Icon size={18} />
                </div>
                <span className="text-2xl font-black text-slate-600 font-mono">
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
