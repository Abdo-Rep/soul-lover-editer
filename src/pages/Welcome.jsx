import FlowPage from '../components/FlowPage'
import NextButton from '../components/NextButton'
import { useContent } from '../context/ContentContext'

export default function Welcome({ onNext }) {
  const { content } = useContent()
  const { welcome } = content

  return (
    <FlowPage variant="center">
      <div className="flex w-full flex-col items-center">
        <p className="text-sm font-medium tracking-wide text-rose-400">{welcome.eyebrow}</p>

        <h1 className="font-display mt-3 text-2xl font-bold text-rose-900">
          {welcome.title}
        </h1>

        <div className="content-card content-card-lg mt-8 w-full">
          <p className="text-base leading-loose text-rose-700 sm:text-lg">
            {welcome.subtitle}
          </p>
        </div>

        <div className="mt-10 w-full">
          <NextButton onClick={onNext} defaultText="قصتنا 💖" />
        </div>
      </div>
    </FlowPage>
  )
}
