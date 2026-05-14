import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  MapPin, ArrowRight, Gavel, Building2, MessageCircle,
  TrendingUp, Shield, Globe, ChevronRight, Check,
  Home, Maximize2,
} from 'lucide-react'

/* ─────────────────────────────────────────────
   BG Pattern
───────────────────────────────────────────── */
function BGPattern({
  variant = 'dots',
  mask = 'none',
  size = 28,
  fill = 'rgba(255,255,255,0.04)',
}: {
  variant?: 'dots' | 'grid'
  mask?: 'fade-edges' | 'none'
  size?: number
  fill?: string
}) {
  const img =
    variant === 'dots'
      ? `radial-gradient(${fill} 1px, transparent 1px)`
      : `linear-gradient(to right,${fill} 1px,transparent 1px),linear-gradient(to bottom,${fill} 1px,transparent 1px)`
  const maskVal =
    mask === 'fade-edges'
      ? 'radial-gradient(ellipse at center,#000 30%,transparent 80%)'
      : 'none'
  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none z-0"
      style={{ backgroundImage: img, backgroundSize: `${size}px ${size}px`, WebkitMaskImage: maskVal, maskImage: maskVal }}
    />
  )
}

/* ─────────────────────────────────────────────
   Animated city network canvas
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
   Featured property card (glassmorphism)
───────────────────────────────────────────── */
interface PropCard {
  image: string; title: string; location: string
  price: string; area: string; rooms: string; tag: string
}
function PropertyCard({ image, title, location, price, area, rooms, tag }: PropCard) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, borderColor: 'rgba(212,175,55,0.45)' }}
      className="group relative overflow-hidden rounded-2xl transition-all duration-400"
      style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(18px)', border: '1px solid rgba(212,175,55,0.18)' }}
    >
      <div className="relative h-56 overflow-hidden">
        <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(to top,#141414 0%,transparent 55%)' }} />
        <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <span className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-full text-[11px] font-bold" style={{ background: '#d4af37', color: '#141414' }}>
          {tag}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-white text-sm mb-1 line-clamp-1">{title}</h3>
        <div className="flex items-center gap-1 text-[11px] mb-3" style={{ color: 'rgba(255,255,255,0.38)' }}>
          <MapPin size={10} />{location}
        </div>
        <div className="flex items-center gap-3 text-[11px] mb-4" style={{ color: 'rgba(255,255,255,0.45)' }}>
          <span className="flex items-center gap-1"><Maximize2 size={10} />{area}</span>
          <span className="w-px h-3 bg-white/10" />
          <span className="flex items-center gap-1"><Home size={10} />{rooms}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold" style={{ color: '#d4af37' }}>{price}</span>
          <button
            className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
            style={{ background: 'rgba(212,175,55,0.1)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.2)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,175,55,0.2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(212,175,55,0.1)')}
          >
            查看详情
          </button>
        </div>
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   Data
───────────────────────────────────────────── */
const FEATURED: PropCard[] = [
  {
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    title: '19区别墅式公寓', location: '1190 Wien, Döbling',
    price: '€ 850.000', area: '120 m²', rooms: '4 间', tag: '精选推荐',
  },
  {
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    title: '1区历史建筑改造', location: '1010 Wien, Innere Stadt',
    price: '€ 1.200.000', area: '95 m²', rooms: '3 间', tag: '投资优选',
  },
  {
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
    title: '22区新建住宅', location: '1220 Wien, Donaustadt',
    price: '€ 420.000', area: '78 m²', rooms: '3 间', tag: '首次购房',
  },
]

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function HomePage() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const [formSent, setFormSent] = useState(false)
  const [formLoading, setFormLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormLoading(true)
    const form = e.currentTarget
    const data = new FormData(form)
    try {
      const res = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      })
      if (res.ok) { setFormSent(true) }
    } catch (_) {}
    setFormLoading(false)
  }

  useEffect(() => {
    const mv = (e: MouseEvent) => setMouse({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', mv)
    return () => window.removeEventListener('mousemove', mv)
  }, [])

  return (
    <div className="min-h-screen bg-[#141414] text-white overflow-x-hidden">

      {/* ════════════ HERO ════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <BGPattern variant="dots" mask="fade-edges" size={32} fill="rgba(212,175,55,0.09)" />

        {/* Mouse glow — follows cursor */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(700px circle at ${mouse.x}px ${mouse.y}px,rgba(212,175,55,0.07),transparent 40%)` }} />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-20 text-center">

          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}
            className="flex justify-center mb-7">
            <div className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium"
              style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)', color: '#d4af37' }}>
              <Building2 size={13} />
              维也纳房产经纪人
            </div>
          </motion.div>

          {/* Headline with continuous slow gold caress (text always visible) */}
          <style>{`
            @keyframes goldCaress {
              0%   { background-position: 100% 50%; }
              100% { background-position: 0%   50%; }
            }
            .gold-shimmer-title {
              background: linear-gradient(
                105deg,
                #d4af37 0%,
                #d4af37 35%,
                #d8b842 40%,
                #e3c560 44%,
                #ecd281 47%,
                #f5e8a8 49%,
                #fff8d6 50%,
                #f5e8a8 51%,
                #ecd281 53%,
                #e3c560 56%,
                #d8b842 60%,
                #d4af37 65%,
                #d4af37 100%
              );
              background-size: 300% 100%;
              background-repeat: no-repeat;
              -webkit-background-clip: text;
              background-clip: text;
              -webkit-text-fill-color: transparent;
              color: transparent;
              animation: goldCaress 18s linear infinite;
              filter: drop-shadow(0 0 18px rgba(212,175,55,0.12));
            }
          `}</style>
          <motion.h1
            initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="font-bold tracking-tight mb-5 gold-shimmer-title"
            style={{ fontSize: 'clamp(44px, 8vw, 96px)', lineHeight: 1.04 }}
          >
            奥匈置业研究所
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.22 }}
            className="text-base sm:text-lg mb-10 max-w-xl mx-auto leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.46)' }}
          >
            专注维也纳房产投资、自住、选址避坑<br className="hidden sm:block" />
            华人专属中文支持，一条龙服务
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.36 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link to="/listings"
              className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-semibold text-base transition-colors duration-200"
              style={{ background: '#d4af37', color: '#141414' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#e0bc4a')}
              onMouseLeave={e => (e.currentTarget.style.background = '#d4af37')}
            >
              浏览精选房源
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/auction"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-semibold text-base transition-all duration-200"
              style={{ border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.72)', background: 'rgba(255,255,255,0.04)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
            >
              <Gavel size={15} />
              法拍房信息汇总
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ════════════ FEATURED LISTINGS ════════════ */}
      <section className="py-24 relative overflow-hidden" style={{ background: '#0f0f0f' }}>
        <BGPattern variant="grid" mask="fade-edges" size={40} fill="rgba(212,175,55,0.04)" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-10">
          <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.55 }} className="mb-10">
            <p className="text-[11px] tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(212,175,55,0.65)' }}>精选房源</p>
            <div className="flex items-end justify-between">
              <h2 className="text-4xl sm:text-5xl font-bold text-white">近期推荐</h2>
              <Link to="/listings"
                className="hidden sm:flex items-center gap-1 text-sm transition-colors"
                style={{ color: 'rgba(255,255,255,0.38)' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#d4af37')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.38)')}
              >
                查看全部 <ChevronRight size={13} />
              </Link>
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURED.map((p, i) => (
              <motion.div key={i} transition={{ delay: i * 0.07 }}>
                <PropertyCard {...p} />
              </motion.div>
            ))}
          </div>

          <div className="mt-7 sm:hidden text-center">
            <Link to="/listings" className="inline-flex items-center gap-1 text-sm" style={{ color: 'rgba(212,175,55,0.75)' }}>
              查看全部房源 <ChevronRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════ 独家工具 — 法拍房 ════════════ */}
      <section className="py-24 relative overflow-hidden" style={{ background: '#141414' }}>
        <BGPattern variant="dots" mask="fade-edges" size={28} fill="rgba(212,175,55,0.06)" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-10">
          <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.55 }} className="text-center mb-12">
            <p className="text-[11px] tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(212,175,55,0.65)' }}>独家工具</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-3">法拍房信息汇总</h2>
            <p className="text-base max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.4)' }}>
              自主研发系统，实时抓取 Ediktsdatei 数据，地图可视化全维也纳 60+ 在拍房源
            </p>
          </motion.div>

          {/* Big feature card */}
          <motion.div
            initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-3xl overflow-hidden"
            style={{ border: '1px solid rgba(212,175,55,0.2)', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)' }}
          >
            {/* Animated city network canvas */}
            <div className="relative h-72 overflow-hidden" style={{ background: '#0a0a0a' }}>
              <CityNetworkCanvas />
              <div className="absolute bottom-0 left-0 right-0 h-16"
                style={{ background: 'linear-gradient(to top,rgba(10,10,10,0.98),transparent)' }} />
            </div>

            {/* Stats + CTA */}
            <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { v: '60+', l: '在拍房源' }, { v: '50%', l: '最低起拍' },
                  { v: '1–23区', l: '全维也纳' }, { v: '免费', l: '无需注册' },
                ].map(({ v, l }) => (
                  <div key={l}>
                    <div className="text-lg font-bold" style={{ color: '#d4af37' }}>{v}</div>
                    <div className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>{l}</div>
                  </div>
                ))}
              </div>
              <Link to="/auction"
                className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
                style={{ background: '#d4af37', color: '#141414' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#e0bc4a')}
                onMouseLeave={e => (e.currentTarget.style.background = '#d4af37')}
              >
                <Gavel size={14} />
                进入看板
                <ArrowRight size={13} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════ WHY VIENNA ════════════ */}
      <section className="py-20 relative overflow-hidden" style={{ background: '#0f0f0f' }}>
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-10">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-10">
            <p className="text-[11px] tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(212,175,55,0.65)' }}>市场洞察</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">为什么选择维也纳？</h2>
          </motion.div>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { icon: <TrendingUp size={17} />, title: '价格仍具优势', desc: '对比伦敦、巴黎、慕尼黑，维也纳每平方米单价显著偏低，中长期增值潜力突出。' },
              { icon: <Shield size={17} />, title: '法律框架透明', desc: '奥地利产权保护健全，购房程序规范；非EU买家须额外审批，各州政策有所不同。' },
              { icon: <Globe size={17} />, title: '欧盟核心城市', desc: '申根区核心，生活质量连续多年全球第一，是华人移居欧洲的热门目的地之一。' },
            ].map(({ icon, title, desc }, i) => (
              <motion.div key={title}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex gap-4 p-5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-full mt-0.5"
                  style={{ background: 'rgba(212,175,55,0.1)', color: '#d4af37' }}>
                  {icon}
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm mb-1">{title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ FOR OWNERS (Sell / Rent) ════════════ */}
      <section className="py-20 relative overflow-hidden" style={{ background: '#0a0a0a' }}>
        <BGPattern variant="grid" mask="fade-edges" size={48} fill="rgba(212,175,55,0.05)" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="rounded-3xl p-8 sm:p-12 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(255,255,255,0.02) 100%)',
              border: '1px solid rgba(212,175,55,0.22)',
            }}
          >
            <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.18) 0%, transparent 70%)' }} />

            <div className="relative grid lg:grid-cols-5 gap-8 items-center">
              <div className="lg:col-span-3">
                <p className="text-[11px] tracking-[0.25em] uppercase mb-3" style={{ color: 'rgba(212,175,55,0.85)' }}>
                  For Property Owners · 业主委托
                </p>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight leading-tight">
                  您的房产，<br className="sm:hidden" />我们的中文渠道
                </h2>
                <p className="text-base leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  在维也纳或奥地利拥有房产并计划<strong className="text-white">出售或出租</strong>？
                  我们提供专业市场评估、定价建议、房源包装、中文客户推广、看房安排，以及交易和过户全程协助。
                </p>

                {/* Bullets */}
                <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 mb-7 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {[
                    '免费市场评估',
                    '专业摄影 / 视频',
                    '小红书 + 微信推广',
                    '陪同看房与谈判',
                    '中文合同解读',
                    '过户与税务协助',
                  ].map(b => (
                    <li key={b} className="flex items-center gap-2">
                      <Check size={14} style={{ color: '#d4af37', flexShrink: 0 }} />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/list-property?mode=sale"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all"
                    style={{ background: '#d4af37', color: '#141414' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#e0bc4a')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#d4af37')}>
                    我要出售房产 <ArrowRight size={15} />
                  </Link>
                  <Link to="/list-property?mode=rent"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all"
                    style={{ background: 'transparent', color: '#d4af37', border: '1px solid rgba(212,175,55,0.5)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.1)'; e.currentTarget.style.borderColor = 'rgba(212,175,55,0.8)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)' }}>
                    我要出租房产 <ArrowRight size={15} />
                  </Link>
                </div>
              </div>

              {/* Visual stat block */}
              <div className="lg:col-span-2 grid grid-cols-2 gap-3">
                {[
                  { num: '24h', label: '快速响应' },
                  { num: '100%', label: '中文服务' },
                  { num: '0', label: '前期费用' },
                  { num: '一站', label: '全流程' },
                ].map(s => (
                  <div key={s.label} className="rounded-2xl p-5 text-center"
                    style={{ background: 'rgba(20,20,20,0.55)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="font-serif text-2xl sm:text-3xl font-bold mb-1" style={{ color: '#d4af37' }}>{s.num}</p>
                    <p className="text-[11px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════ CONTACT FORM ════════════ */}
      <section className="py-24 relative overflow-hidden" style={{ background: '#141414' }}>
        <BGPattern variant="dots" mask="fade-edges" size={30} fill="rgba(212,175,55,0.07)" />
        <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-10">
          <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-10">
            <p className="text-[11px] tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(212,175,55,0.65)' }}>联系我们</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-3">开始您的置业之旅</h2>
            <p className="text-base" style={{ color: 'rgba(255,255,255,0.4)' }}>我们将在 24 小时内与您联系</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-3xl p-7 sm:p-10"
            style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(212,175,55,0.18)' }}
          >
            {formSent ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)' }}>
                  <Check size={28} style={{ color: '#d4af37' }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">发送成功！</h3>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.42)' }}>我们会尽快与您联系</p>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { label: '姓名', type: 'text', placeholder: '请输入您的姓名' },
                    { label: '电话 / 微信', type: 'tel', placeholder: '请输入联系方式' },
                  ].map(({ label, type, placeholder }) => (
                    <div key={label}>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</label>
                      <input type={type} placeholder={placeholder} required
                        className="w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition-colors"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                        onFocus={e => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)')}
                        onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>邮箱</label>
                  <input type="email" placeholder="请输入您的邮箱" required
                    className="w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition-colors"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                    onFocus={e => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>留言</label>
                  <textarea rows={4} placeholder="请告诉我们您的置业需求，例如区域、预算、自住还是投资等" required
                    className="w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition-colors resize-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                    onFocus={e => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
                  />
                </div>
                <motion.button type="submit" disabled={formLoading}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-colors"
                  style={{ background: formLoading ? 'rgba(212,175,55,0.6)' : '#d4af37', color: '#141414', cursor: formLoading ? 'not-allowed' : 'pointer' }}
                  onMouseEnter={e => { if (!formLoading) e.currentTarget.style.background = '#e0bc4a' }}
                  onMouseLeave={e => { if (!formLoading) e.currentTarget.style.background = '#d4af37' }}
                >
                  {formLoading ? '发送中…' : <>提交咨询 <ArrowRight size={16} /></>}
                </motion.button>
                <p className="text-center text-xs pt-1" style={{ color: 'rgba(255,255,255,0.22)' }}>
                  或在小红书搜索「奥匈置业研究所 | CH」直接私信
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* ════════════ PARTNERS MARQUEE ════════════ */}
      <section style={{ background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', padding: '52px 0' }}>
        <style>{`
          @keyframes marqueeScroll {
            from { transform: translateX(0); }
            to   { transform: translateX(-50%); }
          }
          .marquee-track {
            display: flex;
            align-items: center;
            width: max-content;
            animation: marqueeScroll 36s linear infinite;
          }
          .marquee-track:hover { animation-play-state: paused; }
          .p-logo {
            color: rgba(255,255,255,0.38);
            transition: color 0.3s ease;
            cursor: default;
            user-select: none;
            flex-shrink: 0;
            text-transform: uppercase;
          }
          .p-logo:hover { color: rgba(255,255,255,0.82); }
        `}</style>

        <p className="text-center text-[11px] tracking-[0.28em] mb-10"
          style={{ color: 'rgba(255,255,255,0.22)' }}>
          合作伙伴
        </p>

        <div style={{
          maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
        }}>
          <div className="marquee-track">
            {[0, 1].map(copy => (
              <div key={copy} className="flex items-center" style={{ gap: '0 68px', paddingRight: '68px' }}>

                {/* YELLOWBIRD — Montserrat 800, tight tracking */}
                <span className="p-logo"
                  style={{ fontFamily: '"Montserrat","Arial Black",sans-serif', fontWeight: 800, fontSize: '20px', letterSpacing: '0.05em' }}>
                  YELLOWBIRD
                </span>

                <div className="flex-shrink-0 w-px h-4" style={{ background: 'rgba(255,255,255,0.1)' }} />

                {/* GLORIT — Arial Black, very wide tracking */}
                <span className="p-logo"
                  style={{ fontFamily: '"Arial","Helvetica",sans-serif', fontWeight: 900, fontSize: '19px', letterSpacing: '0.22em' }}>
                  GLORIT
                </span>

                <div className="flex-shrink-0 w-px h-4" style={{ background: 'rgba(255,255,255,0.1)' }} />

                {/* VALERTO — Helvetica Neue medium, moderate tracking */}
                <span className="p-logo"
                  style={{ fontFamily: '"Helvetica Neue","Arial",sans-serif', fontWeight: 500, fontSize: '18px', letterSpacing: '0.14em' }}>
                  VALERTO
                </span>

                <div className="flex-shrink-0 w-px h-4" style={{ background: 'rgba(255,255,255,0.1)' }} />

                {/* STOLZ — Arial Narrow condensed, very wide tracking */}
                <span className="p-logo"
                  style={{ fontFamily: '"Arial Narrow","Arial",sans-serif', fontWeight: 700, fontSize: '23px', letterSpacing: '0.38em' }}>
                  STOLZ
                </span>

                <div className="flex-shrink-0 w-px h-4" style={{ background: 'rgba(255,255,255,0.1)' }} />

                {/* LAGEEINS — geometric sans, bold, tight */}
                <span className="p-logo"
                  style={{ fontFamily: '"Helvetica Neue","Arial",sans-serif', fontWeight: 700, fontSize: '19px', letterSpacing: '0.08em' }}>
                  LAGEEINS
                </span>

                <div className="flex-shrink-0 w-px h-4" style={{ background: 'rgba(255,255,255,0.1)' }} />

                {/* LANDAA — medium weight, spaced */}
                <span className="p-logo"
                  style={{ fontFamily: '"Helvetica Neue","Arial",sans-serif', fontWeight: 600, fontSize: '19px', letterSpacing: '0.24em' }}>
                  LANDAA
                </span>

                <div className="flex-shrink-0 w-px h-4" style={{ background: 'rgba(255,255,255,0.1)' }} />

                {/* PRIMA — italic serif, bold */}
                <span className="p-logo"
                  style={{ fontFamily: '"Georgia","Times New Roman",serif', fontWeight: 700, fontSize: '21px', letterSpacing: '0.16em', fontStyle: 'italic' }}>
                  PRIMA
                </span>

                <div className="flex-shrink-0 w-px h-4" style={{ background: 'rgba(255,255,255,0.1)' }} />

                {/* KORN12 — light weight + bold number */}
                <span className="p-logo"
                  style={{ fontFamily: '"Helvetica Neue","Arial",sans-serif', fontWeight: 300, fontSize: '21px', letterSpacing: '0.07em' }}>
                  KORN12
                </span>

                <div className="flex-shrink-0 w-px h-4" style={{ background: 'rgba(255,255,255,0.1)' }} />

                {/* WINEGG — semibold, elegant tracking */}
                <span className="p-logo"
                  style={{ fontFamily: '"Helvetica Neue","Arial",sans-serif', fontWeight: 600, fontSize: '20px', letterSpacing: '0.18em' }}>
                  WINEGG
                </span>

                <div className="flex-shrink-0 w-px h-4" style={{ background: 'rgba(255,255,255,0.1)' }} />

                {/* HARING — Arial Black heavy, wide */}
                <span className="p-logo"
                  style={{ fontFamily: '"Arial Black","Arial",sans-serif', fontWeight: 900, fontSize: '19px', letterSpacing: '0.2em' }}>
                  HARING
                </span>

                <div className="flex-shrink-0 w-px h-4" style={{ background: 'rgba(255,255,255,0.1)' }} />

                {/* BOOMLIVING — extrabold, compact */}
                <span className="p-logo"
                  style={{ fontFamily: '"Helvetica Neue","Arial",sans-serif', fontWeight: 800, fontSize: '18px', letterSpacing: '0.05em' }}>
                  BOOMLIVING
                </span>

                <div className="flex-shrink-0 w-px h-4" style={{ background: 'rgba(255,255,255,0.1)' }} />

              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ FOOTER ════════════ */}
      <footer className="py-8 px-4 sm:px-6 lg:px-10" style={{ borderTop: '1px solid rgba(212,175,55,0.18)', background: '#0a0a0a' }}>
        <div className="max-w-6xl mx-auto">
          {/* Top row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
            <div className="font-bold text-sm" style={{ color: '#d4af37' }}>奥匈置业研究所</div>
            <p className="text-xs text-center" style={{ color: 'rgba(212,175,55,0.65)' }}>
              © 2025 Yellowbird Immobilienmakler GmbH · Wien, Austria
            </p>
            <Link to="/about" className="text-xs transition-colors" style={{ color: 'rgba(212,175,55,0.7)' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#e8c552')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(212,175,55,0.7)')}>
              联系我们 →
            </Link>
          </div>
          {/* Legal links row */}
          <div className="flex items-center justify-center gap-4 pt-3" style={{ borderTop: '1px solid rgba(212,175,55,0.12)' }}>
            {[
              { to: '/impressum',   label: 'Impressum' },
              { to: '/datenschutz', label: '隐私政策 / Datenschutz' },
            ].map(({ to, label }) => (
              <Link key={to} to={to}
                className="text-[11px] transition-colors"
                style={{ color: 'rgba(212,175,55,0.6)' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#e8c552')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(212,175,55,0.6)')}>
                {label}
              </Link>
            ))}
            <span className="text-[11px]" style={{ color: 'rgba(212,175,55,0.55)' }}>
              · 数据来源：Ediktsdatei.justiz.gv.at
            </span>
          </div>
          {/* Justimmo attribution */}
          <div className="flex justify-center pt-3">
            <span className="text-[11px]" style={{ color: 'rgba(212,175,55,0.6)' }}>
              © Justimmo / Immobilienmaklersoftware
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
