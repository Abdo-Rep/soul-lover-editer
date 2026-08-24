import { useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import FlowPage from '../components/FlowPage'
import GalleryCard from '../components/GalleryCard'
import GalleryLightbox from '../components/GalleryLightbox'
import NextButton from '../components/NextButton'
import { RevealGroup, RevealItem } from '../components/Reveal'
import { useContent } from '../context/ContentContext'

export default function Gallery({ onNext, showNext = true }) {
  const { content, t } = useContent()
  const { gallery, galleryItems = [] } = content
  const [lightboxIndex, setLightboxIndex] = useState(null)

  const isEn = content.language === 'en' || content.language === 'en-GB'
  const isEs = content.language === 'es'

  const items = useMemo(
    () =>
      [...galleryItems].sort((a, b) => {
        if (!a.date && !b.date) return 0
        if (!a.date) return 1
        if (!b.date) return -1
        return new Date(b.date) - new Date(a.date)
      }),
    [galleryItems],
  )

  const hasItems = items.length > 0

  return (
    <FlowPage variant="flow" className="pb-4">
      <RevealItem as="header" className="mb-6 w-full">
        <p className="text-sm font-medium tracking-wide text-rose-400">{gallery.eyebrow}</p>
        <h1 className="font-display mt-2 text-3xl font-bold text-rose-900">
          {gallery.title}
        </h1>
      </RevealItem>

      {hasItems ? (
        <RevealGroup className="grid w-full grid-cols-2 justify-items-center gap-5 sm:gap-6">
          {items.map((item, index) => (
            <RevealItem key={item.id} className="w-full">
              <GalleryCard item={item} index={index} onOpen={setLightboxIndex} />
            </RevealItem>
          ))}
        </RevealGroup>
      ) : (
        <RevealItem className="w-full">
          <div className="glass-card w-full rounded-3xl px-6 py-14 text-center">
            <p className="text-4xl">♥</p>
            <p className="mt-4 text-sm leading-relaxed text-rose-500">
              {isEs ? 'Nuestras fotos hermosas aparecerán aquí pronto ♥' : isEn ? 'Our beautiful photos will appear here soon ♥' : 'صورنا الحلوة هتظهر هنا قريباً ♥'}
            </p>
          </div>
        </RevealItem>
      )}

      {showNext && (
        <RevealItem className="mt-10 w-full">
          <NextButton onClick={onNext} defaultText={t.finalTab || 'الرسالة الأخيرة 💌'} />
        </RevealItem>
      )}

      <AnimatePresence>
        {lightboxIndex !== null && items[lightboxIndex] ? (
          <GalleryLightbox
            items={items}
            activeIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onIndexChange={setLightboxIndex}
          />
        ) : null}
      </AnimatePresence>
    </FlowPage>
  )
}
