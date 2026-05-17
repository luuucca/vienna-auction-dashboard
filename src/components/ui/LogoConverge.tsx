import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

/**
 * Hero badge variant: two large letterforms "A" and "X" fly in from
 * opposite sides, meet in the middle, then crossfade into the actual
 * stylized AX logomark. Plays once on mount.
 *
 * Honors prefers-reduced-motion → static logo only.
 */
export function LogoConverge({ height = 56 }: { height?: number }) {
  const reduce = useReducedMotion()

  // Once final, hide the moving glyphs and just show the static logo.
  // This avoids any chance of the convergence ghosting through later.
  const [done, setDone] = React.useState(false)

  React.useEffect(() => {
    if (reduce) { setDone(true); return }
    const t = setTimeout(() => setDone(true), 1500) // matches the slowest leg
    return () => clearTimeout(t)
  }, [reduce])

  // The final logo is rendered at full `height`. The incoming A/X
  // glyphs come in slightly smaller (0.72×) so the post-slide PNG
  // visibly grows into a more prominent mark.
  const glyphSize = height * 0.72

  const glyphStyle: React.CSSProperties = {
    fontFamily: '"Playfair Display", "Noto Serif SC", serif',
    fontWeight: 700,
    fontSize: glyphSize,
    lineHeight: 1,
    color: '#d4af37',
    letterSpacing: '-0.04em',
  }

  const ease = [0.22, 1, 0.36, 1] as const

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ height, width: height * 2.6 }}
      aria-label="奥匈置业研究所"
    >
      {!reduce && !done && (
        <>
          {/* "A" — slides in from off-left, settles centered, then fades */}
          <motion.span
            style={{ ...glyphStyle, position: 'absolute' }}
            initial={{ x: -height * 1.4, opacity: 0 }}
            animate={{ x: 0, opacity: [0, 1, 1, 0] }}
            transition={{
              duration: 1.4,
              times: [0, 0.4, 0.75, 1],
              ease,
            }}
          >
            A
          </motion.span>
          {/* "X" — mirrors from off-right */}
          <motion.span
            style={{ ...glyphStyle, position: 'absolute' }}
            initial={{ x: height * 1.4, opacity: 0 }}
            animate={{ x: 0, opacity: [0, 1, 1, 0] }}
            transition={{
              duration: 1.4,
              times: [0, 0.4, 0.75, 1],
              ease,
            }}
          >
            X
          </motion.span>
        </>
      )}
      {/* Final stylized AX mark — fades in as the glyphs fade out.
          Starts at the glyph's smaller size and scales UP to full
          height so the post-slide logo visibly grows. */}
      <motion.img
        src="/logo.png"
        alt=""
        initial={reduce ? { opacity: 1, scale: 1 } : { opacity: 0, scale: glyphSize / height }}
        animate={{ opacity: 1, scale: 1 }}
        transition={reduce ? { duration: 0 } : { delay: 1.0, duration: 0.7, ease }}
        style={{
          height,
          width: 'auto',
          // Recolor the dark-grey source PNG to brand gold
          filter:
            'brightness(0) saturate(100%) invert(72%) sepia(50%) saturate(615%) hue-rotate(2deg) brightness(91%) contrast(86%)',
        }}
      />
    </div>
  )
}
