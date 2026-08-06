import { useState, useRef } from 'react'
import { KeyRound, Eye, EyeOff } from 'lucide-react'
import FlowPage from '../components/FlowPage'
import { RevealGroup, RevealItem } from '../components/Reveal'
import { useContent } from '../context/ContentContext'
import { useMusic } from '../context/MusicContext'

export default function Enter({ onLogin }) {
  const passwordRef = useRef('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { content, verifyPassword } = useContent()
  const { primeAudio, pauseMusic } = useMusic()

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (submitting) return

    setSubmitting(true)
    setError('')

    try {
      const currentPass = passwordRef.current
      const isValid = await verifyPassword(currentPass)
      if (!isValid) {
        setError(content.login?.error || 'كلمة المرور غير صحيحة')
        setShake(true)
        window.setTimeout(() => setShake(false), 450)
        return
      }

      // Prime/start music ONLY on successful validation
      primeAudio()
      onLogin(currentPass)
    } catch {
      setError('تعذّر التحقق من كلمة المرور — حاول مرة أخرى')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <FlowPage variant="center">
      <RevealGroup className="w-full">
        <RevealItem>
          <div className="enter-card theme-shadow-enter rounded-4xl">
            <div className="enter-card__header px-8 py-8 text-center">
              <p className="text-sm font-medium tracking-wide text-rose-400">
                {content.login?.eyebrow}
              </p>
              <h1 className="font-display mt-3 text-3xl font-semibold text-rose-800 sm:text-4xl">
                {content.login?.title}
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-rose-500 sm:text-base">
                {content.login?.subtitle}
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className={`enter-card__form space-y-5 px-8 py-8 ${shake ? 'enter-shake' : ''}`}
            >
              <label className="block text-center">
                <span className="mb-2 flex items-center justify-center gap-2 text-sm font-medium text-rose-600">
                  <KeyRound size={16} className="text-rose-400" />
                  {content.login?.passwordLabel}
                </span>
                <div className="relative w-full">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    defaultValue=""
                    onChange={(event) => {
                      passwordRef.current = event.target.value
                      if (error) setError('')
                    }}
                    placeholder={content.login?.placeholder}
                    className="w-full rounded-2xl border border-rose-100 bg-white px-4 py-3.5 pl-10 text-center text-rose-800 shadow-inner outline-none transition placeholder:text-rose-300 focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                    autoComplete="current-password"
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-400 hover:text-rose-600 transition p-1"
                    title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>

              {error ? (
                <p
                  className="rounded-2xl border border-rose-100 bg-rose-50/90 px-4 py-3 text-center text-sm leading-relaxed text-rose-500"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="group relative inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 px-8 py-3.5 text-sm sm:text-base font-extrabold text-white shadow-lg shadow-rose-500/25 ring-2 ring-white/80 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-rose-500/40 active:scale-95 disabled:opacity-70 cursor-pointer"
              >
                <span className="font-display tracking-wide">{submitting ? 'جاري التحقق...' : (content.login?.button || 'ادخل 💖')}</span>
              </button>
            </form>
          </div>
        </RevealItem>

        <RevealItem className="mt-6 w-full">
          <p className="text-center text-xs text-rose-300">{content.login?.footer}</p>
        </RevealItem>
      </RevealGroup>
    </FlowPage>
  )
}
