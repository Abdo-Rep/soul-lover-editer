import { useEffect, useRef } from 'react'

const FloatingHeart = ({ style }) => (
  <div
    className="absolute pointer-events-none select-none text-rose-400/20 animate-pulse"
    style={style}
  >
    ♥
  </div>
)

export default function RootLanding() {
  const canvasRef = useRef(null)

  // Floating hearts decoration
  const hearts = [
    { top: '10%', left: '8%', fontSize: '2.5rem', animationDelay: '0s', animationDuration: '4s' },
    { top: '20%', right: '12%', fontSize: '1.5rem', animationDelay: '1s', animationDuration: '5s' },
    { bottom: '25%', left: '5%', fontSize: '3rem', animationDelay: '0.5s', animationDuration: '6s' },
    { bottom: '15%', right: '8%', fontSize: '2rem', animationDelay: '1.5s', animationDuration: '4.5s' },
    { top: '50%', left: '3%', fontSize: '1.2rem', animationDelay: '2s', animationDuration: '3.5s' },
    { top: '60%', right: '5%', fontSize: '1.8rem', animationDelay: '0.8s', animationDuration: '5.5s' },
  ]

  return (
    <div
      className="min-h-screen bg-[#070308] flex flex-col items-center justify-center p-4 relative overflow-hidden"
      dir="rtl"
      style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif" }}
    >
      {/* Background gradient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(230,46,92,0.06) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Floating hearts */}
      {hearts.map((style, i) => (
        <FloatingHeart key={i} style={style} />
      ))}

      {/* Main card */}
      <div className="relative z-10 max-w-md w-full mx-auto text-center">
        {/* Lock icon circle */}
        <div className="mx-auto mb-6 w-20 h-20 rounded-full border border-[#4d1425] bg-[#1a080e] flex items-center justify-center shadow-[0_0_40px_rgba(230,46,92,0.15)]">
          <svg
            className="w-9 h-9 text-[#e62e5c]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase text-[#e62e5c] border border-[#4d1425] bg-[#1a080e] mb-4">
          <span>🔒</span>
          <span>رابط خاص مطلوب</span>
        </div>

        {/* Headline */}
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3 leading-snug">
          هذا الرابط غير متاح للعموم
        </h1>

        {/* Description */}
        <p className="text-sm sm:text-base text-[#a87f8d] leading-relaxed mb-6 max-w-sm mx-auto">
          منصة Soulove مخصصة فقط للمواقع الشخصية الخاصة.
          <br />
          كل موقع له رابط خاص من النوع:
        </p>

        {/* URL example block */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#4d1425] bg-[#120508] mb-6"
          dir="ltr"
        >
          <span className="text-[#a87f8d] text-sm font-mono">soul-lover-tau.vercel.app/</span>
          <span className="text-[#e62e5c] text-sm font-bold font-mono">اسمك</span>
        </div>

        {/* Hint */}
        <p className="text-xs text-[#6b3d4f] leading-relaxed">
          إذا حصلت على رابط خاص من شخص ما — استخدم ذلك الرابط مباشرةً.
          <br />
          هذه الصفحة الرئيسية لا تحتوي على أي محتوى.
        </p>

        {/* Bottom divider */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <div className="h-px w-12 bg-[#4d1425]" />
          <span className="text-[#4d1425] text-base">♥</span>
          <div className="h-px w-12 bg-[#4d1425]" />
        </div>

        <p className="mt-3 text-[10px] text-[#3d1520] tracking-wider uppercase">
          Soulove — Private Love Experiences
        </p>
      </div>
    </div>
  )
}
