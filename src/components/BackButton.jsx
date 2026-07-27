import { ChevronRight } from 'lucide-react'

export default function BackButton({ onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="رجوع للصفحة السابقة"
      className={`glass-card inline-flex h-9 w-9 items-center justify-center rounded-full text-rose-500 shadow-md transition hover:scale-105 active:scale-95 ${className}`.trim()}
    >
      <ChevronRight size={18} strokeWidth={2.5} />
    </button>
  )
}
