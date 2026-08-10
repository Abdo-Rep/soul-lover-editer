import React, { useEffect, useState } from 'react'
import { CheckCircle2, Heart, Sparkles, ArrowRight, Clock } from 'lucide-react'
import {
  trackPixelPurchase,
  sendMetaConversionsApiEvent,
  getStoredOrders,
  getLandingData,
} from '../data/landingStore'

export default function OrderSuccessPage({ orderId, onBackHome, pricing = {} }) {
  const [capiStatus, setCapiStatus] = useState('sending') // sending, sent, skipped
  const orders = getStoredOrders()
  const currentOrder = orders.find((o) => o.id === orderId) || orders[0] || null
  const landingData = getLandingData()
  const pixels = landingData.pixels || {}

  useEffect(() => {
    if (currentOrder) {
      // 1. Fire Browser Meta Pixel Event
      trackPixelPurchase(currentOrder, pricing.price || 399)

      // 2. 🔥 Fire Meta Conversions API (CAPI) Server Event with SHA256 User Data & Deduplication!
      if (pixels.metaPixelId && pixels.metaCapiToken) {
        sendMetaConversionsApiEvent({
          eventName: 'Purchase',
          orderData: currentOrder,
          price: pricing.price || 399,
          pixelConfig: pixels,
        }).then((res) => {
          if (res.success) setCapiStatus('sent')
          else setCapiStatus('skipped')
        })
      } else {
        setCapiStatus('skipped')
      }
    }
  }, [currentOrder, pricing.price, pixels.metaPixelId, pixels.metaCapiToken])

  return (
    <div
      className="min-h-screen bg-[#070913] text-slate-100 flex flex-col justify-between p-4 sm:p-8 selection:bg-[#ff3b68] selection:text-white"
      dir="rtl"
      style={{ fontFamily: "'Cairo', 'Almarai', system-ui, sans-serif" }}
    >
      {/* Background Ambient Glow */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <header className="max-w-3xl mx-auto w-full flex items-center justify-between py-4 border-b border-white/10">
        <button
          type="button"
          onClick={onBackHome}
          className="flex items-center gap-2 group cursor-pointer"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shadow-md"
            style={{ background: 'linear-gradient(135deg, #ff3b68 0%, #ff758c 100%)', boxShadow: '0 4px 12px rgba(255, 59, 104, 0.4)' }}
          >
            <Heart size={16} fill="currentColor" />
          </div>
          <span className="text-lg font-black text-white">Soulove <span className="text-[#ff3b68]">💖</span></span>
        </button>

        <button
          type="button"
          onClick={onBackHome}
          className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
        >
          <span>الرئيسية</span>
          <ArrowRight size={14} />
        </button>
      </header>

      {/* Main Thank You Card */}
      <main className="max-w-md mx-auto w-full my-auto py-8">
        <div
          className="rounded-3xl bg-[#0f142d] border border-emerald-500/40 p-6 sm:p-8 text-center shadow-2xl space-y-6 relative overflow-hidden"
          style={{ boxShadow: '0 20px 40px -10px rgba(16, 185, 129, 0.15)' }}
        >
          
          {/* Animated Celebration Icon */}
          <div
            className="relative mx-auto w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border-2 border-emerald-500/50 shadow-xl shadow-emerald-500/20 animate-bounce"
            style={{ animationDuration: '3s' }}
          >
            <CheckCircle2 size={44} strokeWidth={2.5} />
            <Sparkles size={18} className="absolute -top-1 -right-1 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
          </div>

          {/* Success Title */}
          <div className="space-y-2">
            <span className="inline-block px-4 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-black">
              🎉 تم استلام وتأكيد طلبك بنجاح!
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              مبروك مقدماً على هديتك المميزة 💖
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
              شكراً لاختيارك Soulove. بدأ فريقنا الآن في برمجة وتجهيز موقعكم الخاص ليكون جاهزاً خلال أقل من 15 إلى 30 دقيقة.
            </p>
          </div>

          {/* Order Details Receipt */}
          <div className="p-5 rounded-2xl bg-[#070913] border border-white/10 text-right text-xs space-y-3 font-medium">
            <div className="flex justify-between items-center border-b border-white/5 pb-2 font-mono">
              <span className="text-slate-400">رقم الطلب:</span>
              <span className="text-[#ff8fa3] font-black text-sm">#{currentOrder?.id ? currentOrder.id.slice(-6) : '789214'}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">اسم الشاب (الولد):</span>
              <span className="text-white font-bold">{currentOrder?.yourName || 'عميلنا العزيز'}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">اسم الشريكة (البنت):</span>
              <span className="text-[#ff758c] font-bold">{currentOrder?.partnerName || 'الشريكة'} 💖</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">رقم الواتساب المسجل:</span>
              <span className="text-white font-bold font-mono">{currentOrder?.phone || '010xxxxxxxx'}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">الباقة المختارة:</span>
              <span className="text-amber-300 font-bold">{currentOrder?.package || 'باقة الحب المتكاملة VIP 👑'}</span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-white/5">
              <span className="text-slate-400 font-bold">المبلغ المطلوب:</span>
              <span className="text-emerald-400 font-black text-base">{pricing?.price || '260'} ج.م</span>
            </div>
          </div>

          {/* Next Steps Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-rose-500/10 border border-amber-500/20 text-xs text-amber-200/90 text-right space-y-1.5 font-medium">
            <div className="flex items-center gap-1.5 font-bold text-amber-300">
              <Clock size={15} />
              <span>الخطوة القادمة:</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              سيتواصل معك أحد مسؤولي الدعم عبر الواتساب لإرسال مسودة الموقع، التنسيق لصوركم وأغنيتكم، وتسليم رابط الدخول وكرت الـ QR.
            </p>
          </div>

          {/* Back Home CTA Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onBackHome}
              className="w-full py-3.5 rounded-2xl text-white font-black text-sm cursor-pointer shadow-lg active:scale-95 transition-all"
              style={{
                background: 'linear-gradient(135deg, #ff3b68 0%, #ff527b 100%)',
                color: '#ffffff',
                boxShadow: '0 8px 20px -4px rgba(255, 59, 104, 0.5)',
                border: 'none',
              }}
            >
              العودة للرئيسية 💖
            </button>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-[11px] text-slate-500 py-4">
        <span>Soulove Platform © {new Date().getFullYear()} - جميع الحقوق محفوظة</span>
      </footer>
    </div>
  )
}
