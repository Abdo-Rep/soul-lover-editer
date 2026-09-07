import { useState } from 'react'
import { Eye, EyeOff, Copy, Check } from 'lucide-react'
import ModernDatePicker from './ModernDatePicker'

export function Field({ label, hint, children }) {
  return (
    <div className="block">
      <span className="mb-1.5 block text-sm font-medium text-rose-700">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-rose-400">{hint}</span> : null}
    </div>
  )
}

const inputClass =
  'w-full rounded-xl border border-rose-100 bg-white px-3 py-2.5 text-sm text-rose-800 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100'

export function TextInput({ value, onChange, ...props }) {
  return (
    <input
      type="text"
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value)}
      className={inputClass}
      {...props}
    />
  )
}

export function PasswordInput({ value, onChange, placeholder, showCopy = false, ...props }) {
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div className="relative w-full">
      <input
        type={showPassword ? 'text' : 'password'}
        value={value ?? ''}
        onChange={(e) => {
          const sanitized = e.target.value.replace(/[\u0600-\u06FF\s]/g, '')
          onChange?.(sanitized)
        }}
        placeholder={placeholder}
        className={`${inputClass} ${showCopy ? 'pl-20' : 'pl-10'}`}
        {...props}
      />
      <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {showCopy && value ? (
          <button
            type="button"
            onClick={handleCopy}
            className="text-rose-400 hover:text-rose-600 transition p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-slate-800"
            title={copied ? 'تم النسخ!' : 'نسخ كلمة المرور'}
          >
            {copied ? <Check size={17} className="text-emerald-500" /> : <Copy size={17} />}
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="text-rose-400 hover:text-rose-600 transition p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-slate-800"
          title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  )
}

export function TextArea({ value, onChange, rows = 3, ...props }) {
  return (
    <textarea
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value)}
      rows={rows}
      className={`${inputClass} resize-y`}
      {...props}
    />
  )
}

export function DateInput({ value, onChange, placeholder = 'اختر التاريخ' }) {
  return (
    <ModernDatePicker
      value={value?.slice(0, 10) || ''}
      onChange={onChange}
      placeholder={placeholder}
    />
  )
}

export function TimeInput({ value, onChange }) {
  const timeVal = value || '00:00'

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-[130px]">
        <input
          type="time"
          value={timeVal}
          onChange={(e) => onChange?.(e.target.value || '00:00')}
          className={`${inputClass} cursor-pointer font-medium tracking-wide`}
        />
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {[
          { label: '12:00 ص', val: '00:00' },
          { label: '12:00 م', val: '12:00' },
          { label: '08:00 م', val: '20:00' },
        ].map((preset) => (
          <button
            key={preset.val}
            type="button"
            onClick={() => onChange?.(preset.val)}
            className={`px-2.5 py-2 text-[11px] font-bold rounded-xl border transition active:scale-95 ${
              timeVal === preset.val
                ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                : 'bg-white text-rose-600 border-rose-200 hover:bg-rose-50'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function Section({ title, description, children }) {
  return (
    <section className="rounded-2xl border border-rose-100 bg-white/80 p-5 shadow-sm">
      <div className="mb-5 border-b border-rose-50 pb-4">
        <h2 className="text-lg font-semibold text-rose-900">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-rose-500">{description}</p>
        ) : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}
