import React from 'react'

/**
 * <HeroFlowLines />
 *
 * Restrained black-gold flowing curves for the hero background.
 *
 * Visual language: topographic / silk thread / financial contour lines,
 * not arcade effects. Drawn with thin gradient strokes that fade at both
 * horizontal ends, anchored to the bottom of the hero, with a single
 * warm soft light source at the bottom-left.
 *
 * Position: absolute, pointer-events:none. Behind text, above the
 * background-image dim layer.
 *
 * Honors prefers-reduced-motion: when reduced motion is preferred, all
 * dasharray flow + sparkle pulses are stripped, leaving a clean static
 * composition.
 */
export function HeroFlowLines() {
  return (
    <div
      aria-hidden
      className="hero-flow-lines absolute inset-0 z-[2] pointer-events-none overflow-hidden"
    >
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1920 900"
        preserveAspectRatio="xMidYMax slice"
      >
        <defs>
          {/* Horizontal stroke gradient — fades to transparent at both ends */}
          <linearGradient id="hflLine" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="rgba(212,175,55,0)"   />
            <stop offset="14%"  stopColor="rgba(212,175,55,0.35)" />
            <stop offset="34%"  stopColor="rgba(212,175,55,0.95)" />
            <stop offset="66%"  stopColor="rgba(212,175,55,0.95)" />
            <stop offset="86%"  stopColor="rgba(212,175,55,0.35)" />
            <stop offset="100%" stopColor="rgba(212,175,55,0)"   />
          </linearGradient>

          {/* Slightly warmer gradient for the brightest line */}
          <linearGradient id="hflLineBright" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="rgba(212,175,55,0)"   />
            <stop offset="20%"  stopColor="rgba(212,175,55,0.5)" />
            <stop offset="40%"  stopColor="rgba(255,225,140,1)"  />
            <stop offset="60%"  stopColor="rgba(255,225,140,1)"  />
            <stop offset="80%"  stopColor="rgba(212,175,55,0.5)" />
            <stop offset="100%" stopColor="rgba(212,175,55,0)"   />
          </linearGradient>

          {/* Bottom-left warm light source */}
          <radialGradient id="hflLeftGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="rgba(212,175,55,0.32)" />
            <stop offset="40%"  stopColor="rgba(212,175,55,0.10)" />
            <stop offset="100%" stopColor="rgba(212,175,55,0)"   />
          </radialGradient>

          {/* Bottom-right subtle warm glow */}
          <radialGradient id="hflRightGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="rgba(212,175,55,0.16)" />
            <stop offset="60%"  stopColor="rgba(212,175,55,0.05)" />
            <stop offset="100%" stopColor="rgba(212,175,55,0)"   />
          </radialGradient>

          {/* Very faint top hint — barely perceivable */}
          <radialGradient id="hflTopHint" cx="50%" cy="0%" r="55%">
            <stop offset="0%"   stopColor="rgba(212,175,55,0.06)" />
            <stop offset="100%" stopColor="rgba(212,175,55,0)"   />
          </radialGradient>

          {/* Vertical mask — curves fade in as they reach mid-height,
              keeping the headline area clean */}
          <linearGradient id="hflVMask" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="black" />
            <stop offset="32%"  stopColor="black" />
            <stop offset="48%"  stopColor="rgba(255,255,255,0.35)" />
            <stop offset="60%"  stopColor="white" />
            <stop offset="100%" stopColor="white" />
          </linearGradient>
          <mask id="hflVerticalMask">
            <rect width="100%" height="100%" fill="url(#hflVMask)" />
          </mask>

          {/* Soft glow filter for the brightest line */}
          <filter id="hflGlow" x="-2%" y="-50%" width="104%" height="200%">
            <feGaussianBlur stdDeviation="1.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Very faint top hint */}
        <rect x="0" y="0" width="1920" height="240" fill="url(#hflTopHint)" />

        {/* Bottom-left warm light source */}
        <ellipse cx="280"  cy="800" rx="520" ry="240" fill="url(#hflLeftGlow)" />
        {/* Bottom-right subtle warm glow */}
        <ellipse cx="1680" cy="850" rx="380" ry="160" fill="url(#hflRightGlow)" />

        {/* Curves — all masked vertically so they only show in the lower portion */}
        <g mask="url(#hflVerticalMask)">

          {/* 1 — brightest sweep, with glow */}
          <path
            d="M -100 480 C 320 380, 660 510, 1000 440 S 1620 360, 2020 420"
            stroke="url(#hflLineBright)"
            strokeWidth="1.5"
            fill="none"
            filter="url(#hflGlow)"
          />

          {/* 2 — gentle, animated dashed flow */}
          <path
            d="M -100 530 C 360 430, 680 560, 1020 490 S 1640 440, 2020 490"
            stroke="url(#hflLine)"
            strokeWidth="1"
            fill="none"
            opacity="0.7"
            strokeDasharray="220 70"
            className="hfl-flow hfl-flow-1"
          />

          {/* 3 — long static line */}
          <path
            d="M -100 580 C 280 510, 580 600, 900 560 S 1540 520, 2020 560"
            stroke="url(#hflLine)"
            strokeWidth="1.1"
            fill="none"
            opacity="0.6"
          />

          {/* 4 — uplifted curve, animated */}
          <path
            d="M -100 630 C 380 530, 700 660, 1060 580 S 1620 540, 2020 590"
            stroke="url(#hflLine)"
            strokeWidth="0.8"
            fill="none"
            opacity="0.5"
            strokeDasharray="140 60"
            className="hfl-flow hfl-flow-2"
          />

          {/* 5 — gentle subtle */}
          <path
            d="M -100 680 C 320 600, 620 720, 960 660 S 1560 620, 2020 660"
            stroke="url(#hflLine)"
            strokeWidth="0.7"
            fill="none"
            opacity="0.4"
          />

          {/* 6 — long thin line, animated */}
          <path
            d="M -100 730 C 400 660, 720 770, 1040 720 S 1620 700, 2020 720"
            stroke="url(#hflLine)"
            strokeWidth="0.6"
            fill="none"
            opacity="0.3"
            strokeDasharray="100 40"
            className="hfl-flow hfl-flow-3"
          />

          {/* 7 — faintest, near bottom */}
          <path
            d="M -100 790 C 280 740, 600 820, 920 780 S 1580 760, 2020 790"
            stroke="url(#hflLine)"
            strokeWidth="0.5"
            fill="none"
            opacity="0.22"
          />

          {/* Sparkle particles — placed along brighter curves */}
          <circle cx="540"  cy="478" r="1.4" fill="rgba(255,225,140,0.95)" filter="url(#hflGlow)" className="hfl-sparkle hfl-sparkle-0" />
          <circle cx="1280" cy="408" r="1.2" fill="rgba(212,175,55,0.9)"   filter="url(#hflGlow)" className="hfl-sparkle hfl-sparkle-1" />
          <circle cx="1620" cy="556" r="1.0" fill="rgba(212,175,55,0.8)"   filter="url(#hflGlow)" className="hfl-sparkle hfl-sparkle-2" />
        </g>
      </svg>
    </div>
  )
}
