import React from 'react'
import { useReducedMotion } from 'framer-motion'

/**
 * Single looping ambient video for use as a section background. Pairs
 * with a poster image so the layer is never empty on slow connections
 * or in browsers that block autoplay.
 *
 * Designed for SUBDUED treatments behind text — keep opacity low
 * (0.25–0.35) so foreground copy stays readable. The mp4 should be
 * 1080p or 720p, ≤ 5MB, looping nicely.
 *
 * Differs from HeroVideoLoop: that one rotates between multiple clips
 * for the cinematic hero. This one plays a single clip on loop, simple
 * and quiet.
 */
export function AmbientVideoBg({
  src,
  poster,
  opacity = 0.3,
  playbackRate = 0.8,
}: {
  src: string
  poster?: string
  opacity?: number
  playbackRate?: number
}) {
  const ref = React.useRef<HTMLVideoElement>(null)
  const reduce = useReducedMotion()

  // Apply the slow-mo rate once the element exists. Replays use the
  // same rate via `loop`.
  React.useEffect(() => {
    const v = ref.current
    if (!v || reduce) return
    const onMeta = () => { v.playbackRate = playbackRate }
    v.addEventListener('loadedmetadata', onMeta)
    if (v.readyState >= 1) onMeta()
    return () => v.removeEventListener('loadedmetadata', onMeta)
  }, [playbackRate, reduce])

  // Reduced motion: poster only, no video at all.
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

  return (
    <>
      {/* Poster underneath — visible if the video fails to load or
          before it starts decoding. */}
      {poster && (
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
      )}
      <video
        ref={ref}
        src={src}
        poster={poster}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{
          opacity,
          transition: 'opacity 600ms cubic-bezier(0.22, 1, 0.36, 1)',
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
      />
    </>
  )
}
