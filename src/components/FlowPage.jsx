export default function FlowPage({ variant = 'center', children, className = '' }) {
  const variantClass = variant === 'center' ? 'flow-page--center' : 'flow-page--flow'

  return (
    <section className={`flow-page ${variantClass} ${className}`.trim()}>
      {children}
    </section>
  )
}
