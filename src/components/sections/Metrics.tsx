import { useEffect, useRef, useState } from 'react'
import type { ClinicMetric } from '../../config/schema'

const countFormat = new Intl.NumberFormat('pt-BR')
const duration = 1150

export function Metrics({ items, animate }: { items: ClinicMetric[]; animate: boolean }) {
  const section = useRef<HTMLElement>(null)
  const [progress, setProgress] = useState(1)

  useEffect(() => {
    const element = section.current
    if (!element || !animate || !('IntersectionObserver' in window)) return

    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (preference.matches) return

    let frame = 0
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()

      const start = performance.now()
      setProgress(0)
      function tick(now: number) {
        const elapsed = Math.max(0, Math.min((now - start) / duration, 1))
        setProgress(1 - (1 - elapsed) ** 3)
        if (elapsed < 1) frame = requestAnimationFrame(tick)
      }

      frame = requestAnimationFrame(tick)
    }, { threshold: 0.05 })

    function stopForReducedMotion() {
      if (!preference.matches) return
      observer.disconnect()
      cancelAnimationFrame(frame)
      setProgress(1)
    }

    observer.observe(element)
    preference.addEventListener('change', stopForReducedMotion)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
      preference.removeEventListener('change', stopForReducedMotion)
    }
  }, [animate, items])

  return <section className="clinic-metrics" aria-labelledby="metricas" ref={section}>
    <div className="wrap metrics-inner">
      <h2 id="metricas">O cuidado em números.</h2>
      <dl className="metrics-list">
        {items.map(({ label, value, note }, index) => {
          if (value === null) return null

          const fullValue = countFormat.format(value)
          const displayedValue = countFormat.format(Math.floor(value * (animate ? progress : 1)))
          return <div className="metric" key={index}>
            <dt>{label}</dt>
            <dd className="metric-number">
              <span aria-hidden="true">{displayedValue}</span>
              <span className="sr-only">{fullValue}</span>
            </dd>
            {note && <dd className="metric-note">{note}</dd>}
          </div>
        })}
      </dl>
    </div>
  </section>
}
