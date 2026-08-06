import { useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import FlowPage from '../components/FlowPage'
import GalleryLightbox from '../components/GalleryLightbox'
import NextButton from '../components/NextButton'
import { RevealGroup, RevealItem } from '../components/Reveal'
import StoryTimeline, {
  TimelineLoveConfession,
  TimelineMemoryCard,
  TimelineMilestone,
  isVisibleMemory,
} from '../components/StoryTimeline'
import { useContent } from '../context/ContentContext'

export default function Story({ onNext }) {
  const { content } = useContent()
  const { story, memories, dates } = content
  const visibleMemories = useMemo(() => memories.filter(isVisibleMemory), [memories])
  const [lightboxIndex, setLightboxIndex] = useState(null)

  return (
    <FlowPage variant="flow" className="pb-8">
      <RevealGroup className="flex w-full flex-col items-center">
        <RevealItem as="header" className="mb-8 w-full">
          <p className="text-sm font-medium tracking-wide text-rose-400">
            {story.eyebrow}
          </p>
          <h1 className="font-display mt-2 text-3xl font-bold text-rose-900">
            {story.title}
          </h1>
        </RevealItem>

        <StoryTimeline>
          <TimelineMilestone
            label={story.firstMeeting.label}
            date={dates.firstMeeting}
          >
            {story.firstMeeting.description}
          </TimelineMilestone>

          <TimelineLoveConfession
            label={story.loveConfession.label}
            date={dates.loveConfession}
            message={story.loveConfession.message}
          />

          {visibleMemories.map((memory, index) => (
            <TimelineMemoryCard
              key={memory.id}
              memory={memory}
              showConnector={index < visibleMemories.length - 1}
              onOpen={() => setLightboxIndex(index)}
            />
          ))}

          {visibleMemories.length === 0 && (
            <RevealItem className="w-full max-w-lg mx-auto">
              <div className="rounded-3xl border border-rose-100 bg-white/70 p-6 text-center backdrop-blur-sm shadow">
                <p className="text-2xl mb-2">📷</p>
                <p className="text-sm text-rose-400 font-medium">لا توجد ذكريات بعد</p>
                <p className="text-xs text-rose-300 mt-1">يمكن إضافتها من لوحة التحكم</p>
              </div>
            </RevealItem>
          )}
        </StoryTimeline>

        <RevealItem className="mt-6 w-full">
          <NextButton onClick={onNext} defaultText="كملي لمعرض صورنا 📷" />
        </RevealItem>
      </RevealGroup>

      <AnimatePresence>
        {lightboxIndex !== null && visibleMemories[lightboxIndex] ? (
          <GalleryLightbox
            items={visibleMemories}
            activeIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onIndexChange={setLightboxIndex}
          />
        ) : null}
      </AnimatePresence>
    </FlowPage>
  )
}

