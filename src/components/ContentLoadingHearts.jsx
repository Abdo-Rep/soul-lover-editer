import FlowPage from './FlowPage'

const LOADING_HEARTS = [0, 1, 2, 3, 4]

export default function ContentLoadingHearts() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#fff5f7] dark:bg-[#110a18] text-rose-500">
      <div className="content-loading-hearts" role="status" aria-label="جاري التحميل">
        {LOADING_HEARTS.map((index) => (
          <span
            key={index}
            className="content-loading-hearts__item text-rose-500 dark:text-rose-400"
            style={{ '--loading-heart-delay': `${index * 0.18}s` }}
          >
            ♥
          </span>
        ))}
      </div>
    </div>
  )
}
