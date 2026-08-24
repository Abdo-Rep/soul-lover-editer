import HeartBackground from './HeartBackground'
import TouchHeartEffect from './TouchHeartEffect'

/** خلفية موحّدة: التدرّج + القلوب المتحركة — تبقى ثابتة طوال الجلسة */
export default function RomanticBackdrop({ children }) {
  return (
    <div className="relative min-h-dvh overflow-x-hidden font-sans">
      <div
        className="romantic-bg pointer-events-none fixed inset-0 z-0"
        aria-hidden="true"
      />
      <HeartBackground className="z-1" />
      <TouchHeartEffect />
      <div className="relative z-10 min-h-dvh">{children}</div>
    </div>
  )
}
