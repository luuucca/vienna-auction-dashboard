import React, { useEffect, useRef, useState } from 'react'

/**
 * Number ticker that animates from 0 → target the first time the element
 * enters the viewport. Uses requestAnimationFrame with a sane easing curve.
 *
 * Caller supplies a prefix / suffix so we don't fight with i18n strings
 * (e.g. value=114, suffix="+" → "114+"; value=50, suffix="%" → "50%").
 */
interface Props {
  value: number
  /** Animation duration in ms. */
  duration?: number
  /** Decimals to render. */
  decimals?: number
  /** Locale formatting. Defaults to de-AT for tabular consistency. */
  locale?: string
  prefix?: string
  suffix?: string
  className?: string
  /** Render value as-is when prefers-reduced-motion is set. */
}

export function CountUp({
  value,
  duration = 1200,
  decimals = 0,
  locale = 'de-AT',
  prefix = '',
  suffix = '',
  className = '',
}: Props) {
  const ref = useRef<HTMLSpanElement | null>(null)
  const [display, setDisplay] = useState(0)
  const startedRef = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Reduced motion: jump straight to target
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(value)
      startedRef.current = true
      return
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !startedRef.current) {
          startedRef.current = true
          io.disconnect()

          const start = performance.now()
          const from = 0
          const to = value

          const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration)
            // Standard ease-out
            const eased = 1 - Math.pow(1 - t, 3)
            setDisplay(from + (to - from) * eased)
            if (t < 1) requestAnimationFrame(tick)
            else setDisplay(to)
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.4 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [value, duration])

  const formatted = display.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  return (
    <span ref={ref} className={`${className} tabular`}>
      {prefix}{formatted}{suffix}
    </span>
  )
}
