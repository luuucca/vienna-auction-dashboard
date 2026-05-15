import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight, Gavel, Building2,
  TrendingUp, Shield, Globe, ChevronRight, Check,
} from 'lucide-react'
import { ButtonLink, Button } from '../components/ui/Button'
import { ListingCard, type ListingCardData } from '../components/ui/ListingCard'

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
   Featured listings — fetched live from Notion via /api/listings.
   We surface 3 sale + 0 rent, sorted by recency (newest IDs first).
───────────────────────────────────────────── */
function useFeaturedListings() {
  const [listings, setListings] = useState<ListingCardData[]>([])
  useEffect(() => {
    fetch('/api/listings')
      .then(r => r.json())
      .then(data => {
        const all = (data.listings || []) as any[]
        // Prefer listings that have a cover image and are for sale; take 3
        const ranked = all
          .filter(l => l.coverImage && !l.forRent)
          .sort((a, b) => (b.id || '').localeCompare(a.id || ''))
          .slice(0, 3)
        setListings(ranked.length ? ranked : all.slice(0, 3))
      })
      .catch(() => setListings([]))
  }, [])
  return listings
}

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function HomePage() {
  const featured = useFeaturedListings()
  const [formSent, setFormSent] = useState(false)
  const [formLoading, setFormLoading] = useState(false)

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
      <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden pt-16 px-4 sm:px-6 lg:px-10">
        <BGPattern size={32} fill="rgba(212,175,55,0.06)" />

        <div className="relative z-10 w-full max-w-content mx-auto py-24 text-center">

          {/* Overline badge */}
          <div className="hero-fade-1 mb-8 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-overline text-gold"
              style={{ background: 'var(--gold-tint)', border: '1px solid var(--gold-line)' }}>
              <Building2 size={11} strokeWidth={1.75} />
              维也纳 · 华人房产经纪
            </div>
          </div>

          {/* Display headline — static gold, no shimmer */}
          <h1
            className="hero-fade-2 font-serif mb-6 mx-auto"
            style={{
              color: 'var(--fg-display)',
              fontSize: 'clamp(40px, 7vw, 72px)',
              lineHeight: 1.05,
              letterSpacing: '-0.025em',
              fontWeight: 600,
              maxWidth: '14ch',
            }}
          >
            维也纳房产，<br/>
            <span className="text-gold">中文一条龙</span>服务
          </h1>

          {/* Subtitle */}
          <p
            className="hero-fade-3 mt-6 mb-12 max-w-xl mx-auto text-body-lg"
            style={{ color: 'var(--fg-secondary)' }}
          >
            真实房源、法拍房专长、购房流程指南。<br className="hidden sm:block" />
            从看房到过户，全程中文陪伴。
          </p>

          {/* CTAs */}
          <div className="hero-fade-4 flex flex-col sm:flex-row gap-3 justify-center">
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
          </div>

          {/* Quiet stat strip */}
          <div className="hero-fade-5 mt-16 grid grid-cols-3 max-w-md mx-auto text-center gap-4">
            {[
              { v: '114+', l: '在售房源' },
              { v: '60+',  l: '法拍房源' },
              { v: '1–23', l: '全维也纳' },
            ].map(({ v, l }) => (
              <div key={l}>
                <div className="text-heading-lg text-gold tabular">{v}</div>
                <div className="mt-1 text-caption text-fg-tertiary">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ FEATURED LISTINGS — real data ════════════ */}
      <section className="py-20 sm:py-28 lg:py-32 bg-bg-elev-1 px-4 sm:px-6 lg:px-10">
        <div className="max-w-content mx-auto">
          <div className="mb-12 flex items-end justify-between gap-6">
            <div>
              <p className="text-overline text-gold/80 mb-2 uppercase">Featured</p>
              <h2 className="font-serif text-display-lg sm:text-display-xl text-fg-primary">
                近期推荐
              </h2>
            </div>
            <Link
              to="/listings"
              className="hidden sm:inline-flex items-center gap-1 text-body text-fg-secondary hover:text-gold transition-colors duration-base ease-standard"
            >
              查看全部 <ChevronRight size={14} strokeWidth={1.75} />
            </Link>
          </div>

          {featured.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featured.map(l => (
                <ListingCard key={l.id} listing={l} variant="compact" />
              ))}
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
      <section className="py-24 relative overflow-hidden" style={{ background: '#141414' }}>
        <BGPattern size={28} fill="rgba(212,175,55,0.06)" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-10">
          <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.55 }} className="text-center mb-12">
            <p className="text-[11px] tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(212,175,55,0.65)' }}>独家工具</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-3">法拍房信息汇总</h2>
            <p className="text-base max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.4)' }}>
              自主研发系统，实时抓取 Ediktsdatei 数据<br />
              地图可视化全维也纳 60+ 在拍房源
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
        <BGPattern size={48} fill="rgba(212,175,55,0.04)" />
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
        <BGPattern size={30} fill="rgba(212,175,55,0.06)" />
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
                {/* honeypot for bots */}
                <input type="text" name="website" tabIndex={-1} autoComplete="off"
                  style={{ position: 'absolute', left: '-9999px', width: 1, height: 1 }} />
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { label: '姓名',         name: 'name',    type: 'text', placeholder: '请输入您的姓名' },
                    { label: '电话 / 微信',  name: 'contact', type: 'tel',  placeholder: '请输入联系方式' },
                  ].map(({ label, name, type, placeholder }) => (
                    <div key={name}>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</label>
                      <input type={type} name={name} placeholder={placeholder} required
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
                  <input type="email" name="email" placeholder="请输入您的邮箱" required
                    className="w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition-colors"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                    onFocus={e => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>留言</label>
                  <textarea rows={4} name="message" placeholder="请告诉我们您的置业需求，例如区域、预算、自住还是投资等" required
                    className="w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition-colors resize-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                    onFocus={e => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
                  />
                </div>
                {formError && (
                  <div className="text-xs px-3 py-2 rounded-lg"
                    style={{ background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.35)', color: '#fca5a5' }}>
                    {formError}
                  </div>
                )}
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
