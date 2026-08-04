import { ArrowLeft } from 'lucide-react'

export default function NextButton({
  onClick,
  children,
  defaultText = 'التالي ✨',
  className = '',
}) {
  const rawText = typeof children === 'string' ? children.trim() : (children || '')
  const textContent = rawText && String(rawText).trim().length > 0 ? rawText : defaultText

  return (
    <div className={`flex w-full justify-center ${className}`}>
      <button
        type="button"
        onClick={onClick}
        className="group relative inline-flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 px-8 py-3.5 text-sm sm:text-base font-extrabold text-white shadow-lg shadow-rose-500/25 ring-2 ring-white/80 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-rose-500/40 active:scale-95 cursor-pointer"
      >
        <span className="font-display tracking-wide">{textContent}</span>
        <ArrowLeft size={18} className="transition-transform duration-300 group-hover:-translate-x-1" />
      </button>
    </div>
  )
}