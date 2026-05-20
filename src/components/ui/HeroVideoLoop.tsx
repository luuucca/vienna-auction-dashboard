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

// Each slide can override the default duration (e.g. the AX-logo
// intro is 10s native and needs a longer window than the 5s Seedance
// clips).
const SLIDES: { src: string; duration?: number; rate?: number }[] = [
  // Custom AX logo intro — 10s native, 16:9. Plays at natural speed
  // (rate 1.0) so the brand reveal lands cleanly; gets a 10s slot
  // before crossfading out to the cinematic Vienna footage.
  { src: '/hero/00-AXLOGOSHOT.mp4', duration: 10000, rate: 1.0 },
  { src: '/hero/01-stephansdom-dusk.mp4' },
  { src: '/hero/02-belvedere-golden.mp4' },
  { src: '/hero/06-hofburg-sunset.mp4' },
  { src: '/hero/03-ringstrasse-night.mp4' },
  { src: '/hero/04-donaukanal-twilight.mp4' },
]

// Still image shown by the WeChat in-app browser, slow connections, and
// any environment where the <video> element refuses to render. Lives
// at the same CDN so it loads alongside the markup.
const FALLBACK_POSTER = 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=2400&q=85&auto=format&fit=crop'

// Seedance clips are 5.06s native. We stretch to ~6.5s real time
// at 0.78× — a touch slower than natural, calmer than raw playback,
// without feeling like slow-mo replay.
const PLAYBACK_RATE     = 0.78
const SLIDE_DURATION_MS = 5000
const CROSSFADE_MS      = 1500
const PEAK_OPACITY      = 0.72

export function HeroVideoLoop() {
  const [index, setIndex] = React.useState(0)
  const [available, setAvailable] = React.useState<boolean[]>(() => SLIDES.map(() => true))
  const refs = React.useRef<(HTMLVideoElement | null)[]>([])
  const reduce = useReducedMotion()

  // Advance through the rotation. Use setTimeout (not setInterval) so
  // each slide can carry its own custom duration — the AX intro
  // (10s) needs more time than a 5s Seedance clip.
  React.useEffect(() => {
    if (reduce || SLIDES.length <= 1) return
    const duration = SLIDES[index]?.duration ?? SLIDE_DURATION_MS
    const id = window.setTimeout(() => {
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
    }, duration)
    return () => clearTimeout(id)
  }, [reduce, available, index])

  // On index change (and on mount):
  //  - rewind + play the incoming clip
  //  - after the crossfade settles, pause everyone else so only
  //    the visible clip is decoding.
  React.useEffect(() => {
    const incoming = refs.current[index]
    if (incoming) {
      try {
        incoming.currentTime = 0
        // Per-slide rate override (e.g. logo intro plays at natural
        // speed for clean brand reveal), else default to global rate.
        incoming.playbackRate = SLIDES[index]?.rate ?? PLAYBACK_RATE
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

  // The fallback poster should ONLY appear when no video can play.
  // Both poster and video at PEAK_OPACITY would alpha-blend together
  // and the poster would bleed through the video — the bug we just
  // fixed. Track "has any video successfully started" and hide the
  // poster once it does.
  const [anyVideoStarted, setAnyVideoStarted] = React.useState(false)
  // Re-render fallback if every slide errored
  const allFailed = available.every(v => !v)

  // Strategy: ALWAYS attempt video, even on WeChat. Modern WeChat
  // (iOS ≥ 8.0, Android TBS ≥ 045500) honours muted + playsinline +
  // x5-video-player-type when properly attributed. If a video fails
  // (play() rejects, decoder error, etc.), the existing onError +
  // available[] handling drops that slide and keeps cycling. If ALL
  // videos fail, the static poster underneath becomes visible again.

  return (
    <>
      {/* Static fallback poster — only painted on screen when no
          video has begun playing yet (initial cold-start frame) or
          when every video failed to load. */}
      <div
        aria-hidden
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: `url(${FALLBACK_POSTER})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: anyVideoStarted && !allFailed ? 0 : PEAK_OPACITY,
          transition: 'opacity 600ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      />
      {SLIDES.map((slide, i) => (
        <video
          key={slide.src}
          ref={(el) => { refs.current[i] = el }}
          src={slide.src}
          poster={FALLBACK_POSTER}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: available[i] && i === index ? PEAK_OPACITY : 0,
            transition: `opacity ${CROSSFADE_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
            willChange: 'opacity',
          }}
          muted
          playsInline
          // Tencent X5 / WeChat compat hints — harmless on other engines.
          // eslint-disable-next-line react/no-unknown-property
          x5-video-player-type="h5"
          // eslint-disable-next-line react/no-unknown-property
          x5-playsinline=""
          // eslint-disable-next-line react/no-unknown-property
          webkit-playsinline="true"
          preload="auto"
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore — valid HTML attribute
          disablePictureInPicture
          // Mount-time autoplay for slide 0. The effect above takes
          // over from there.
          autoPlay={i === 0}
          // Ensure slide 0 inherits the slowdown the first time it
          // loads. Subsequent loads are handled by the index effect.
          onLoadedMetadata={(e) => {
            if (i === 0) (e.currentTarget as HTMLVideoElement).playbackRate = PLAYBACK_RATE
          }}
          onPlaying={() => setAnyVideoStarted(true)}
          onError={() => {
            setAvailable(a => a.map((v, idx) => idx === i ? false : v))
          }}
        />
      ))}
    </>
  )
}
