import React from 'react'
import { Check, Sparkles, Gift } from 'lucide-react'

export default function Pricing({ pricing = {}, onOpenOrder }) {
  const {
    badge = 'عرض خاص ومحدود اليوم فقط 🔥',
    packageName = 'باقة الحب المتكاملة VIP 👑',
    subtitle = 'تشمل جميع المميزات الحصرية مدى الحياة بدون أي اشتراكات شهرية',
    price = '399',
    oldPrice = '650',
    discountText = 'خصم حصري لفترة محدودة ⏳',
    features = [],
    buttonText = 'اطلب موقعك الآن واستلم خلال 30 دقيقة 🚀',
  } = pricing

  return (
    <section id="pricing-section" className="py-8 sm:py-14 px-4 max-w-lg mx-auto">
      <div className="text-center mb-8 space-y-2.5">
        <span className="inline-block px-3 py-1 rounded-full bg-[#161b33] border border-[#ff3b68]/30 text-[#ff8fa3] text-[11px] font-bold">
          باقة شاملة ومتكاملة 🏷️
        </span>
        <h2 className="text-xl sm:text-3xl font-black text-white">
          سعر رمزي <span className="romantic-gradient-text">لذكرى تدوم للأبد</span>
        </h2>
        <p className="text-xs text-slate-300 font-medium px-2">
          احصل على موقعك الإلكتروني الخاص وكرت الـ QR الفخم بكل المميزات
        </p>
      </div>

      {/* Single Mobile-Optimized VIP Card */}
      <div className="relative rounded-3xl p-5 sm:p-8 bg-gradient-to-b from-[#141938] to-[#0c0f24] border-2 border-[#ff3b68] shadow-2xl shadow-[#ff3b68]/20 text-right space-y-4">
        
        {badge && (
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#ff3b68] via-pink-500 to-[#ff758c] text-white text-[11px] sm:text-xs font-extrabold shadow-md shadow-[#ff3b68]/50 flex items-center gap-1 whitespace-nowrap">
            <Sparkles size={12} className="text-white animate-spin" style={{ animationDuration: '4s' }} />
            <span>{badge}</span>
          </div>
        )}

        <div className="space-y-1 text-center sm:text-right pt-2">
          <h3 className="text-xl sm:text-2xl font-black text-white">{packageName}</h3>
          <p className="text-xs text-slate-300 font-medium">{subtitle}</p>
        </div>

        {/* Price Box */}
        <div className="flex items-baseline justify-between gap-2 py-3 border-y border-white/10">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-white">{price} ج.م</span>
            {oldPrice && (
              <span className="text-base text-slate-500 line-through font-bold">{oldPrice} ج.م</span>
            )}
          </div>
          {discountText && (
            <span className="text-[10px] sm:text-xs font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-2.5 py-1 rounded-full">
              {discountText}
            </span>
          )}
        </div>

        {/* Features List */}
        <div className="space-y-2 py-1">
          <span className="text-xs font-bold text-slate-400 block mb-1">المميزات المضمنة في الباقة:</span>
          <div className="space-y-2 text-xs text-slate-200">
            {features.map((feat, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5">
                <Check size={14} className="text-[#ff3b68] shrink-0" />
                <span className="font-semibold leading-normal">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Button */}
        <button
          type="button"
          onClick={() => onOpenOrder(packageName)}
          className="w-full py-4 rounded-2xl btn-romantic-primary text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#ff3b68]/40 active:scale-95 transition-transform mt-2"
        >
          <Gift size={18} />
          <span>{buttonText}</span>
        </button>

        <div className="flex items-center justify-center gap-3 text-[10px] text-slate-400 font-medium pt-1">
          <span>🔒 دفع آمن 100%</span>
          <span>⚡ تسليم فوري</span>
          <span>💬 دعم مباشر</span>
        </div>
      </div>
    </section>
  )
}
