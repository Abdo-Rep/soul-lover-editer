import React from 'react'
import { Check, Sparkles, Gift, ShieldCheck, Heart } from 'lucide-react'

export default function UsPricing({ pricing = {}, onOpenOrder }) {
  const {
    badge = 'Special Limited-Time Offer 🔥',
    packageName = 'The Complete VIP Love Sanctuary 👑',
    subtitle = 'Includes all luxury features with lifetime access — zero monthly fees',
    price = '19.99',
    oldPrice = '49.99',
    currencySymbol = '$',
    discountText = 'Special 60% OFF Today Only ⏳',
    features = [],
    buttonText = 'Claim Your Custom Website ($19.99) 🚀',
  } = pricing

  return (
    <section id="pricing-section" className="py-12 px-4 scroll-mt-20">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Section Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-bold animate-pulse">
            <Sparkles size={13} />
            <span>{badge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white leading-snug">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
            One-time payment for lifetime access. No subscriptions or recurring charges ever.
          </p>
        </div>

        {/* 👑 VIP Luxury Pricing Card */}
        <div className="relative rounded-3xl p-6 sm:p-7 bg-gradient-to-b from-[#161c3d] via-[#0f142d] to-[#0a0e24] border-2 border-[#ff3b68] shadow-2xl shadow-[#ff3b68]/20 space-y-6 text-left">
          {/* Popular Tag */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#ff3b68] text-white text-xs font-black tracking-wide shadow-md">
            ⭐ MOST POPULAR ROMANTIC GIFT
          </div>

          {/* Package Header */}
          <div className="space-y-1.5 pt-2">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <span>{packageName}</span>
            </h3>
            <p className="text-xs text-slate-300 font-medium">{subtitle}</p>
          </div>

          {/* Price Container */}
          <div className="p-4 rounded-2xl bg-[#070913]/70 border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-amber-300 font-bold block">
                {discountText}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-white">
                  {currencySymbol}{price}
                </span>
                {oldPrice && (
                  <span className="text-sm font-bold text-slate-400 line-through">
                    {currencySymbol}{oldPrice}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-black">
                One-Time Payment 💳
              </span>
              <span className="text-[10px] text-slate-400 block pt-1">
                Lifetime Access
              </span>
            </div>
          </div>

          {/* Features List */}
          <div className="space-y-2.5">
            <span className="text-xs font-extrabold text-white tracking-wide uppercase block">
              What’s Included:
            </span>
            <ul className="space-y-2">
              {features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-200">
                  <div className="w-4 h-4 rounded-full bg-[#ff3b68]/20 text-[#ff758c] flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={11} strokeWidth={3} />
                  </div>
                  <span className="leading-tight">{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA Order Button */}
          <button
            type="button"
            onClick={() => onOpenOrder && onOpenOrder(packageName)}
            className="w-full py-4 rounded-2xl text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#ff3b68]/40 hover:shadow-[#ff3b68]/60 active:scale-95 transition-all cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #ff3b68 0%, #ff527b 100%)',
              border: 'none',
            }}
          >
            <Gift size={18} />
            <span>{buttonText}</span>
          </button>

          {/* Guarantee Badge */}
          <div className="flex items-center justify-center gap-2 text-center text-xs text-slate-300 font-semibold pt-1">
            <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
            <span>100% Love-It Guarantee or Full Refund</span>
          </div>
        </div>
      </div>
    </section>
  )
}
