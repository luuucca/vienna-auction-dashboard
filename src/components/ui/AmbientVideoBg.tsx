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

const CROSSFADE_MS      = 1400
const SLIDE_DURATION_MS = 6500 // each clip visible ~5s + 1.5s fade

export function AmbientVideoBg({
  src,
  poster,
  opacity = 0.3,
  playbackRate = 0.85,
}: {
  /** A single video URL, or an array of URLs to rotate through. */
  src: string | string[]
  poster?: string
  opacity?: number
  playbackRate?: number
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

  // Each index change: rewind + play new, pause others after crossfade
  React.useEffect(() => {
    const v = refs.current[index]
    if (v) {
      try {
        v.currentTime = 0
        v.playbackRate = playbackRate
        v.play().catch(() => {})
      } catch { /* readyState too low */ }
    }
    const t = window.setTimeout(() => {
      refs.current.forEach((vid, i) => {
        if (i !== index && vid && !vid.paused) vid.pause()
      })
    }, CROSSFADE_MS + 100)
    return () => clearTimeout(t)
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
          ref={(el) => { refs.current[i] = el }}
          src={url}
          poster={poster}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{
            opacity: available[i] && i === index ? opacity : 0,
            transition: `opacity ${CROSSFADE_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
            willChange: 'opacity',
          }}
          autoPlay={i === 0}
          loop={sources.length === 1}   // only loop when single clip
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
    </>
  )
}
