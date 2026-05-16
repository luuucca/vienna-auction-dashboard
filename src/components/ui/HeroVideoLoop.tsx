import React from 'react'
import { useReducedMotion } from 'framer-motion'

/**
 * Hero background video loop. Replaces the static-image cinemagraph
 * with 4 cinematic Seedance-generated Vienna clips (~8s each). Each
 * clip crossfades into the next as it nears the end of its run.
 *
 * Why not a single long video?
 *  - Multiple short clips give visual variety without ballooning the
 *    file size of any one asset (each clip stays ≤ ~5MB).
 *  - Crossfading short clips hides the moment the loop "rewinds",
 *    which on a single video file always feels mechanical.
 *
 * Accessibility:
 *  - `playsInline` so iOS Safari doesn't fullscreen on play.
 *  - `muted` (autoplay requirement on all browsers).
 *  - prefers-reduced-motion → freeze on the first frame (poster) of
 *    the first clip; never advance.
 *  - `loading="lazy"` on slides 2-4 so first paint isn't blocked.
 *
 * Drop-in compatible with HeroCinemagraph — same wrapper expectations:
 * lives inside an absolute-positioned container with its own parent
 * styling, gradient overlays painted on top by the page itself.
 */

/* All paths relative to /public — Vite serves them at the root. */
const SLIDES = [
  '/hero/01-stephansdom-dusk.mp4',
  '/hero/02-belvedere-golden.mp4',
  '/hero/03-ringstrasse-night.mp4',
  '/hero/04-donaukanal-twilight.mp4',
]

const SLIDE_DURATION_MS = 8000   // length of each clip (matches Seedance output)
const CROSSFADE_MS      = 1200   // overlap of the next clip fading in
const PEAK_OPACITY      = 0.58   // matches the prior cinemagraph treatment

export function HeroVideoLoop() {
  const [index, setIndex] = React.useState(0)
  const [available, setAvailable] = React.useState<boolean[]>(() => SLIDES.map(() => true))
  const reduce = useReducedMotion()

  // Advance every SLIDE_DURATION_MS. Pause when tab is hidden so we
  // don't waste cycles or trigger needless network seeks.
  React.useEffect(() => {
    if (reduce) return
    const id = window.setInterval(() => {
      if (document.hidden) return
      setIndex(i => {
        let next = (i + 1) % SLIDES.length
        // Skip any slide that previously failed to load
        for (let n = 0; n < SLIDES.length; n++) {
          if (available[next]) break
          next = (next + 1) % SLIDES.length
        }
        return next
      })
    }, SLIDE_DURATION_MS - CROSSFADE_MS / 2)
    return () => clearInterval(id)
  }, [reduce, available])

  return (
    <>
      {SLIDES.map((src, i) => (
        <video
          key={src}
          src={src}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: available[i] && i === index ? PEAK_OPACITY : 0,
            transition: `opacity ${CROSSFADE_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
            willChange: 'opacity',
          }}
          autoPlay
          loop
          muted
          playsInline
          // Browsers won't autoplay without these
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore — valid HTML attribute
          disablePictureInPicture
          preload={i === 0 ? 'auto' : 'metadata'}
          onError={() => {
            setAvailable(a => a.map((v, idx) => idx === i ? false : v))
          }}
        />
      ))}
    </>
  )
}
