import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, useReducedMotion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, Gavel, Building2,
  TrendingUp, Shield, Globe, ChevronRight, Check,
  Database, Clock, Target, Home, Percent, MapPin, Gem,
} from 'lucide-react'
import { ButtonLink } from '../components/ui/Button'
import { ListingCard, type ListingCardData } from '../components/ui/ListingCard'
import { Reveal } from '../components/ui/Reveal'
import { HeroVideoLoop } from '../components/ui/HeroVideoLoop'
import { LogoConverge } from '../components/ui/LogoConverge'
import { CountUp } from '../components/ui/CountUp'

/* ─────────────────────────────────────────────
   BG Pattern — subtle dot grid, used sparingly per DESIGN.md
───────────────────────────────────────────── */
function BGPattern({
  size = 28,
  fill = 'rgba(255,255,255,0.04)',
}: { size?: number; fill?: string }) {
  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none z-0"
      style={{
        backgroundImage: `radial-gradient(${fill} 1px, transparent 1px)`,
        backgroundSize: `${size}px ${size}px`,
        WebkitMaskImage: 'radial-gradient(ellipse at center,#000 30%,transparent 80%)',
        maskImage: 'radial-gradient(ellipse at center,#000 30%,transparent 80%)',
      }}
    />
  )
}

/* ─────────────────────────────────────────────
   Auction-card helpers — sparkline, meta row, icon stat
───────────────────────────────────────────── */
function InsightSparkline() {
  // Decorative upward trend — synthetic, not data.
  const pts = '0,38 14,36 28,32 42,33 56,28 70,24 84,26 98,20 112,22 126,16 140,18 154,12 168,14 182,8 196,5'
  return (
    <svg viewBox="0 0 200 50" className="w-full h-full overflow-visible" preserveAspectRatio="none">
      <defs>
        <linearGradient id="auction-spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(212,175,55,0.35)" />
          <stop offset="100%" stopColor="rgba(212,175,55,0)" />
        </linearGradient>
      </defs>
      <polygon points={`0,50 ${pts} 200,50`} fill="url(#auction-spark-fill)" />
      <polyline points={pts} fill="none" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      {/* End-point dot with glow */}
      <circle cx="196" cy="5" r="3" fill="#d4af37" />
      <circle cx="196" cy="5" r="6" fill="none" stroke="rgba(212,175,55,0.4)" strokeWidth="1" />
    </svg>
  )
}

function InsightMetaRow({
  icon, label, value,
}: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-bg-base/60 border border-white/[0.05]">
      <div className="flex items-center gap-2 text-fg-secondary">
        <span className="text-gold inline-flex">{icon}</span>
        <span className="text-caption">{label}</span>
      </div>
      <span className="text-caption text-fg-primary font-medium">{value}</span>
    </div>
  )
}

function AuctionIconStat({
  icon, value, label,
}: { icon: React.ReactNode; value: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-gold shrink-0"
        style={{ border: '1px solid var(--gold-line)', background: 'var(--gold-tint)' }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-heading-md text-gold tabular leading-none">{value}</div>
        <div className="mt-1 text-caption text-fg-tertiary">{label}</div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Hero cinemagraph — multiple Vienna stills, slow Ken-Burns push,
   1.5s crossfade between slides. Cheap-but-cinematic alternative to
   shipping a real video file (200-400KB per still vs. multi-MB MP4).

   Swap any URL below to tweak the rotation. Photos must be served
   from a CORS-friendly CDN; Unsplash works out of the box.
───────────────────────────────────────────── */
// All five URLs verified live against images.unsplash.com.
const HERO_SLIDES = [
  // Stephansdom at sunset
  'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=2400&q=85&auto=format&fit=crop',
  // Vienna aerial at golden hour
  'https://images.unsplash.com/photo-1519923041107-e4dc8d9193da?w=2400&q=85&auto=format&fit=crop',
  // Karlskirche
  'https://images.unsplash.com/photo-1509358033937-2784de2bfed8?w=2400&q=85&auto=format&fit=crop',
  // Schönbrunn / classical palace
  'https://images.unsplash.com/photo-1573599852326-2d4da0bbe613?w=2400&q=85&auto=format&fit=crop',
  // Innere Stadt — horse carriage on cobbled street
  'https://images.unsplash.com/photo-1609856878074-cf31e21ccb6b?w=2400&q=85&auto=format&fit=crop',
]

function HeroCinemagraph() {
  const [index, setIndex] = React.useState(0)
  const reduce = useReducedMotion()

  React.useEffect(() => {
    if (reduce || HERO_SLIDES.length <= 1) return
    const id = window.setInterval(() => {
      if (document.hidden) return // pause while tab is hidden
      setIndex(i => (i + 1) % HERO_SLIDES.length)
    }, 9000)
    return () => clearInterval(id)
  }, [reduce])

  return (
    <>
      {HERO_SLIDES.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: i === index ? 0.55 : 0,
            transition: 'opacity 1600ms cubic-bezier(0.22, 1, 0.36, 1)',
            animation: reduce ? undefined : `heroKenBurns 32s ease-in-out infinite alternate`,
            animationDelay: `${-i * 8}s`, // offset each slide's KB phase for variety
            willChange: 'transform, opacity',
          }}
          loading={i === 0 ? 'eager' : 'lazy'}
          decoding="async"
          // @ts-ignore — valid HTML attribute
          fetchpriority={i === 0 ? 'high' : 'low'}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      ))}
    </>
  )
}

/* ─────────────────────────────────────────────
   Editorial city-street visual — static SVG with two crossed pattern
   grids (rotated), a radial fade mask, scattered glints, and a single
   centered glowing map pin. Replaces the older animated network canvas.
───────────────────────────────────────────── */
const MAP_GLINTS: { x: number; y: number; r: number; o: number }[] = [
  { x: 8,  y: 22, r: 1.1, o: 0.45 }, { x: 18, y: 38, r: 1.4, o: 0.7  },
  { x: 26, y: 14, r: 1.0, o: 0.35 }, { x: 34, y: 62, r: 1.3, o: 0.55 },
  { x: 42, y: 28, r: 1.1, o: 0.5  }, { x: 56, y: 18, r: 1.5, o: 0.75 },
  { x: 62, y: 48, r: 1.2, o: 0.6  }, { x: 70, y: 72, r: 1.1, o: 0.4  },
  { x: 78, y: 32, r: 1.3, o: 0.65 }, { x: 86, y: 58, r: 1.4, o: 0.55 },
  { x: 22, y: 78, r: 1.2, o: 0.45 }, { x: 50, y: 84, r: 1.1, o: 0.35 },
  { x: 14, y: 56, r: 1.0, o: 0.4  }, { x: 90, y: 14, r: 1.2, o: 0.5  },
]

function AuctionMapVisual() {
  return (
    <>
      {/* Underlying street-grid SVG */}
      <svg
        viewBox="0 0 800 320"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
        aria-hidden
      >
        <defs>
          {/* Pattern A — finer grid, rotated +22° */}
          <pattern
            id="auction-streets-a"
            x="0" y="0" width="42" height="42"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(22)"
          >
            <line x1="0" y1="0" x2="42" y2="0" stroke="rgba(212,175,55,0.18)" strokeWidth="0.6" />
            <line x1="0" y1="0" x2="0" y2="42" stroke="rgba(212,175,55,0.18)" strokeWidth="0.6" />
          </pattern>
          {/* Pattern B — broader arteries, rotated -18° */}
          <pattern
            id="auction-streets-b"
            x="0" y="0" width="110" height="110"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-18)"
          >
            <line x1="0" y1="0" x2="110" y2="0" stroke="rgba(212,175,55,0.32)" strokeWidth="0.9" />
            <line x1="0" y1="55" x2="110" y2="55" stroke="rgba(212,175,55,0.14)" strokeWidth="0.6" />
            <line x1="0" y1="0" x2="0" y2="110" stroke="rgba(212,175,55,0.22)" strokeWidth="0.8" />
          </pattern>
          {/* Soft radial fade — edges dissolve into card surface */}
          <radialGradient id="auction-map-fade" cx="50%" cy="50%" r="60%">
            <stop offset="0%"  stopColor="#fff" stopOpacity="1"   />
            <stop offset="55%" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0"  />
          </radialGradient>
          <mask id="auction-mask">
            <rect width="800" height="320" fill="url(#auction-map-fade)" />
          </mask>
        </defs>

        <rect width="800" height="320" fill="url(#auction-streets-a)" mask="url(#auction-mask)" />
        <rect width="800" height="320" fill="url(#auction-streets-b)" mask="url(#auction-mask)" />

        {/* Scattered glints at intersections */}
        {MAP_GLINTS.map((g, i) => (
          <circle
            key={i}
            cx={(g.x / 100) * 800}
            cy={(g.y / 100) * 320}
            r={g.r}
            fill="#d4af37"
            opacity={g.o}
          />
        ))}
      </svg>

      {/* Centered glowing map pin */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative" style={{ animation: 'heroFadeUp 0.7s var(--ease-emphasis) 0.2s both' }}>
          {/* Soft halo */}
          <span
            aria-hidden
            className="absolute top-1/2 left-1/2"
            style={{
              width: 96, height: 96, transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(circle, rgba(212,175,55,0.35) 0%, rgba(212,175,55,0.08) 50%, transparent 75%)',
              animation: 'pinHalo 2.6s ease-in-out infinite',
              borderRadius: '50%',
            }}
          />
          <MapPin
            size={40}
            strokeWidth={1.5}
            className="text-gold relative"
            style={{ filter: 'drop-shadow(0 0 10px rgba(212,175,55,0.9))' }}
          />
        </div>
      </div>
    </>
  )
}

/* ─────────────────────────────────────────────
   Animated city network canvas (legacy — kept in case we want it back)
───────────────────────────────────────────── */
function CityNetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height

    // Nodes — fixed positions like Vienna districts
    const nodes = [
      { x: 0.18, y: 0.35 }, { x: 0.30, y: 0.55 }, { x: 0.42, y: 0.28 },
      { x: 0.50, y: 0.50 }, { x: 0.58, y: 0.22 }, { x: 0.65, y: 0.65 },
      { x: 0.72, y: 0.38 }, { x: 0.80, y: 0.58 }, { x: 0.25, y: 0.72 },
      { x: 0.88, y: 0.32 }, { x: 0.55, y: 0.78 }, { x: 0.38, y: 0.45 },
    ].map((n, i) => ({
      x: n.x * W, y: n.y * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 2.5 + 2,
      phase: i * 0.7,
    }))

    let frame = 0
    let raf: number

    function draw() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, W, H)

      // Update node positions (gentle drift)
      nodes.forEach(n => {
        n.x += n.vx
        n.y += n.vy
        if (n.x < 20 || n.x > W - 20) n.vx *= -1
        if (n.y < 20 || n.y > H - 20) n.vy *= -1
      })

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 200) {
            const alpha = (1 - dist / 200) * 0.25
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.strokeStyle = `rgba(212,175,55,${alpha})`
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
        }
      }

      // Draw nodes with pulse
      nodes.forEach((n, i) => {
        const pulse = Math.sin(frame * 0.04 + n.phase) * 0.5 + 0.5

        // Outer glow ring
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r + 4 + pulse * 4, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(212,175,55,${0.08 + pulse * 0.12})`
        ctx.lineWidth = 1
        ctx.stroke()

        // Core dot
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(212,175,55,${0.6 + pulse * 0.4})`
        ctx.shadowColor = '#d4af37'
        ctx.shadowBlur = 8 + pulse * 8
        ctx.fill()
        ctx.shadowBlur = 0
      })

      // Watermark text
      ctx.font = `bold clamp(24px, 4vw, 52px) Helvetica`
      ctx.font = `bold ${Math.round(H * 0.18)}px Helvetica`
      ctx.fillStyle = 'rgba(212,175,55,0.06)'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('维也纳实时法拍信息汇总', W / 2, H / 2)

      frame++
      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    const stop = animate()
    window.addEventListener('resize', resize)
    return () => {
      stop?.()
      window.removeEventListener('resize', resize)
    }
  }, [animate])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}

/* ─────────────────────────────────────────────
   Featured listings — fetched live from Notion via /api/listings.
   We surface 3 sale + 0 rent, sorted by recency (newest IDs first).
───────────────────────────────────────────── */
/**
 * Featured listings — fetches the full pool once, then rotates 3 random
 * picks every 8 seconds. Prefer listings with multiple images so the
 * homepage feels image-rich.
 */
function useFeaturedListings() {
  const [pool, setPool] = useState<ListingCardData[]>([])
  const [current, setCurrent] = useState<ListingCardData[]>([])

  // Fetch the pool once
  useEffect(() => {
    fetch('/api/listings')
      .then(r => r.json())
      .then(data => {
        const all = (data.listings || []) as any[]
        const filtered = all.filter(l => l.coverImage && !l.forRent && (l.images?.length || 0) >= 3)
        // Fallback to anything with a cover image if filter is empty
        const usable = filtered.length >= 3 ? filtered : all.filter(l => l.coverImage)
        setPool(usable)
      })
      .catch(() => setPool([]))
  }, [])

  // Pick 3 random distinct items from the pool
  function pickThree(source: ListingCardData[]): ListingCardData[] {
    if (source.length <= 3) return source.slice(0, 3)
    const indices = new Set<number>()
    while (indices.size < 3) indices.add(Math.floor(Math.random() * source.length))
    return Array.from(indices).map(i => source[i])
  }

  // Initial pick when pool arrives
  useEffect(() => {
    if (pool.length > 0 && current.length === 0) setCurrent(pickThree(pool))
  }, [pool, current.length])

  // Auto-rotate every 8 seconds — only if there are enough listings to make
  // the rotation meaningful, and only when the tab is focused.
  useEffect(() => {
    if (pool.length <= 3) return
    let timer: number | undefined
    const tick = () => setCurrent(pickThree(pool))
    const start = () => { timer = window.setInterval(tick, 8000) }
    const stop  = () => { if (timer) { clearInterval(timer); timer = undefined } }
    if (!document.hidden) start()
    const onVis = () => (document.hidden ? stop() : start())
    document.addEventListener('visibilitychange', onVis)
    return () => {
      stop()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [pool])

  return current
}

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function HomePage() {
  const featured = useFeaturedListings()
  const [formSent, setFormSent] = useState(false)
  const [formLoading, setFormLoading] = useState(false)

  // ── Scroll-driven hero animation ─────────────────────────────────────────
  // As the user scrolls down through the first viewport (0 → 100vh), the
  // hero content fades out and translates upward at different speeds to
  // create a subtle parallax depth. Honors prefers-reduced-motion.
  const reduceMotion = useReducedMotion()
  const { scrollY } = useScroll()
  const heroOpacity   = useTransform(scrollY, [0, 380], reduceMotion ? [1, 1] : [1, 0])
  const badgeY        = useTransform(scrollY, [0, 380], reduceMotion ? [0, 0] : [0, -90])
  const titleY        = useTransform(scrollY, [0, 380], reduceMotion ? [0, 0] : [0, -60])
  const subtitleY     = useTransform(scrollY, [0, 380], reduceMotion ? [0, 0] : [0, -40])
  const ctaY          = useTransform(scrollY, [0, 380], reduceMotion ? [0, 0] : [0, -25])
  const statsY        = useTransform(scrollY, [0, 380], reduceMotion ? [0, 0] : [0, -15])
  const bgPatternY    = useTransform(scrollY, [0, 380], reduceMotion ? [0, 0] : [0, 50])

  const [formError, setFormError] = useState<string | null>(null)
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)
    setFormLoading(true)
    const form = e.currentTarget
    const fd = new FormData(form)
    const payload = {
      name:    fd.get('name')    || '',
      contact: fd.get('contact') || fd.get('phone') || '',
      email:   fd.get('email')   || '',
      message: fd.get('message') || '',
      source:  '首页咨询',
      _honeypot: fd.get('website') || '', // honeypot field
    }
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.ok) {
        setFormSent(true)
      } else {
        setFormError(data.error || '提交失败，请稍后重试')
      }
    } catch (_) {
      setFormError('网络错误，请稍后重试')
    }
    setFormLoading(false)
  }

  return (
    <div className="min-h-screen bg-bg-base text-fg-primary overflow-x-hidden">

      {/* ════════════ HERO ════════════ */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-16 px-4 sm:px-6 lg:px-10">

        {/* ── Background cinemagraph — rotating Vienna stills with Ken-Burns ── */}
        <motion.div
          className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
          style={{ y: bgPatternY }}
        >
          <HeroVideoLoop />
          {/* Top→bottom darkening so text stays readable */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(12,12,12,0.55) 0%, rgba(12,12,12,0.65) 35%, rgba(12,12,12,0.88) 75%, rgba(12,12,12,1) 100%)',
            }}
          />
          {/* Side / center vignette to focus on the headline */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 70% 55% at 50% 45%, transparent 0%, rgba(12,12,12,0.55) 100%)',
            }}
          />
        </motion.div>

        {/* Subtle gold dots over the image — keeps the editorial texture */}
        <motion.div className="absolute inset-0 z-[1] pointer-events-none" style={{ y: bgPatternY }}>
          <BGPattern size={36} fill="rgba(212,175,55,0.04)" />
        </motion.div>

        {/* Hero content fades + parallax-translates as user scrolls */}
        <motion.div
          className="relative z-10 w-full max-w-content mx-auto py-24 text-center"
          style={{ opacity: heroOpacity }}
        >
          {/* AX logomark — A and X letterforms converge into the logo */}
          <motion.div className="hero-fade-1 mb-8 flex justify-center" style={{ y: badgeY }}>
            <LogoConverge height={112} />
          </motion.div>

          {/* Display headline */}
          <motion.h1
            className="hero-fade-2 font-serif mb-6 mx-auto"
            style={{
              color: 'var(--fg-display)',
              fontSize: 'clamp(40px, 7vw, 72px)',
              lineHeight: 1.05,
              letterSpacing: '-0.025em',
              fontWeight: 600,
              maxWidth: '14ch',
              y: titleY,
            }}
          >
            维也纳房产，<br/>
            <span className="text-gold">中文一站式</span>服务
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="hero-fade-3 mt-6 mb-12 max-w-2xl mx-auto text-body-lg"
            style={{ color: 'var(--fg-secondary)', y: subtitleY }}
          >
            维也纳买房 · 真实房源 · 自住投资 · 司法拍卖<br className="hidden sm:block" />
            从看房到过户，全程中文陪伴。
          </motion.p>

          {/* CTAs */}
          <motion.div className="hero-fade-4 flex flex-col sm:flex-row gap-3 justify-center" style={{ y: ctaY }}>
            <ButtonLink
              to="/listings"
              variant="primary"
              size="lg"
              trailingIcon={<ArrowRight size={15} strokeWidth={1.75} />}
            >
              浏览精选房源
            </ButtonLink>
            <ButtonLink
              to="/auction"
              variant="ghost"
              size="lg"
              leadingIcon={<Gavel size={15} strokeWidth={1.75} />}
            >
              法拍房信息汇总
            </ButtonLink>
          </motion.div>

          {/* Quiet stat strip */}
          <motion.div
            className="hero-fade-5 mt-16 grid grid-cols-3 max-w-md mx-auto text-center gap-4"
            style={{ y: statsY }}
          >
            <div>
              <div className="text-heading-lg text-gold">
                <CountUp value={200} suffix="+" duration={1400} />
              </div>
              <div className="mt-1 text-caption text-fg-tertiary">在售房源</div>
            </div>
            <div>
              <div className="text-heading-lg text-gold">
                <CountUp value={60} suffix="+" duration={1400} />
              </div>
              <div className="mt-1 text-caption text-fg-tertiary">法拍房源</div>
            </div>
            <div>
              <div className="text-heading-lg text-gold tabular">1–23</div>
              <div className="mt-1 text-caption text-fg-tertiary">全维也纳</div>
            </div>
          </motion.div>

        </motion.div>

        {/*
          Scroll hint.

          ⚠️  Architecture note: the CSS class .hero-fade-* animates
          `transform: translateY(20px → 0)`, which OVERRIDES the
          Tailwind utility `-translate-x-1/2` (centering). If you put
          the class on the same element that needs horizontal centering,
          the element will visibly jolt sideways the moment the
          animation begins. Solution: split into two elements —
          outer handles positioning, inner handles the entrance.
        */}
        <motion.div
          className="absolute left-1/2 z-20"
          style={{
            bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
            transform: 'translateX(-50%)', // centering — must NOT be animated
            opacity: heroOpacity,
          }}
        >
          <motion.div
            className="flex flex-col items-center gap-2"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Text label hidden on mobile where vertical space is tight */}
            <span className="hidden sm:inline text-overline uppercase text-fg-secondary tracking-[0.3em]">
              向下滚动
            </span>
            <div
              className="relative w-px h-8 sm:h-12 overflow-hidden"
              style={{ background: 'rgba(212,175,55,0.22)' }}
            >
              <span
                className="scroll-trail absolute left-1/2 w-1.5 h-3 rounded-full"
                style={{
                  background: '#d4af37',
                  boxShadow: '0 0 10px rgba(212,175,55,0.85), 0 0 4px rgba(212,175,55,1)',
                  transform: 'translateX(-50%)',
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ════════════ FEATURED LISTINGS — real data ════════════ */}
      <section className="py-20 sm:py-28 lg:py-32 bg-bg-elev-1 px-4 sm:px-6 lg:px-10">
        <div className="max-w-content mx-auto">
          <Reveal>
            <div className="mb-12 flex items-end justify-between gap-6">
              <div>
                <p className="text-overline text-gold/80 mb-2 uppercase">Featured</p>
                <h2 className="font-serif text-display-lg sm:text-display-xl text-fg-primary">
                  近期推荐
                </h2>
              </div>
              <Link
                to="/listings"
                className="hidden sm:inline-flex items-center gap-1 text-body text-fg-secondary hover:text-gold transition-colors duration-base ease-standard group"
              >
                查看全部 <ChevronRight size={14} strokeWidth={1.75} className="transition-transform duration-base ease-standard group-hover:translate-x-0.5" />
              </Link>
            </div>
          </Reveal>

          {featured.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <AnimatePresence mode="popLayout" initial={false}>
                {featured.map((l) => (
                  <motion.div
                    key={l.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <ListingCard listing={l} variant="compact" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[0, 1, 2].map(i => (
                <div key={i} className="rounded-xl bg-bg-elev-2 border border-white/[0.06]" style={{ aspectRatio: '3 / 4' }} />
              ))}
            </div>
          )}

          <div className="mt-10 sm:hidden text-center">
            <Link to="/listings" className="inline-flex items-center gap-1 text-body text-gold">
              查看全部房源 <ChevronRight size={14} strokeWidth={1.75} />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════ 独家工具 — 法拍房 ════════════ */}
      <section className="py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-10 bg-bg-base">
        <div className="max-w-content mx-auto">
          <Reveal>
            <div className="mb-12 max-w-prose">
              <p className="text-overline text-gold/80 mb-3 uppercase">Exclusive Tool</p>
              <h2 className="font-serif text-display-lg sm:text-display-xl text-fg-primary tracking-tight">
                法拍房信息汇总
              </h2>
              <p className="mt-4 text-body-lg text-fg-secondary">
                自主研发系统实时抓取 Ediktsdatei 数据，地图可视化全维也纳 60+ 在拍房源。
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div
              className="rounded-2xl overflow-hidden bg-bg-elev-1"
              style={{
                border: '1px solid var(--gold-line)',
                boxShadow: '0 0 0 1px rgba(0,0,0,0.4), 0 30px 80px -30px rgba(212,175,55,0.08)',
              }}
            >
              {/* ── 3-column composition: caption | map | insights ─────────── */}
              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)_minmax(0,300px)]">

                {/* Left: caption */}
                <div className="p-7 sm:p-8 lg:border-r border-white/[0.06] flex flex-col justify-center">
                  <h3 className="font-serif text-heading-xl text-gold leading-tight">
                    维也纳实时<br/>法拍信息汇总
                  </h3>
                  <div
                    aria-hidden
                    className="mt-4 mb-5 w-2 h-2 rotate-45"
                    style={{ background: '#d4af37', boxShadow: '0 0 12px rgba(212,175,55,0.7)' }}
                  />
                  <p className="text-body text-fg-secondary leading-relaxed">
                    数据实时更新 · 覆盖全维也纳<br/>
                    精准洞察每一次投资机会
                  </p>
                </div>

                {/* Center: editorial street-grid visual with single centered pin */}
                <div className="relative h-72 lg:h-auto min-h-[260px] overflow-hidden bg-bg-base lg:border-r border-white/[0.06]">
                  <AuctionMapVisual />
                </div>

                {/* Right: real-time insights */}
                <div className="p-6 sm:p-7 flex flex-col gap-4 justify-center border-t lg:border-t-0 border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={14} strokeWidth={1.75} className="text-gold" />
                    <span className="text-caption uppercase tracking-[0.18em] text-fg-secondary">实时洞察</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <InsightMetaRow icon={<Database size={12} strokeWidth={2} />} label="数据源"   value="Ediktsdatei" />
                    <InsightMetaRow icon={<Clock    size={12} strokeWidth={2} />} label="更新频率" value="实时更新" />
                    <InsightMetaRow icon={<Target   size={12} strokeWidth={2} />} label="覆盖范围" value="全维也纳" />
                  </div>
                </div>
              </div>

              {/* ── Bottom row: icon stats + CTA ────────────────────────────── */}
              {/* Mobile: stats grid full-width, CTA on a second row,
                  right-aligned via self-end so the right-handed thumb
                  can reach it. Desktop: row layout, CTA at the far right. */}
              <div
                className="border-t border-white/[0.06] p-6 sm:p-7 flex flex-col lg:flex-row items-stretch lg:items-center gap-5 lg:gap-6"
                style={{ background: 'rgba(12,12,12,0.4)' }}
              >
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-5 w-full">
                  <AuctionIconStat
                    icon={<Home size={16} strokeWidth={1.75} />}
                    value={<CountUp value={60} suffix="+" duration={1400} />}
                    label="在拍房源"
                  />
                  <AuctionIconStat
                    icon={<Percent size={16} strokeWidth={1.75} />}
                    value={<CountUp value={50} suffix="%" duration={1400} />}
                    label="最低起拍"
                  />
                  <AuctionIconStat
                    icon={<MapPin size={16} strokeWidth={1.75} />}
                    value={<>1–23<span className="text-caption ml-0.5">区</span></>}
                    label="全维也纳"
                  />
                  <AuctionIconStat
                    icon={<Gem size={16} strokeWidth={1.75} />}
                    value={<>免费</>}
                    label="无需注册"
                  />
                </div>
                <div className="self-end lg:self-auto">
                  <ButtonLink
                    to="/auction"
                    variant="primary"
                    size="md"
                    trailingIcon={<ArrowRight size={13} strokeWidth={1.75} />}
                  >
                    进入看板
                  </ButtonLink>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════ WHY VIENNA ════════════ */}
      <section className="py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-10 bg-bg-elev-1 border-y border-white/[0.06]">
        <div className="max-w-content mx-auto">
          <Reveal>
            <div className="mb-12 max-w-prose">
              <p className="text-overline text-gold/80 mb-3 uppercase">Market</p>
              <h2 className="font-serif text-display-lg text-fg-primary tracking-tight">
                为什么选择维也纳
              </h2>
            </div>
          </Reveal>
          <div className="grid sm:grid-cols-3 gap-px bg-white/[0.06] rounded-2xl overflow-hidden">
            {[
              { icon: <TrendingUp size={17} strokeWidth={1.5} />, title: '价格仍具优势', desc: '对比伦敦、巴黎、慕尼黑，维也纳每平方米单价显著偏低，中长期增值潜力突出。' },
              { icon: <Shield     size={17} strokeWidth={1.5} />, title: '法律框架透明', desc: '奥地利产权保护健全，购房程序规范；非 EU 买家须额外审批，各州政策有所不同。' },
              { icon: <Globe      size={17} strokeWidth={1.5} />, title: '欧盟核心城市', desc: '申根区核心，生活质量连续多年全球第一，是华人移居欧洲的热门目的地之一。' },
            ].map(({ icon, title, desc }, i) => (
              <Reveal key={title} delay={100 + i * 100}>
                <div className="p-7 bg-bg-base h-full group">
                  <div className="w-9 h-9 flex items-center justify-center rounded-md mb-5 bg-gold-tint border border-gold-line text-gold transition-transform duration-base ease-standard group-hover:scale-105">
                    {icon}
                  </div>
                  <h3 className="text-heading-md text-fg-primary mb-2">{title}</h3>
                  <p className="text-body text-fg-secondary">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ FOR OWNERS (Sell / Rent) ════════════ */}
      <section className="py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-10 bg-bg-base">
        <Reveal>
        <div className="max-w-content mx-auto rounded-2xl p-8 sm:p-12 lg:p-14 bg-bg-elev-1 border border-white/[0.06]">
            <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-3">
                <p className="text-overline text-gold/80 mb-3 uppercase">For Property Owners</p>
                <h2 className="font-serif text-display-lg sm:text-display-xl text-fg-primary mb-5 tracking-tight">
                  您的房产，<br className="sm:hidden" />
                  <span className="text-gold block sm:inline text-right sm:text-left">双向触达</span>
                </h2>
                <p className="text-body-lg text-fg-secondary mb-7 max-w-prose">
                  我们同时覆盖中文圈层（小红书、微信）与维也纳本地市场（justimmo、willhaben 等主流平台）。
                  您的房产将精准触达<strong className="text-fg-primary">华人买家与奥地利本地客户</strong>，最大化曝光与成交效率。
                </p>

                {/* Bullets */}
                <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5 mb-8">
                  {[
                    '免费市场评估',
                    '专业摄影 / 视频',
                    '中文圈层推广（小红书 / 微信）',
                    '本地市场曝光（justimmo / willhaben）',
                    '陪同看房与谈判',
                    '中德文合同支持',
                  ].map(b => (
                    <li key={b} className="flex items-center gap-2.5 text-body text-fg-secondary">
                      <Check size={14} strokeWidth={2} className="text-gold flex-shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col sm:flex-row gap-3">
                  <ButtonLink
                    to="/list-property?mode=sale"
                    variant="primary"
                    size="md"
                    trailingIcon={<ArrowRight size={15} strokeWidth={1.75} />}
                  >
                    我要出售房产
                  </ButtonLink>
                  <ButtonLink
                    to="/list-property?mode=rent"
                    variant="ghost"
                    size="md"
                    trailingIcon={<ArrowRight size={15} strokeWidth={1.75} />}
                  >
                    我要出租房产
                  </ButtonLink>
                </div>
              </div>

              {/* Visual stat block */}
              <div className="lg:col-span-2 grid grid-cols-2 gap-3">
                {[
                  { num: '24h',  label: '快速响应' },
                  { num: '100%', label: '中文服务' },
                  { num: '0',    label: '前期费用' },
                  { num: '一站', label: '全流程'   },
                ].map((s, i) => (
                  <Reveal key={s.label} delay={150 + i * 70}>
                    <div className="rounded-xl p-5 text-center bg-bg-base border border-white/[0.06] transition-[border-color,transform] duration-base ease-standard hover:border-gold-line hover:-translate-y-0.5">
                      <p className="font-serif text-heading-xl text-gold mb-1 tabular">{s.num}</p>
                      <p className="text-overline text-fg-tertiary uppercase">{s.label}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
        </div>
        </Reveal>
      </section>

      {/* ════════════ CONTACT FORM ════════════ */}
      <section className="py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-10 bg-bg-elev-1 border-t border-white/[0.06]">
        <div className="max-w-prose mx-auto">
          <Reveal>
            <div className="mb-10">
              <p className="text-overline text-gold/80 mb-3 uppercase">Contact</p>
              <h2 className="font-serif text-display-lg sm:text-display-xl text-fg-primary tracking-tight">
                开始您的置业之旅
              </h2>
              <p className="mt-4 text-body-lg text-fg-secondary">
                我们将在 24 小时内与您联系。
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
          <div className="rounded-2xl p-7 sm:p-8 bg-bg-base border border-white/[0.06]">
            {formSent ? (
              <div className="text-center py-12">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 bg-gold-tint border border-gold-line">
                  <Check size={24} strokeWidth={1.75} className="text-gold" />
                </div>
                <h3 className="text-heading-lg text-fg-primary mb-2">提交成功</h3>
                <p className="text-body text-fg-secondary">我们会尽快与您联系。</p>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                {/* honeypot for bots */}
                <input type="text" name="website" tabIndex={-1} autoComplete="off"
                  style={{ position: 'absolute', left: '-9999px', width: 1, height: 1 }} />

                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { label: '姓名',         name: 'name',    type: 'text', placeholder: '您的姓名'    },
                    { label: '电话 / 微信',  name: 'contact', type: 'tel',  placeholder: '电话或微信号' },
                  ].map(({ label, name, type, placeholder }) => (
                    <div key={name}>
                      <label className="block text-overline text-fg-tertiary mb-2 uppercase">{label}</label>
                      <input
                        type={type}
                        name={name}
                        placeholder={placeholder}
                        required
                        className="w-full rounded-md px-4 py-3 text-body text-fg-primary placeholder:text-fg-disabled bg-bg-elev-2 border border-white/[0.08] outline-none transition-[border-color] duration-base ease-standard focus:border-gold-line"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-overline text-fg-tertiary mb-2 uppercase">邮箱</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    required
                    className="w-full rounded-md px-4 py-3 text-body text-fg-primary placeholder:text-fg-disabled bg-bg-elev-2 border border-white/[0.08] outline-none transition-[border-color] duration-base ease-standard focus:border-gold-line"
                  />
                </div>

                <div>
                  <label className="block text-overline text-fg-tertiary mb-2 uppercase">留言</label>
                  <textarea
                    rows={4}
                    name="message"
                    placeholder="您的置业需求 — 区域、预算、自住或投资等"
                    required
                    className="w-full rounded-md px-4 py-3 text-body text-fg-primary placeholder:text-fg-disabled bg-bg-elev-2 border border-white/[0.08] outline-none resize-none transition-[border-color] duration-base ease-standard focus:border-gold-line"
                  />
                </div>

                {formError && (
                  <div className="text-caption text-danger px-4 py-2.5 rounded-md border border-danger/30" style={{ background: 'rgba(248,113,113,0.08)' }}>
                    {formError}
                  </div>
                )}

                <button type="submit" disabled={formLoading}
                  className={[
                    'w-full py-3.5 rounded-lg text-body-lg font-semibold',
                    'flex items-center justify-center gap-2',
                    'transition-[background,opacity,transform] duration-base ease-standard',
                    'active:scale-[0.98]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base',
                    formLoading
                      ? 'bg-gold/40 text-bg-base cursor-not-allowed active:scale-100'
                      : 'bg-gold text-bg-base hover:bg-gold-hover',
                  ].join(' ')}>
                  {formLoading ? '发送中…' : <>提交咨询 <ArrowRight size={16} strokeWidth={1.75} /></>}
                </button>

                <p className="text-center text-caption text-fg-tertiary pt-1">
                  或在小红书搜索「奥匈置业研究所 | CH」直接私信
                </p>
              </form>
            )}
          </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════ PARTNERS MARQUEE ════════════ */}
      <section className="overflow-hidden border-t border-white/[0.06] bg-bg-base py-14">
        <style>{`
          @keyframes marqueeScroll {
            from { transform: translateX(0); }
            to   { transform: translateX(-50%); }
          }
          .marquee-track {
            display: flex;
            align-items: center;
            width: max-content;
            animation: marqueeScroll 48s linear infinite;
          }
          .marquee-track:hover { animation-play-state: paused; }
          .p-logo {
            color: var(--fg-tertiary);
            transition: color 0.3s var(--ease-standard);
            cursor: default;
            user-select: none;
            flex-shrink: 0;
            font-family: 'Inter', -apple-system, system-ui, sans-serif;
            font-weight: 600;
            font-size: 14px;
            letter-spacing: 0.22em;
            text-transform: uppercase;
          }
          .p-logo:hover { color: var(--fg-primary); }
        `}</style>

        <p className="text-center text-overline text-fg-tertiary mb-8 uppercase">
          合作伙伴
        </p>

        <div style={{
          maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
        }}>
          <div className="marquee-track">
            {[0, 1].map(copy => (
              <div key={copy} className="flex items-center" style={{ gap: '0 64px', paddingRight: '64px' }}>
                {[
                  'YELLOWBIRD', 'GLORIT', 'VALERTO', 'STOLZ',
                  'LAGEEINS', 'LANDAA', 'PRIMA', 'KORN12',
                  'WINEGG', 'HARING', 'BOOMLIVING',
                ].map((name) => (
                  <React.Fragment key={`${copy}-${name}`}>
                    <span className="p-logo">{name}</span>
                    {/* Always render divider — including after the last
                        logo — so the wrap-around between the two
                        copies also gets a separator. */}
                    <div className="flex-shrink-0 w-px h-3 bg-white/[0.08]" />
                  </React.Fragment>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ FOOTER ════════════ */}
      <footer className="px-4 sm:px-6 lg:px-10 pt-10 pb-8 bg-bg-base border-t border-white/[0.06]">
        <div className="max-w-content mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
            <div className="inline-flex items-center gap-2 text-body font-semibold text-gold">
              <img
                src="/logo.png"
                alt=""
                className="h-8 w-auto"
                style={{ filter: 'brightness(0) saturate(100%) invert(72%) sepia(50%) saturate(615%) hue-rotate(2deg) brightness(91%) contrast(86%)' }}
              />
              <span>奥匈置业研究所</span>
            </div>
            <p className="text-caption text-fg-tertiary text-center">
              © 2025 Yellowbird Immobilienmakler GmbH · Wien, Austria
            </p>
            <Link
              to="/about"
              className="text-caption text-fg-secondary hover:text-gold transition-colors duration-base ease-standard"
            >
              联系我们 →
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-5 text-caption">
            {[
              { to: '/impressum',   label: 'Impressum' },
              { to: '/datenschutz', label: '隐私政策 / Datenschutz' },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="text-fg-tertiary hover:text-gold transition-colors duration-base ease-standard"
              >
                {label}
              </Link>
            ))}
            <span className="text-fg-disabled hidden sm:inline">·</span>
            <span className="text-fg-tertiary">
              数据来源：Ediktsdatei.justiz.gv.at
            </span>
            <span className="text-fg-disabled hidden sm:inline">·</span>
            <span className="text-fg-tertiary">
              © Justimmo
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
