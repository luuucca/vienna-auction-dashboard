import React, { useEffect, useRef, useState } from 'react'

/**
 * Reveal-on-scroll wrapper.
 * Uses IntersectionObserver — runs ONCE per element, then unobserves.
 * Honors prefers-reduced-motion via DESIGN.md baseline.
 *
 * Default: 16px translate-up + opacity 0 → 1, 500ms standard ease.
 * Stagger children via the `delay` prop (in ms).
 */
interface RevealProps {
  children: React.ReactNode
  delay?: number      // ms
  duration?: number   // ms (default 500)
  y?: number          // initial translateY in px (default 16)
  className?: string
  as?: keyof JSX.IntrinsicElements
  /** Trigger threshold (0–1). Lower = earlier. */
  threshold?: number
  /** Margin around root before triggering, eg "-50px". */
  rootMargin?: string
}

export function Reveal({
  children,
  delay = 0,
  duration = 500,
  y = 16,
  className = '',
  as = 'div',
  threshold = 0.15,
  rootMargin = '0px 0px -60px 0px',
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || visible) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { threshold, rootMargin }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [visible, threshold, rootMargin])

  const Tag = as as any
  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translate3d(0,0,0)' : `translate3d(0,${y}px,0)`,
        transition: `opacity ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        willChange: visible ? 'auto' : 'opacity, transform',
      }}
    >
      {children}
    </Tag>
  )
}

// ─── Stagger group ────────────────────────────────────────────────────────────
// Children become Reveal wrappers automatically with incrementing delays.
interface StaggerProps {
  children: React.ReactNode
  step?: number   // ms between each child
  startDelay?: number
  className?: string
}

export function Stagger({ children, step = 80, startDelay = 0, className }: StaggerProps) {
  return (
    <>
      {React.Children.map(children, (child, i) => (
        <Reveal delay={startDelay + i * step} className={className}>
          {child}
        </Reveal>
      ))}
    </>
  )
}
