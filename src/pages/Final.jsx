import FlowPage from '../components/FlowPage'
import { RevealGroup, RevealItem } from '../components/Reveal'
import WordByWord from '../components/WordByWord'
import { useContent } from '../context/ContentContext'
import { config } from '../data/config'

export default function Final() {
  const { content } = useContent()
  const { final } = content

  return (
    <FlowPage variant="center">
      <RevealGroup className="flex w-full flex-col items-center">
        <RevealItem>
          <p className="text-sm font-medium tracking-wide text-rose-400">{final.eyebrow}</p>
        </RevealItem>

        <RevealItem>
          <h1 className="font-display mt-3 text-4xl font-bold text-rose-900">
            {final.title}
          </h1>
        </RevealItem>

        <RevealItem className="mt-8 w-full">
          <div className="content-card content-card-lg w-full">
            <WordByWord
              text={final.text}
              wordDelay={config.animations.text.wordDelay}
              className="text-base leading-loose text-rose-700 sm:text-lg"
            />
          </div>
        </RevealItem>

        <RevealItem className="mt-10">
          <p className="heart-pulse text-3xl text-rose-400">♥</p>
        </RevealItem>
      </RevealGroup>
    </FlowPage>
  )
}
