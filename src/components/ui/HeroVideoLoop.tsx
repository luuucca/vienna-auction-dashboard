import React from 'react'
import { useReducedMotion } from 'framer-motion'

/**
 * Hero background video loop — silky-smooth version.
 *
 * Why not the obvious autoPlay + loop on every video?
 *   - Each <video loop> hard-seeks to t=0 at end-of-clip. If the
 *     clip is the same length as the slide interval, that rewind
 *     hits during the crossfade and looks like a stutter.
 *   - 4 simultaneous video streams under autoplay starve mobile
 *     decoders. iOS Safari historically allowed 1 active video.
 *
 * Strategy here:
 *   - All clips preload="auto" so the data is already on disk by
 *     the time we cycle to them. No cold-start buffering.
 *   - Only ONE clip plays at a time (current index). Others get
 *     .pause() after the crossfade settles.
 *   - On index change we set currentTime=0 + .play() on the
 *     incoming clip. The outgoing one keeps playing through the
 *     entire crossfade (clips are 5s, we cycle at 4s, fade is 1.2s
 *     so the fade-out completes right at the 5s natural end).
 *     No visible freeze-on-last-frame.
 *   - prefers-reduced-motion freezes on slide 1, no advancement.
 */

const SLIDES = [
  '/hero/01-stephansdom-dusk.mp4',
  '/hero/02-belvedere-golden.mp4',
  '/hero/06-hofburg-sunset.mp4',
  '/hero/03-ringstrasse-night.mp4',
  '/hero/04-donaukanal-twilight.mp4',
]

// Seedance-2.0 default output is 5.06s per clip. Cycle 4s before
// the next slide so the 1.2s crossfade ends right at the 5s natural
// end-of-clip — the outgoing video is still moving the entire time
// it's visible.
const SLIDE_DURATION_MS = 4000
const CROSSFADE_MS      = 1200
const PEAK_OPACITY      = 0.72

export function HeroVideoLoop() {
  const [index, setIndex] = React.useState(0)
  const [available, setAvailable] = React.useState<boolean[]>(() => SLIDES.map(() => true))
  const refs = React.useRef<(HTMLVideoElement | null)[]>([])
  const reduce = useReducedMotion()

  // Advance through the rotation
  React.useEffect(() => {
    if (reduce || SLIDES.length <= 1) return
    const id = window.setInterval(() => {
      if (document.hidden) return
      setIndex(i => {
        let next = (i + 1) % SLIDES.length
        // Skip slides that failed to load
        for (let n = 0; n < SLIDES.length; n++) {
          if (available[next]) break
          next = (next + 1) % SLIDES.length
        }
        return next
      })
    }, SLIDE_DURATION_MS)
    return () => clearInterval(id)
  }, [reduce, available])

  // On index change (and on mount):
  //  - rewind + play the incoming clip
  //  - after the crossfade settles, pause everyone else so only
  //    the visible clip is decoding.
  React.useEffect(() => {
    const incoming = refs.current[index]
    if (incoming) {
      try {
        incoming.currentTime = 0
        // play() returns a Promise; swallow rejections from autoplay
        // policies — muted + playsInline means the browser will
        // generally grant it, but a tab-throttle race can still
        // throw NotAllowedError. The next interval tick will retry.
        incoming.play().catch(() => {})
      } catch { /* readyState too low — will succeed on the next tick */ }
    }
    const t = window.setTimeout(() => {
      refs.current.forEach((v, i) => {
        if (i !== index && v && !v.paused) v.pause()
      })
    }, CROSSFADE_MS + 80)
    return () => clearTimeout(t)
  }, [index])

  return (
    <>
      {SLIDES.map((src, i) => (
        <video
          key={src}
          ref={(el) => { refs.current[i] = el }}
          src={src}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: available[i] && i === index ? PEAK_OPACITY : 0,
            transition: `opacity ${CROSSFADE_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
            willChange: 'opacity',
          }}
          muted
          playsInline
          preload="auto"
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore — valid HTML attribute
          disablePictureInPicture
          // Mount-time autoplay for slide 0. The effect above takes
          // over from there.
          autoPlay={i === 0}
          onError={() => {
            setAvailable(a => a.map((v, idx) => idx === i ? false : v))
          }}
        />
      ))}
    </>
  )
}
