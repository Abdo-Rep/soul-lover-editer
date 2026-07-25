import { formatDateLong } from '../utils/formatDate'
import { RevealItem } from './Reveal'

function CardConnector() {
  return (
    <div className="flex justify-center py-1" aria-hidden="true">
      <div className="flex flex-col items-center gap-1">
        <span className="timeline-connector-dot h-1.5 w-1.5 rounded-full" />
        <span className="timeline-connector-line h-5 w-px" />
      </div>
    </div>
  )
}

function DateBadge({ date, highlight = false, className = '' }) {
  if (!date) return null

  const formatted = formatDateLong(date)
  if (!formatted) return null

  return (
    <div className={`flex justify-center ${className}`}>
      <span
        className={`rounded-full px-4 py-1.5 text-xs font-medium inline-block ${
          highlight
            ? 'theme-shadow-badge bg-gradient-to-r from-rose-400 to-pink-400 text-white'
            : 'bg-rose-50 text-rose-500 ring-1 ring-rose-100'
        }`}
      >
        {formatted}
      </span>
    </div>
  )
}

export function TimelineMilestone({
  label,
  date,
  children,
  showConnector = true,
}) {
  return (
    <>
      <RevealItem as="div" role="listitem" className="mx-auto w-full">
        <article className="content-card">
          <DateBadge date={date} className="mb-4" />
          <p className="text-sm font-medium text-rose-400">{label}</p>
          <div className="mt-4 text-sm leading-relaxed text-rose-600">{children}</div>
        </article>
      </RevealItem>
      {showConnector ? <CardConnector /> : null}
    </>
  )
}

export function TimelineLoveConfession({
  label,
  date,
  message,
  showConnector = true,
}) {
  return (
    <>
      <RevealItem as="div" role="listitem" className="mx-auto w-full">
        <article className="content-card">
          <div className="theme-shadow-card-sm mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white">
            <span className="text-xl text-rose-500">♥</span>
          </div>

          <DateBadge date={date} highlight className="mb-4" />
          <p className="text-sm font-medium text-rose-400">{label}</p>
          <p className="mt-4 text-sm leading-relaxed text-rose-600">{message}</p>
        </article>
      </RevealItem>
      {showConnector ? <CardConnector /> : null}
    </>
  )
}

function hasMemoryContent(memory) {
  return Boolean(
    memory.image?.trim() || memory.date || memory.text?.trim(),
  )
}

export function isVisibleMemory(memory) {
  return hasMemoryContent(memory)
}

export function TimelineMemoryCard({ memory, showConnector = true }) {
  const hasImage = Boolean(memory.image?.trim())
  const hasDate = Boolean(memory.date)
  const hasText = Boolean(memory.text?.trim())

  if (!hasImage && !hasDate && !hasText) return null

  const caption = hasDate || hasText

  return (
    <>
      <RevealItem as="div" role="listitem" className="mx-auto w-full">
        {hasImage ? (
          <article className="theme-shadow-card w-full overflow-hidden rounded-2xl border border-rose-200/60 bg-white text-center">
            <img
              src={memory.image}
              alt={hasText ? memory.text : 'ذكرى'}
              className="block w-full h-auto"
              loading="lazy"
              decoding="async"
            />
            {caption ? (
              <div className="px-4 py-3">
                <DateBadge date={hasDate ? memory.date : null} className="mb-1.5" />
                {hasText ? (
                  <p className="text-sm leading-relaxed text-rose-700">{memory.text}</p>
                ) : null}
              </div>
            ) : null}
          </article>
        ) : (
          <article className="content-card">
            <DateBadge date={hasDate ? memory.date : null} className="mb-3" />
            {hasText ? (
              <p className="text-sm leading-relaxed text-rose-700">{memory.text}</p>
            ) : null}
          </article>
        )}
      </RevealItem>
      {showConnector ? <CardConnector /> : null}
    </>
  )
}

export default function StoryTimeline({ children }) {
  return (
    <div
      role="list"
      className="mx-auto flex w-full flex-col items-center gap-2"
    >
      {children}
    </div>
  )
}
