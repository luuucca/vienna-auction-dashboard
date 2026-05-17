import React from 'react'
import { useReducedMotion } from 'framer-motion'

/**
 * Ambient video background. Accepts either a single clip or an array
 * to rotate through with smooth crossfades. Pairs with an optional
 * poster image for slow / blocked connections.
 *
 * Designed for SUBDUED treatments behind text — keep opacity low
 * (0.18–0.32) so foreground copy stays readable.
 *
 * Differs from HeroVideoLoop: that one is the cinematic centerpiece.
 * This is a quiet section accent. No Ken-Burns, no hero-grade
 * orchestration.
 */

// Seedance clips are 5.06s native. To eliminate the freeze-on-last-
// frame between a video ending and the next fade-in, we:
//   - cycle every 5s
//   - 1.5s crossfade (so fade-out window = 5s → 6.5s real time)
//   - playback rate 0.77 so the natural end-of-clip lands at 6.5s
//     real time — exactly when the fade-out finishes
// Mirrors the hero's exact timing for consistency.
const SLIDE_DURATION_MS = 5000
const CROSSFADE_MS      = 1500

export function AmbientVideoBg({
  src,
  poster,
  opacity = 0.3,
  playbackRate = 0.77,
  scanlines = false,
  scanlineColor = 'gold',
  scanlineIntensity = 0.18,
  videoStyles,
}: {
  /** A single video URL, or an array of URLs to rotate through. */
  src: string | string[]
  poster?: string
  opacity?: number
  playbackRate?: number
  /** Overlay a CRT-style horizontal scanline pattern on top. */
  scanlines?: boolean
  /** "gold" tint (additive screen blend) or "black" (subtractive
   *  multiply). Default gold to match the brand accent. */
  scanlineColor?: 'gold' | 'black'
  /** 0–1 intensity of each line. 0.15 is subtle, 0.30 is heavy. */
  scanlineIntensity?: number
  /** Optional per-slide CSS style overrides (e.g. translateX for
   *  a specific clip whose subject sits off-center). Index matches
   *  src array. */
  videoStyles?: React.CSSProperties[]
}) {
  const sources = React.useMemo(() => Array.isArray(src) ? src : [src], [src])
  const reduce = useReducedMotion()
  const refs = React.useRef<(HTMLVideoElement | null)[]>([])
  const [index, setIndex] = React.useState(0)
  const [available, setAvailable] = React.useState<boolean[]>(() => sources.map(() => true))
  const [anyStarted, setAnyStarted] = React.useState(false)

  // Sync availability array length when sources change
  React.useEffect(() => {
    setAvailable(sources.map(() => true))
  }, [sources])

  // Auto-advance through the rotation
  React.useEffect(() => {
    if (reduce || sources.length <= 1) return
    const id = window.setInterval(() => {
      if (document.hidden) return
      setIndex(i => {
        let next = (i + 1) % sources.length
        for (let n = 0; n < sources.length; n++) {
          if (available[next]) break
          next = (next + 1) % sources.length
        }
        return next
      })
    }, SLIDE_DURATION_MS)
    return () => clearInterval(id)
  }, [reduce, sources.length, available])

  // Keep all clips playing continuously (no pause/resume → no decoder
  // state loss). When the rotation cycles to a clip, reset it to t=0
  // so the user sees the clip start from its natural opening rather
  // than mid-loop. The reset coincides with the opacity fade-in, so
  // the seek frame is hidden.
  React.useEffect(() => {
    refs.current.forEach((v, i) => {
      if (!v) return
      v.playbackRate = playbackRate
      if (v.paused) v.play().catch(() => {})
    })
  }, [playbackRate])

  React.useEffect(() => {
    const v = refs.current[index]
    if (!v) return
    try {
      v.currentTime = 0
      v.playbackRate = playbackRate
      if (v.paused) v.play().catch(() => {})
    } catch { /* readyState too low — interval tick will retry */ }
  }, [index, playbackRate])

  // Reduced motion: poster only, no video
  if (reduce) {
    return poster ? (
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(${poster})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity,
        }}
      />
    ) : null
  }

  const allFailed = available.every(v => !v)
  const showPoster = !anyStarted || allFailed

  return (
    <>
      {/* Fallback poster — visible only on cold start or if every
          video fails. Avoids the alpha-blend "ghost image" issue. */}
      {poster && (
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url(${poster})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: showPoster ? opacity : 0,
            transition: 'opacity 600ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
      )}
      {sources.map((url, i) => (
        <video
          key={url}
          ref={(el) => {
            refs.current[i] = el
            // Apply playbackRate at the earliest possible moment — before
            // the autoplay attribute has a chance to start the video at
            // native speed. Race-free guarantee that slide 0 always
            // plays at the intended slowdown.
            if (el) el.playbackRate = playbackRate
          }}
          src={url}
          poster={poster}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{
            opacity: available[i] && i === index ? opacity : 0,
            transition: `opacity ${CROSSFADE_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
            willChange: 'opacity',
            ...(videoStyles?.[i] || {}),
          }}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          // eslint-disable-next-line react/no-unknown-property
          x5-video-player-type="h5"
          // eslint-disable-next-line react/no-unknown-property
          webkit-playsinline="true"
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore — valid HTML attribute
          disablePictureInPicture
          onPlaying={() => setAnyStarted(true)}
          onLoadedMetadata={(e) => {
            (e.currentTarget as HTMLVideoElement).playbackRate = playbackRate
          }}
          onError={() => {
            setAvailable(a => a.map((v, idx) => idx === i ? false : v))
          }}
        />
      ))}
      {/* CRT-style horizontal scanlines overlay. Sits ABOVE the video
          but below any foreground content (parent should layer this
          accordingly via z-index / source order). */}
      {scanlines && (
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              ${scanlineColor === 'gold'
                ? `rgba(212, 175, 55, ${scanlineIntensity})`
                : `rgba(0, 0, 0, ${scanlineIntensity})`} 0px,
              ${scanlineColor === 'gold'
                ? `rgba(212, 175, 55, ${scanlineIntensity})`
                : `rgba(0, 0, 0, ${scanlineIntensity})`} 1px,
              transparent 1px,
              transparent 3px
            )`,
            mixBlendMode: scanlineColor === 'gold' ? 'screen' : 'multiply',
          }}
        />
      )}
    </>
  )
}
