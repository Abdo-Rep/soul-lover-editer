import React, { useState } from 'react'
import { X, Send, Heart, Gift, Sparkles } from 'lucide-react'
import { saveOrder } from '../data/landingStore'

export default function OrderModal({
  isOpen,
  onClose,
  onOrderSuccess,
  selectedPackage = 'باقة الحب المتكاملة VIP 👑',
}) {
  const [formData, setFormData] = useState({
    yourName: '',
    partnerName: '',
    phone: '',
    package: selectedPackage,
    notes: '',
  })

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()

    // 1. Save order directly into database / local store
    const newOrder = saveOrder({
      yourName: formData.yourName,
      partnerName: formData.partnerName,
      phone: formData.phone,
      package: formData.package || selectedPackage,
      notes: formData.notes,
    })

    // 2. Redirect to dedicated Order Success / Thank You page for Meta Pixel Purchase tracking!
    if (onOrderSuccess) {
      onOrderSuccess(newOrder?.id)
    } else {
      window.location.hash = `#order-success?id=${newOrder?.id}`
    }

    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-lg rounded-3xl bg-[#0f142d] border border-[#ff3b68]/40 p-6 sm:p-8 shadow-2xl space-y-5 text-right relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 left-5 w-9 h-9 rounded-full bg-[#181f44] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff3b68]/20 text-[#ff8fa3] text-xs font-bold mb-2">
            <Gift size={14} />
            <span>نموذج طلب إنشاء الموقع 🚀</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            املأ بياناتك وسنجهز موقعك فوراً 💖
          </h3>
          <p className="text-xs text-slate-300">
            ادخل بياناتك وسيقوم فريقنا ببرمجة موقعكم الخاص والتواصل معكم لتسليم الرابط وكرت الـ QR.
          </p>
        </div>

        {/* Order Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              اسمك الكامل:
            </label>
            <input
              type="text"
              required
              placeholder="مثال: كريم أحمد"
              value={formData.yourName}
              onChange={(e) => setFormData({ ...formData, yourName: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-[#080b1a] border border-[#232d56] text-white text-sm focus:outline-none focus:border-[#ff3b68]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              اسم شريكك / حبيبتك:
            </label>
            <input
              type="text"
              required
              placeholder="مثال: هلا"
              value={formData.partnerName}
              onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-[#080b1a] border border-[#232d56] text-white text-sm focus:outline-none focus:border-[#ff3b68]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              رقم هاتفك / الواتساب (للتواصل واستلام الرابط):
            </label>
            <input
              type="tel"
              required
              placeholder="مثال: 010xxxxxxxx"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-[#080b1a] border border-[#232d56] text-white text-sm focus:outline-none focus:border-[#ff3b68] font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              تاريخ مميز بينكما أو ملاحظات خاصة (اختياري):
            </label>
            <textarea
              rows={2}
              placeholder="مثال: تاريخ أول لقاء 14 فبراير، أو اسم الأغنية التي تحبونها..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-[#080b1a] border border-[#232d56] text-white text-sm focus:outline-none focus:border-[#ff3b68]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl btn-romantic-primary text-white font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-[#ff3b68]/40 mt-3"
          >
            <Send size={18} />
            <span>تأكيد وإرسال الطلب الآن 🚀</span>
          </button>
        </form>
      </div>
    </div>
  )
}
