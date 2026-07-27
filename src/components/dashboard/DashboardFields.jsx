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
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={inputClass}
      {...props}
    />
  )
}

export function TextArea({ value, onChange, rows = 3, ...props }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className={`${inputClass} resize-y`}
      {...props}
    />
  )
}

export function DateInput({ value, onChange, ...props }) {
  return (
    <input
      type="date"
      value={value?.slice(0, 10) || ''}
      onChange={(e) => onChange(e.target.value)}
      className={inputClass}
      {...props}
    />
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
