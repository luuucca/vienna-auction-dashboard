import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight, Gavel, Building2,
  TrendingUp, Shield, Globe, ChevronRight, Check,
} from 'lucide-react'
import { ButtonLink } from '../components/ui/Button'
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
        // Prefer listings that have multiple images and are for sale; take 3
        const ranked = all
          .filter(l => l.coverImage && !l.forRent)
          .sort((a, b) => {
            // Pictures-rich first, then newest IDs
            const ac = (a.images?.length || 0)
            const bc = (b.images?.length || 0)
            if (ac !== bc) return bc - ac
            return (b.id || '').localeCompare(a.id || '')
          })
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
      <section className="py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-10 bg-bg-base">
        <div className="max-w-content mx-auto">
          <div className="mb-12 max-w-prose">
            <p className="text-overline text-gold/80 mb-3 uppercase">Exclusive Tool</p>
            <h2 className="font-serif text-display-lg sm:text-display-xl text-fg-primary tracking-tight">
              法拍房信息汇总
            </h2>
            <p className="mt-4 text-body-lg text-fg-secondary">
              自主研发系统实时抓取 Ediktsdatei 数据，地图可视化全维也纳 60+ 在拍房源。
            </p>
          </div>

          {/* Feature card — calmer, no glassmorphism */}
          <div className="rounded-2xl overflow-hidden bg-bg-elev-1 border border-white/[0.06]">
            {/* Animated city network canvas */}
            <div className="relative h-72 overflow-hidden bg-bg-base">
              <CityNetworkCanvas />
              <div className="absolute bottom-0 left-0 right-0 h-20"
                style={{ background: 'linear-gradient(to top, rgba(19,19,19,1), transparent)' }} />
            </div>

            {/* Stats + CTA */}
            <div className="p-7 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-4">
                {[
                  { v: '60+',     l: '在拍房源' },
                  { v: '50%',     l: '最低起拍' },
                  { v: '1–23 区', l: '全维也纳' },
                  { v: '免费',    l: '无需注册' },
                ].map(({ v, l }) => (
                  <div key={l}>
                    <div className="text-heading-lg text-gold tabular">{v}</div>
                    <div className="mt-1 text-caption text-fg-tertiary">{l}</div>
                  </div>
                ))}
              </div>
              <ButtonLink
                to="/auction"
                variant="primary"
                size="md"
                leadingIcon={<Gavel size={14} strokeWidth={1.75} />}
                trailingIcon={<ArrowRight size={13} strokeWidth={1.75} />}
              >
                进入看板
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ WHY VIENNA ════════════ */}
      <section className="py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-10 bg-bg-elev-1 border-y border-white/[0.06]">
        <div className="max-w-content mx-auto">
          <div className="mb-12 max-w-prose">
            <p className="text-overline text-gold/80 mb-3 uppercase">Market</p>
            <h2 className="font-serif text-display-lg text-fg-primary tracking-tight">
              为什么选择维也纳
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-px bg-white/[0.06] rounded-2xl overflow-hidden">
            {[
              { icon: <TrendingUp size={17} strokeWidth={1.5} />, title: '价格仍具优势', desc: '对比伦敦、巴黎、慕尼黑，维也纳每平方米单价显著偏低，中长期增值潜力突出。' },
              { icon: <Shield     size={17} strokeWidth={1.5} />, title: '法律框架透明', desc: '奥地利产权保护健全，购房程序规范；非 EU 买家须额外审批，各州政策有所不同。' },
              { icon: <Globe      size={17} strokeWidth={1.5} />, title: '欧盟核心城市', desc: '申根区核心，生活质量连续多年全球第一，是华人移居欧洲的热门目的地之一。' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="p-7 bg-bg-base">
                <div className="w-9 h-9 flex items-center justify-center rounded-md mb-5 bg-gold-tint border border-gold-line text-gold">
                  {icon}
                </div>
                <h3 className="text-heading-md text-fg-primary mb-2">{title}</h3>
                <p className="text-body text-fg-secondary">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ FOR OWNERS (Sell / Rent) ════════════ */}
      <section className="py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-10 bg-bg-base">
        <div className="max-w-content mx-auto rounded-2xl p-8 sm:p-12 lg:p-14 bg-bg-elev-1 border border-white/[0.06]">
            <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-3">
                <p className="text-overline text-gold/80 mb-3 uppercase">For Property Owners</p>
                <h2 className="font-serif text-display-lg sm:text-display-xl text-fg-primary mb-5 tracking-tight">
                  您的房产，<br className="sm:hidden" />
                  <span className="text-gold">中文渠道</span>
                </h2>
                <p className="text-body-lg text-fg-secondary mb-7 max-w-prose">
                  从市场评估到交易过户，全程中文协助。专业摄影、定价建议、小红书 + 微信推广，让您的房产精准触达华人客户。
                </p>

                {/* Bullets */}
                <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5 mb-8">
                  {[
                    '免费市场评估',
                    '专业摄影 / 视频',
                    '小红书 + 微信推广',
                    '陪同看房与谈判',
                    '中文合同解读',
                    '过户与税务协助',
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
                ].map(s => (
                  <div key={s.label} className="rounded-xl p-5 text-center bg-bg-base border border-white/[0.06]">
                    <p className="font-serif text-heading-xl text-gold mb-1 tabular">{s.num}</p>
                    <p className="text-overline text-fg-tertiary uppercase">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
        </div>
      </section>

      {/* ════════════ CONTACT FORM ════════════ */}
      <section className="py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-10 bg-bg-elev-1 border-t border-white/[0.06]">
        <div className="max-w-prose mx-auto">
          <div className="mb-10">
            <p className="text-overline text-gold/80 mb-3 uppercase">Contact</p>
            <h2 className="font-serif text-display-lg sm:text-display-xl text-fg-primary tracking-tight">
              开始您的置业之旅
            </h2>
            <p className="mt-4 text-body-lg text-fg-secondary">
              我们将在 24 小时内与您联系。
            </p>
          </div>

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
                ].map((name, i, arr) => (
                  <React.Fragment key={`${copy}-${name}`}>
                    <span className="p-logo">{name}</span>
                    {i < arr.length - 1 && (
                      <div className="flex-shrink-0 w-px h-3 bg-white/[0.08]" />
                    )}
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
            <div className="text-body font-semibold text-gold">奥匈置业研究所</div>
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
