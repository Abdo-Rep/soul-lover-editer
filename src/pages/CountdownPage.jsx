import { useState, useEffect, useRef } from 'react'
import { Clock, Heart, Sparkles } from 'lucide-react'
import FlowPage from '../components/FlowPage'
import NextButton from '../components/NextButton'
import { RevealGroup, RevealItem } from '../components/Reveal'
import { useContent } from '../context/ContentContext'

function calculateTimeLeft(targetDate, targetTime = '00:00') {
  if (!targetDate) return null
  const targetStr = `${targetDate}T${targetTime}:00`
  let target = new Date(targetStr)
  if (isNaN(target.getTime())) return null

  const now = new Date()
  let diff = target.getTime() - now.getTime()

  // If the date is in the past
  if (diff <= 0) {
    // If the event occurred less than 24 hours ago, keep it in the celebrated/finished state
    const oneDayMs = 24 * 60 * 60 * 1000
    if (Math.abs(diff) < oneDayMs) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isFinished: true }
    }

    // Otherwise, automatically roll it over to the next upcoming annual occurrence
    const targetMonth = target.getMonth()
    const targetDay = target.getDate()
    const targetHours = target.getHours()
    const targetMinutes = target.getMinutes()

    const currentYear = now.getFullYear()
    let rolledTarget = new Date(currentYear, targetMonth, targetDay, targetHours, targetMinutes)

    // If that date in the current year has also passed by more than 24 hours, target next year
    if (rolledTarget.getTime() - now.getTime() <= -oneDayMs) {
      rolledTarget = new Date(currentYear + 1, targetMonth, targetDay, targetHours, targetMinutes)
    }

    target = rolledTarget
    diff = target.getTime() - now.getTime()
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  return { days, hours, minutes, seconds, isFinished: false }
}

// ─── Single shared ticker for ALL countdown cards ───────────────────────────
function useTick() {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [])
  return tick
}

function LiveCountdownCard({ timer, tick }) {
  const { content } = useContent()
  const isEn = content.language === 'en' || content.language === 'en-GB'
  const isEs = content.language === 'es'
  const timeLeft = calculateTimeLeft(timer.date, timer.time)
  const [celebrated, setCelebrated] = useState(false)

  // Trigger celebration once when countdown finishes
  useEffect(() => {
    if (timeLeft?.isFinished && !celebrated) {
      setCelebrated(true)
    }
  }, [timeLeft?.isFinished, celebrated])

  // Re-read on every tick (tick prop drives re-render)
  // eslint-disable-next-line no-unused-vars
  const _ = tick

  if (!timeLeft) return null

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-rose-200/80 bg-white/90 p-6 shadow-xl shadow-rose-900/10 backdrop-blur-md transition-all duration-300 hover:shadow-2xl hover:shadow-rose-300/30 text-center">
      {/* Background Ambient Glow */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gradient-to-br from-rose-300/30 to-pink-200/20 blur-2xl transition-all duration-500 group-hover:scale-150" />

      {/* Timer Header */}
      <div className="mb-4 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 px-4 py-1.5 text-sm font-bold text-white shadow-md shadow-rose-200">
        <Clock size={15} className="text-white" />
        <span className="font-display">{timer.title || (isEs ? 'Evento próximo' : isEn ? 'Upcoming Event' : 'مناسبة قادمة')}</span>
        <Heart size={13} className="fill-white text-white" />
      </div>

      {timer.description && (
        <p className="mb-5 text-xs sm:text-sm font-semibold text-rose-800/90 leading-relaxed max-w-sm mx-auto">
          {timer.description}
        </p>
      )}

      {/* Live Digit Cards Grid */}
      {timeLeft.isFinished ? (
        <div className={`my-2 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-center transition-all duration-700 ${celebrated ? 'scale-105' : ''}`}>
          <span className="text-2xl font-bold text-rose-600 block mb-1">
            {isEs ? '🎉 ¡Llegó el gran momento! 🎉' : isEn ? '🎉 The happy moment is here! 🎉' : '🎉 حان الموعد السعيد! 🎉'}
          </span>
          <span className="text-xs text-rose-500 font-semibold">
            {isEs ? 'El evento ha comenzado con los mejores deseos 💖' : isEn ? 'The event has started with our best wishes 💖' : 'المناسبة بدأت الآن مع أجمل الأماني 💖'}
          </span>
          {/* Mini heart burst on finish */}
          {celebrated && (
            <div className="flex justify-center gap-2 mt-3 text-lg animate-bounce">
              <span>💖</span><span>✨</span><span>💖</span>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 sm:gap-3 my-2">
          {/* Days */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-100 bg-gradient-to-b from-rose-50/90 to-pink-50/50 p-2.5 shadow-sm">
            <span className="font-display text-xl sm:text-2xl font-black text-rose-900 leading-none tabular-nums">
              {String(timeLeft.days).padStart(2, '0')}
            </span>
            <span className="text-[10px] font-bold text-rose-400 mt-1">
              {isEs ? 'Días' : isEn ? 'Days' : 'أيام'}
            </span>
          </div>

          {/* Hours */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-100 bg-gradient-to-b from-rose-50/90 to-pink-50/50 p-2.5 shadow-sm">
            <span className="font-display text-xl sm:text-2xl font-black text-rose-900 leading-none tabular-nums">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span className="text-[10px] font-bold text-rose-400 mt-1">
              {isEs ? 'Horas' : isEn ? 'Hours' : 'ساعات'}
            </span>
          </div>

          {/* Minutes */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-100 bg-gradient-to-b from-rose-50/90 to-pink-50/50 p-2.5 shadow-sm">
            <span className="font-display text-xl sm:text-2xl font-black text-rose-900 leading-none tabular-nums">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span className="text-[10px] font-bold text-rose-400 mt-1">
              {isEs ? 'Minutos' : isEn ? 'Mins' : 'دقائق'}
            </span>
          </div>

          {/* Seconds */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-200/90 bg-gradient-to-b from-rose-500 to-pink-500 p-2.5 shadow-md shadow-rose-200 text-white">
            <span className="font-display text-xl sm:text-2xl font-black leading-none tabular-nums">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
            <span className="text-[10px] font-bold text-rose-100 mt-1">
              {isEs ? 'Segundos' : isEn ? 'Secs' : 'ثواني'}
            </span>
          </div>
        </div>
      )}
    </article>
  )
}

export default function CountdownPage({ onNext }) {
  const { content, t } = useContent()
  const tick = useTick()

  const isEn = content.language === 'en' || content.language === 'en-GB'
  const isEs = content.language === 'es'

  // Use DB countdowns only — no hardcoded Christmas fallback
  const countdowns = content?.countdowns ?? []
  const hasCountdowns = countdowns.length > 0

  return (
    <FlowPage variant="flow" className="pb-8">
      <RevealGroup className="flex w-full flex-col items-center">
        <RevealItem as="header" className="mb-6 w-full text-center">
          <p className="text-sm font-medium tracking-wide text-rose-400 flex items-center justify-center gap-1.5">
            <Sparkles size={14} className="text-rose-400" />
            <span>
              {isEs ? 'Hacia los mejores momentos' : isEn ? 'Towards the best times' : 'نحو أجمل المواعيد'}
            </span>
          </p>
          <h1 className="font-display mt-2 text-3xl font-bold text-rose-900">
            {t.countdownTab || 'العدادات التنازلية ⏳'}
          </h1>
          <p className="mt-1.5 text-xs text-rose-500 font-medium">
            {isEs 
              ? 'Cada segundo que pasa nos acerca más a los momentos hermosos que esperamos juntos' 
              : isEn 
                ? 'Every second that passes brings us closer to the beautiful moments we wait for together' 
                : 'كل ثانية بتمر بتقربنا أكتر للمواسم واللحظات الحلوة اللي بنستناها سوا'}
          </p>
        </RevealItem>

        <div className="w-full max-w-lg space-y-5">
          {hasCountdowns ? (
            countdowns.map((timer, idx) => (
              <RevealItem key={timer.id || idx} className="w-full">
                <LiveCountdownCard timer={timer} tick={tick} />
              </RevealItem>
            ))
          ) : (
            <RevealItem className="w-full">
              <div className="rounded-3xl border border-rose-100 bg-white/80 p-8 text-center shadow-lg backdrop-blur-md">
                <p className="text-4xl mb-3">⏳</p>
                <p className="text-sm font-semibold text-rose-400">
                  {isEs ? 'No hay cuentas regresivas todavía' : isEn ? 'No countdowns yet' : 'لا توجد عدادات تنازلية حتى الآن'}
                </p>
                <p className="text-xs text-rose-300 mt-1">
                  {isEs ? 'Puedes agregarlas desde el panel' : isEn ? 'You can add them from the dashboard' : 'يمكن إضافتها من لوحة التحكم'}
                </p>
              </div>
            </RevealItem>
          )}
        </div>

        <RevealItem className="mt-8 w-full max-w-lg">
          <NextButton onClick={onNext} defaultText={t.wishlistTab || 'قائمة أمنياتنا 💖'} />
        </RevealItem>
      </RevealGroup>
    </FlowPage>
  )
}
