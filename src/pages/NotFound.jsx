const BrokenHeartSvg = ({ className = "w-7 h-7" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    <path d="M12 5.5L10 9.5L13.5 12.5L11 16L12 18.5" />
  </svg>
)

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#070308] text-white flex flex-col items-center justify-center p-4 font-sans select-none" dir="rtl">
      {/* Background Subtle Radial Glow */}
      <div className="absolute inset-0 bg-radial-gradient from-rose-950/20 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-lg mx-auto text-center space-y-4 px-4">
        {/* Broken Heart Icon Container */}
        <div className="w-16 h-16 rounded-full border border-[#4d1425] bg-[#230913] text-[#e62e5c] flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(230,46,92,0.2)]">
          <BrokenHeartSvg className="w-7 h-7 text-[#e62e5c]" />
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-wide pt-1">
          الصفحة غير موجودة
        </h1>

        {/* Muted Subtitle */}
        <p className="text-xs sm:text-sm text-[#a87f8d] max-w-md mx-auto leading-relaxed font-normal">
          عذراً، هذا الرابط غير صحيح أو قد تم إزالته. يُرجى التأكد من كتابة الرابط الخاص بك بشكل صحيح.
        </p>

        {/* Red Underline Accent */}
        <div className="pt-2">
          <div className="w-10 h-0.5 bg-[#e62e5c] mx-auto rounded-full" />
        </div>
      </div>
    </div>
  )
}
