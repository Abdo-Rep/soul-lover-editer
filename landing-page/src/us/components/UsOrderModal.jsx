import React, { useState } from 'react'
import { X, Gift, ShieldCheck, Heart, Sparkles, Send, Mail, Phone, User, Calendar, MessageSquare } from 'lucide-react'
import { saveOrderUs } from '../../data/landingStoreUs'

export default function UsOrderModal({
  isOpen,
  onClose,
  onOrderSuccess,
  selectedPackage = 'The Complete VIP Love Sanctuary 👑',
}) {
  const [formData, setFormData] = useState({
    yourName: '',
    partnerName: '',
    email: '',
    phone: '',
    specialDate: '',
    notes: '',
    package: selectedPackage,
  })

  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.yourName || !formData.email) {
      alert('Please enter your name and email address so we can deliver your custom website!')
      return
    }

    setLoading(true)
    try {
      const order = await saveOrderUs(formData)
      if (onOrderSuccess) {
        onOrderSuccess(order.id, formData)
      }
      onClose()
    } catch (err) {
      console.error('Order creation failed:', err)
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0f142d] border-2 border-[#ff3b68]/40 shadow-2xl p-6 sm:p-7 max-h-[92dvh] overflow-y-auto z-10 space-y-5 text-left text-slate-100">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ff3b68]/20 text-[#ff758c] text-[11px] font-bold">
              <Gift size={12} />
              <span>Instant 30-Minute Digital Delivery 🚀</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Create Your Couple Sanctuary 💖
            </h2>
            <p className="text-xs text-slate-300">
              Fill in your details below and our team will build your custom website immediately!
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Selected Package Banner */}
        <div className="p-3 rounded-2xl bg-[#070913] border border-[#ff3b68]/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#ff3b68]" />
            <div>
              <span className="text-[10px] text-slate-400 block">Selected Package</span>
              <span className="text-xs font-black text-white">{selectedPackage}</span>
            </div>
          </div>
          <span className="text-sm font-black text-emerald-400">$19.99 USD</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Row 1: Your Name & Partner Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1 flex items-center gap-1">
                <User size={13} className="text-[#ff3b68]" />
                <span>Your Name (Sender) *</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Michael"
                value={formData.yourName}
                onChange={(e) => setFormData({ ...formData, yourName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#070913] border border-white/15 text-white text-xs focus:outline-none focus:border-[#ff3b68]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1 flex items-center gap-1">
                <Heart size={13} className="text-[#ff3b68]" />
                <span>Partner's Name *</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sarah"
                value={formData.partnerName}
                onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#070913] border border-white/15 text-white text-xs focus:outline-none focus:border-[#ff3b68]"
              />
            </div>
          </div>

          {/* Row 2: Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1 flex items-center gap-1">
                <Mail size={13} className="text-[#ff3b68]" />
                <span>Email Address (For Delivery) *</span>
              </label>
              <input
                type="email"
                required
                placeholder="youremail@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#070913] border border-white/15 text-white text-xs focus:outline-none focus:border-[#ff3b68]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1 flex items-center gap-1">
                <Phone size={13} className="text-[#ff3b68]" />
                <span>Phone / WhatsApp (Optional)</span>
              </label>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#070913] border border-white/15 text-white text-xs focus:outline-none focus:border-[#ff3b68]"
              />
            </div>
          </div>

          {/* Row 3: Special Date */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1 flex items-center gap-1">
              <Calendar size={13} className="text-[#ff3b68]" />
              <span>Special Date (Anniversary or Day You Met)</span>
            </label>
            <input
              type="date"
              value={formData.specialDate}
              onChange={(e) => setFormData({ ...formData, specialDate: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#070913] border border-white/15 text-white text-xs focus:outline-none focus:border-[#ff3b68]"
            />
          </div>

          {/* Row 4: Song Name / Romantic Note */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1 flex items-center gap-1">
              <MessageSquare size={13} className="text-[#ff3b68]" />
              <span>Couple Song Name or Romantic Note (Optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Song: 'Perfect by Ed Sheeran' or a personal note to appear on the opening screen..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#070913] border border-white/15 text-white text-xs focus:outline-none focus:border-[#ff3b68] resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#ff3b68]/40 hover:shadow-[#ff3b68]/60 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #ff3b68 0%, #ff527b 100%)',
                border: 'none',
              }}
            >
              <Send size={16} />
              <span>{loading ? 'Submitting Order...' : 'Submit Order & Build Website ($19.99) 🚀'}</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-center text-[11px] text-slate-400 pt-1">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Encrypted & Confidential • 100% Love-It Guarantee</span>
          </div>
        </form>
      </div>
    </div>
  )
}
