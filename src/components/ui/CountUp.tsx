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
  const displayRef = useRef(0)
  // Keep displayRef in sync so the value-change effect can read it
  // without listing `display` as a dependency.
  displayRef.current = display

  // ── First-paint animation: viewport-triggered 0 → target ──
  useEffect(() => {
    const el = ref.current
    if (!el) return

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
          const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration)
            const eased = 1 - Math.pow(1 - t, 3)
            setDisplay(eased * value)
            if (t < 1) requestAnimationFrame(tick)
            else setDisplay(value)
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.4 }
    )
    io.observe(el)
    return () => io.disconnect()
    // intentionally empty deps — first-paint only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Post-mount value changes: smoothly catch up to new target ──
  // Triggered when async data (e.g. /api/listings) arrives after the
  // initial viewport-triggered animation has already locked startedRef.
  useEffect(() => {
    if (!startedRef.current) return
    if (Math.abs(displayRef.current - value) < 0.5) return

    const start = performance.now()
    const from = displayRef.current
    const to = value
    const dur = 600

    let raf = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(from + (to - from) * eased)
      if (t < 1) raf = requestAnimationFrame(tick)
      else setDisplay(to)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value])

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
