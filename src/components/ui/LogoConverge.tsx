import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

/**
 * Hero badge animation — house→roof→X reveal.
 *
 * Phase 0 (0   – 1.4s) : Serif "A" slides in from off-left, "X" from
 *                        off-right. They settle center, hold ~0.5s,
 *                        then fade out as the SVG takes over. This
 *                        matches the v1 "swoosh-in" feel the user
 *                        approved.
 * Phase 1 (1.0 – 1.6s) : The AX silhouette's left + right roof
 *                        strokes plus temporary house walls and floor
 *                        draw in via pathLength 0→1 — looks like a
 *                        kid's house sketch.
 * Phase 2 (1.6 – 2.0s) : Walls + floor fade out; the door wedge
 *                        inside the A appears at the same time.
 * Phase 3 (2.0 – 2.4s) : X's FIRST stroke draws in gold over the
 *                        right side of the roof. The user flagged
 *                        that this stroke was hidden in v2 because
 *                        it overlapped the A's right slope — here
 *                        it's a SEPARATE long diagonal that crosses
 *                        the A and extends past it both above and
 *                        below.
 * Phase 4 (2.4 – 2.8s) : X's SECOND stroke draws in WHITE.
 *
 * Final state: gold A + gold door + gold X1 + white X2.
 *
 * prefers-reduced-motion → static PNG fallback.
 */

const GOLD  = '#d4af37'
const WHITE = '#ffffff'
const EASE  = [0.22, 1, 0.36, 1] as const

// ── Logo geometry (viewBox 0 0 200 200) ──────────────────────────────
// A is a narrow inverted-V roof centered-left so the X (positioned on
// its right side) has room to extend beyond. The temporary house walls
// sit BELOW the A's feet, giving a clean kid-drawing silhouette before
// they erase.
const PEAK    = { x: 80,  y: 28 }
const A_LEFT  = { x: 22,  y: 152 }
const A_RIGHT = { x: 138, y: 152 }

// "door" wedge inside the A — slim upright trapezoid
const DOOR =
  `M ${PEAK.x - 7} ${A_LEFT.y - 70}
   L ${PEAK.x + 7} ${A_LEFT.y - 70}
   L ${PEAK.x + 13} ${A_LEFT.y}
   L ${PEAK.x - 13} ${A_LEFT.y} Z`

// X strokes — both extend ABOVE A's peak and BELOW A's feet so they
// read as their own X, not just A-right-slope twins.
const X1_TOP    = { x: 105, y: 22 }
const X1_BOTTOM = { x: 192, y: 175 }
const X2_TOP    = { x: 192, y: 22 }
const X2_BOTTOM = { x: 105, y: 175 }

// Temporary house walls + floor — erased in Phase 2
const WALL_BOTTOM_Y = 192
const FLOOR_LEFT    = { x: A_LEFT.x,  y: WALL_BOTTOM_Y }
const FLOOR_RIGHT   = { x: A_RIGHT.x, y: WALL_BOTTOM_Y }

export function LogoConverge({ height = 80 }: { height?: number }) {
  const reduce = useReducedMotion()
  // SVG viewBox is 200×200 — render slightly wider than tall to give
  // the X strokes room when they extend past the A's footprint.
  const width = height * 1.3

  if (reduce) {
    return (
      <img
        src="/logo.png"
        alt=""
        style={{
          height,
          width: 'auto',
          filter:
            'brightness(0) saturate(100%) invert(72%) sepia(50%) saturate(615%) hue-rotate(2deg) brightness(91%) contrast(86%)',
        }}
      />
    )
  }

  const glyphStyle: React.CSSProperties = {
    fontFamily: '"Playfair Display", "Noto Serif SC", serif',
    fontWeight: 700,
    fontSize: height * 0.85,
    lineHeight: 1,
    color: GOLD,
    letterSpacing: '-0.04em',
    position: 'absolute',
  }

  const STROKE = 7

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width, height }}
      aria-label="奥匈置业研究所"
    >
      {/* ── Phase 0: A and X serif glyphs swoop in, hold, fade out ──── */}
      <motion.span
        style={glyphStyle}
        initial={{ x: -height * 1.4, opacity: 0 }}
        animate={{ x: 0, opacity: [0, 1, 1, 0] }}
        transition={{
          duration: 1.4,
          times: [0, 0.4, 0.75, 1],
          ease: EASE,
        }}
      >
        A
      </motion.span>
      <motion.span
        style={glyphStyle}
        initial={{ x: height * 1.4, opacity: 0 }}
        animate={{ x: 0, opacity: [0, 1, 1, 0] }}
        transition={{
          duration: 1.4,
          times: [0, 0.4, 0.75, 1],
          ease: EASE,
        }}
      >
        X
      </motion.span>

      {/* ── Phases 1-4: SVG draw-in sequence ──────────────────────────── */}
      <svg
        viewBox="0 0 200 200"
        width={width}
        height={height}
        style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
        aria-hidden
      >
        {/* A's left slope */}
        <motion.line
          x1={PEAK.x} y1={PEAK.y}
          x2={A_LEFT.x} y2={A_LEFT.y}
          stroke={GOLD} strokeWidth={STROKE} strokeLinecap="round" fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 1.0, duration: 0.6, ease: EASE }}
        />
        {/* A's right slope */}
        <motion.line
          x1={PEAK.x} y1={PEAK.y}
          x2={A_RIGHT.x} y2={A_RIGHT.y}
          stroke={GOLD} strokeWidth={STROKE} strokeLinecap="round" fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 1.0, duration: 0.6, ease: EASE }}
        />

        {/* Temp walls + floor */}
        <motion.line
          x1={A_LEFT.x} y1={A_LEFT.y}
          x2={FLOOR_LEFT.x} y2={FLOOR_LEFT.y}
          stroke={GOLD} strokeWidth={STROKE} strokeLinecap="round" fill="none"
          initial={{ pathLength: 0, opacity: 1 }}
          animate={{
            pathLength: [0, 1, 1, 1],
            opacity:    [1, 1, 1, 0],
          }}
          transition={{
            duration: 1.4,
            times: [0, 0.3, 0.7, 1],
            delay: 1.2,
            ease: EASE,
          }}
        />
        <motion.line
          x1={A_RIGHT.x} y1={A_RIGHT.y}
          x2={FLOOR_RIGHT.x} y2={FLOOR_RIGHT.y}
          stroke={GOLD} strokeWidth={STROKE} strokeLinecap="round" fill="none"
          initial={{ pathLength: 0, opacity: 1 }}
          animate={{
            pathLength: [0, 1, 1, 1],
            opacity:    [1, 1, 1, 0],
          }}
          transition={{
            duration: 1.4,
            times: [0, 0.3, 0.7, 1],
            delay: 1.2,
            ease: EASE,
          }}
        />
        <motion.line
          x1={FLOOR_LEFT.x} y1={FLOOR_LEFT.y}
          x2={FLOOR_RIGHT.x} y2={FLOOR_RIGHT.y}
          stroke={GOLD} strokeWidth={STROKE} strokeLinecap="round" fill="none"
          initial={{ pathLength: 0, opacity: 1 }}
          animate={{
            pathLength: [0, 1, 1, 1],
            opacity:    [1, 1, 1, 0],
          }}
          transition={{
            duration: 1.4,
            times: [0, 0.3, 0.7, 1],
            delay: 1.3,
            ease: EASE,
          }}
        />

        {/* Door wedge — appears as walls fade out */}
        <motion.path
          d={DOOR}
          fill={GOLD}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.8, duration: 0.35, ease: EASE }}
          style={{ transformOrigin: `${PEAK.x}px ${A_LEFT.y}px` }}
        />

        {/* X's FIRST stroke — drawn in gold AFTER walls erase */}
        <motion.line
          x1={X1_TOP.x}    y1={X1_TOP.y}
          x2={X1_BOTTOM.x} y2={X1_BOTTOM.y}
          stroke={GOLD} strokeWidth={STROKE} strokeLinecap="round" fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 2.05, duration: 0.45, ease: EASE }}
        />

        {/* X's SECOND stroke — drawn in WHITE last */}
        <motion.line
          x1={X2_TOP.x}    y1={X2_TOP.y}
          x2={X2_BOTTOM.x} y2={X2_BOTTOM.y}
          stroke={WHITE} strokeWidth={STROKE} strokeLinecap="round" fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 2.55, duration: 0.45, ease: EASE }}
        />
      </svg>
    </div>
  )
}
