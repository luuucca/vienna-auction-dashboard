import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

/**
 * Hero badge animation.
 *
 * Phase 0 (0-0.7s)    : Serif "A" slides in from off-left, serif "X"
 *                       slides in from off-right, both gold.
 * Phase 1 (0.7-0.9s)  : The A/X glyphs fade out as the SVG logomark
 *                       starts drawing in (overlapping).
 * Phase 2 (0.8-1.4s)  : The "house" appears — the AX logomark's two
 *                       outer diagonals (which form an inverted V
 *                       roof) plus temporary vertical walls and a
 *                       floor line.
 * Phase 3 (1.4-1.8s)  : Walls + floor fade out, leaving only the
 *                       roof. The "door" wedge inside the A appears
 *                       simultaneously.
 * Phase 4 (1.9-2.5s)  : The X's second (cross) stroke draws in white
 *                       — the final accent.
 *
 * Final state: gold roof + gold door wedge + white X cross stroke.
 *
 * Honors prefers-reduced-motion → renders the static PNG immediately.
 */

const GOLD = '#d4af37'
const EASE = [0.22, 1, 0.36, 1] as const

// Logo geometry — viewBox 0 0 200 200. Strokes positioned to match
// the PNG's twin-diagonal "AX" silhouette. The bottom 40 units of
// the viewBox hold the temporary house walls + floor that get
// erased in Phase 3, so the final logo proper sits in y=10–155.
const PEAK      = { x: 100, y: 12 }
const A_LEFT    = { x: 16,  y: 155 }     // A's bottom-left foot
const A_RIGHT   = { x: 184, y: 155 }     // shared with X's first stroke
const X2_TOP    = { x: 162, y: 30 }      // X's second stroke top end
const X2_BOTTOM = { x: 100, y: 155 }     // X's second stroke bottom

// Door wedge (slim upright trapezoid inside the A)
const DOOR = `M 93 82 L 107 82 L 113 155 L 87 155 Z`

// Temporary house walls + floor (drawn in Phase 2, erased in Phase 3)
const WALL_L_TOP    = A_LEFT
const WALL_R_TOP    = A_RIGHT
const WALL_BOTTOM_Y = 192
const FLOOR_LEFT    = { x: A_LEFT.x,  y: WALL_BOTTOM_Y }
const FLOOR_RIGHT   = { x: A_RIGHT.x, y: WALL_BOTTOM_Y }

export function LogoConverge({ height = 80 }: { height?: number }) {
  const reduce = useReducedMotion()
  const width = height * 1.2 // viewBox 200/200 squared display; tweak if needed

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

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width, height }}
      aria-label="奥匈置业研究所"
    >
      {/* ── Phase 0/1: A and X serif glyphs ─────────────────────────── */}
      <motion.span
        style={glyphStyle}
        initial={{ x: -height * 1.4, opacity: 0 }}
        animate={{
          x: [-height * 1.4, 0, 0, 0],
          opacity: [0, 1, 1, 0],
        }}
        transition={{
          duration: 0.95,
          times: [0, 0.5, 0.75, 1],
          ease: EASE,
        }}
      >
        A
      </motion.span>
      <motion.span
        style={glyphStyle}
        initial={{ x: height * 1.4, opacity: 0 }}
        animate={{
          x: [height * 1.4, 0, 0, 0],
          opacity: [0, 1, 1, 0],
        }}
        transition={{
          duration: 0.95,
          times: [0, 0.5, 0.75, 1],
          ease: EASE,
        }}
      >
        X
      </motion.span>

      {/* ── Phase 2-4: SVG house → roof → white X cross ─────────────── */}
      <svg
        viewBox="0 0 200 200"
        width={width}
        height={height}
        style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
        aria-hidden
      >
        {/* A's left slope — drawn in Phase 2 */}
        <motion.line
          x1={PEAK.x}    y1={PEAK.y}
          x2={A_LEFT.x}  y2={A_LEFT.y}
          stroke={GOLD}
          strokeWidth={6}
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.8, duration: 0.6, ease: EASE }}
        />

        {/* A's right slope = X's first stroke — drawn in Phase 2 */}
        <motion.line
          x1={PEAK.x}    y1={PEAK.y}
          x2={A_RIGHT.x} y2={A_RIGHT.y}
          stroke={GOLD}
          strokeWidth={6}
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.8, duration: 0.6, ease: EASE }}
        />

        {/* Temporary wall: left */}
        <motion.line
          x1={WALL_L_TOP.x} y1={WALL_L_TOP.y}
          x2={FLOOR_LEFT.x} y2={FLOOR_LEFT.y}
          stroke={GOLD}
          strokeWidth={6}
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 1 }}
          animate={{
            pathLength: [0, 1, 1, 1],
            opacity:    [1, 1, 1, 0],
          }}
          transition={{
            duration: 1.4,
            times: [0, 0.3, 0.7, 1],
            delay: 1.0,
            ease: EASE,
          }}
        />
        {/* Temporary wall: right */}
        <motion.line
          x1={WALL_R_TOP.x}  y1={WALL_R_TOP.y}
          x2={FLOOR_RIGHT.x} y2={FLOOR_RIGHT.y}
          stroke={GOLD}
          strokeWidth={6}
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 1 }}
          animate={{
            pathLength: [0, 1, 1, 1],
            opacity:    [1, 1, 1, 0],
          }}
          transition={{
            duration: 1.4,
            times: [0, 0.3, 0.7, 1],
            delay: 1.0,
            ease: EASE,
          }}
        />
        {/* Temporary floor */}
        <motion.line
          x1={FLOOR_LEFT.x}  y1={FLOOR_LEFT.y}
          x2={FLOOR_RIGHT.x} y2={FLOOR_RIGHT.y}
          stroke={GOLD}
          strokeWidth={6}
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 1 }}
          animate={{
            pathLength: [0, 1, 1, 1],
            opacity:    [1, 1, 1, 0],
          }}
          transition={{
            duration: 1.4,
            times: [0, 0.3, 0.7, 1],
            delay: 1.1,
            ease: EASE,
          }}
        />

        {/* Door wedge — appears as walls erase */}
        <motion.path
          d={DOOR}
          fill={GOLD}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5, duration: 0.35, ease: EASE }}
          style={{ transformOrigin: `${(A_LEFT.x + A_RIGHT.x) / 2}px ${A_LEFT.y}px` }}
        />

        {/* X's second stroke — white, drawn last */}
        <motion.line
          x1={X2_TOP.x}    y1={X2_TOP.y}
          x2={X2_BOTTOM.x} y2={X2_BOTTOM.y}
          stroke="#ffffff"
          strokeWidth={6}
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 1.9, duration: 0.6, ease: EASE }}
        />
      </svg>
    </div>
  )
}
