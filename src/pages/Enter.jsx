import { useState } from 'react'
import { KeyRound, Eye, EyeOff } from 'lucide-react'
import ContentLoadingHearts from '../components/ContentLoadingHearts'
import FlowPage from '../components/FlowPage'
import { RevealGroup, RevealItem } from '../components/Reveal'
import { useContent } from '../context/ContentContext'

export default function Enter({ onLogin }) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { content, isLoading, isSupabaseConfigured, verifyPassword } = useContent()

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (isLoading || submitting) return

    if (!isSupabaseConfigured) {
      setError('تعذّر الاتصال بالخادم — تحقق من إعدادات Supabase')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const isValid = password === content.password
      if (!isValid) {
        setError(content.login.error)
        setShake(true)
        window.setTimeout(() => setShake(false), 450)
        return
      }

      onLogin(password)
    } catch {
      setError('تعذّر التحقق من كلمة المرور — حاول مرة أخرى')
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return <ContentLoadingHearts />
  }

  return (
    <FlowPage variant="center">
      <RevealGroup className="w-full">
        <RevealItem>
          <div className="enter-card theme-shadow-enter rounded-4xl">
            <div className="enter-card__header px-8 py-8 text-center">
              <p className="text-sm font-medium tracking-wide text-rose-400">
                {content.login.eyebrow}
              </p>
              <h1 className="font-display mt-3 text-3xl font-semibold text-rose-800 sm:text-4xl">
                {content.login.title}
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-rose-500 sm:text-base">
                {content.login.subtitle}
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className={`enter-card__form space-y-5 px-8 py-8 ${shake ? 'enter-shake' : ''}`}
            >
              <label className="block text-center">
                <span className="mb-2 flex items-center justify-center gap-2 text-sm font-medium text-rose-600">
                  <KeyRound size={16} className="text-rose-400" />
                  {content.login.passwordLabel}
                </span>
                <div className="relative w-full">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value)
                      setError('')
                    }}
                    placeholder={content.login.placeholder}
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
                className="flex w-full items-center justify-center rounded-t-xl border-b-2 border-rose-400 border-t-0 border-l-0 border-r-0 bg-transparent px-4 pt-3.5 pb-1 text-sm font-semibold text-rose-600 transition hover:bg-rose-50/50 hover:border-rose-500 active:scale-[0.98] disabled:opacity-70"
              >
                {submitting ? 'جاري التحقق...' : content.login.button}
              </button>
            </form>
          </div>
        </RevealItem>

        <RevealItem className="mt-6 w-full">
          <p className="text-center text-xs text-rose-300">{content.login.footer}</p>
        </RevealItem>
      </RevealGroup>
    </FlowPage>
  )
}
