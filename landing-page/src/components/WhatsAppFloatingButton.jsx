import React from 'react'
import { MessageCircle } from 'lucide-react'

export default function WhatsAppFloatingButton({ onOpenOrder }) {
  return (
    <button
      type="button"
      onClick={onOpenOrder}
      className="fixed bottom-6 left-6 z-40 flex items-center gap-2.5 px-4 py-3 sm:px-5 sm:py-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs sm:text-sm shadow-2xl shadow-emerald-500/40 border border-white/20 transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
      aria-label="تواصل عبر الواتساب"
    >
      <MessageCircle size={20} className="fill-white" />
      <span className="font-extrabold hidden sm:inline">اطلب عبر الواتساب 💬</span>
    </button>
  )
}
