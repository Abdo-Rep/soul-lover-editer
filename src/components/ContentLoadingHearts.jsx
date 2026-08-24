const LOADING_HEARTS = [0, 1, 2, 3, 4]

export default function ContentLoadingHearts() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-[var(--theme-50)] via-[var(--theme-100)] to-[var(--theme-50)] px-4 text-rose-500 dir-rtl">
      {/* Glassmorphic Skeleton Card Preview */}
      <div className="w-full max-w-sm rounded-3xl border border-white/60 dark:border-rose-900/30 bg-white/40 dark:bg-rose-950/20 p-6 shadow-2xl backdrop-blur-xl flex flex-col items-center gap-4 animate-pulse">
        {/* Circle Avatar Skeleton */}
        <div className="h-20 w-20 rounded-full bg-rose-200/60 dark:bg-rose-900/40 flex items-center justify-center shadow-inner">
          <div className="content-loading-hearts">
            {LOADING_HEARTS.map((index) => (
              <span
                key={index}
                className="content-loading-hearts__item text-rose-500 dark:text-rose-400 text-lg"
                style={{ '--loading-heart-delay': `${index * 0.18}s` }}
              >
                ♥
              </span>
            ))}
          </div>
        </div>

        {/* Shimmer Bar Lines */}
        <div className="h-4 w-3/4 rounded-full bg-rose-200/50 dark:bg-rose-900/30" />
        <div className="h-3 w-1/2 rounded-full bg-rose-200/30 dark:bg-rose-900/20" />
        <div className="mt-2 h-10 w-full rounded-2xl bg-rose-200/40 dark:bg-rose-900/30" />
      </div>

      <span className="mt-6 text-xs font-bold tracking-widest text-rose-400/90 dark:text-rose-300/80 animate-pulse">
        soulove • جاري تحضير ذكرياتنا...
      </span>
    </div>
  )
}
