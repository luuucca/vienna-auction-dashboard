import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, MapPin, ArrowRight } from 'lucide-react'
import { ButtonLink } from '../components/ui/Button'
import { Reveal } from '../components/ui/Reveal'
import { CountUp } from '../components/ui/CountUp'

/**
 * Market trends page.
 *
 * Three pillars:
 *   1. Vienna overall avg €/㎡ — sparkline of 5 years of public data
 *      (Statistik Austria + ImmoUnited approximations).
 *   2. District comparison bar — live data from /api/listings,
 *      computes avg €/㎡ per district from currently-active sale listings.
 *   3. District detail card — pick a district, see our listings stats
 *      for it (count, avg/㎡, total range, etc.)
 */

/* ─────────────────────────────────────────────
   Reference data — Vienna overall, year-end
   prices € / m² (sale only). Sources: Statistik
   Austria house-price index + ImmoUnited reports.
   Update yearly.
───────────────────────────────────────────── */
const VIENNA_AVG_OVER_YEARS: { year: number; price: number }[] = [
  { year: 2020, price: 5_200 },
  { year: 2021, price: 5_800 },
  { year: 2022, price: 6_400 },
  { year: 2023, price: 6_500 },
  { year: 2024, price: 6_800 },
  { year: 2025, price: 7_100 },
  { year: 2026, price: 7_300 }, // mid-year approx
]

const DISTRICT_NAMES: Record<number, string> = {
  1: 'Innere Stadt', 2: 'Leopoldstadt', 3: 'Landstraße',
  4: 'Wieden', 5: 'Margareten', 6: 'Mariahilf',
  7: 'Neubau', 8: 'Josefstadt', 9: 'Alsergrund',
  10: 'Favoriten', 11: 'Simmering', 12: 'Meidling',
  13: 'Hietzing', 14: 'Penzing', 15: 'Rudolfsheim-Fünfhaus',
  16: 'Ottakring', 17: 'Hernals', 18: 'Währing',
  19: 'Döbling', 20: 'Brigittenau', 21: 'Floridsdorf',
  22: 'Donaustadt', 23: 'Liesing',
}

interface Listing {
  id: string
  forRent: boolean
  price: number
  sqm: number
  rooms: number
  address: { district: string }
}

function districtFromText(text?: string): number {
  if (!text) return 0
  const m = String(text).match(/Wien\s+(\d+)/i)
  return m ? parseInt(m[1]) : 0
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function MarketPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/listings')
      .then(r => r.json())
      .then(d => {
        setListings((d.listings || []) as Listing[])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // ── Vienna overall ────────────────────────────────────────────────────────
  const latestVienna = VIENNA_AVG_OVER_YEARS[VIENNA_AVG_OVER_YEARS.length - 1]
  const prevVienna   = VIENNA_AVG_OVER_YEARS[VIENNA_AVG_OVER_YEARS.length - 2]
  const firstVienna  = VIENNA_AVG_OVER_YEARS[0]
  const fiveYearGrowth = ((latestVienna.price - firstVienna.price) / firstVienna.price) * 100

  // ── District aggregates from live listings ────────────────────────────────
  const districtStats = useMemo(() => {
    type Stats = { district: number; count: number; sumPerSqm: number; avgPerSqm: number; minPrice: number; maxPrice: number }
    const groups = new Map<number, Stats>()
    for (const l of listings) {
      if (l.forRent || l.price <= 0 || l.sqm <= 0) continue
      const d = districtFromText(l.address?.district)
      if (d <= 0) continue
      const perSqm = l.price / l.sqm
      const g = groups.get(d) ?? { district: d, count: 0, sumPerSqm: 0, avgPerSqm: 0, minPrice: Infinity, maxPrice: 0 }
      g.count += 1
      g.sumPerSqm += perSqm
      g.minPrice = Math.min(g.minPrice, l.price)
      g.maxPrice = Math.max(g.maxPrice, l.price)
      groups.set(d, g)
    }
    return Array.from(groups.values())
      .map(g => ({ ...g, avgPerSqm: g.sumPerSqm / g.count }))
      .sort((a, b) => b.avgPerSqm - a.avgPerSqm)
  }, [listings])

  const maxDistrictPrice = Math.max(...districtStats.map(d => d.avgPerSqm), 1)

  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null)
  // Default-select the first district when data loads
  useEffect(() => {
    if (!loading && districtStats.length > 0 && selectedDistrict === null) {
      setSelectedDistrict(districtStats[0].district)
    }
  }, [loading, districtStats, selectedDistrict])

  const selectedStats = districtStats.find(d => d.district === selectedDistrict) ?? null
  const selectedListings = selectedDistrict
    ? listings.filter(l => !l.forRent && districtFromText(l.address?.district) === selectedDistrict && l.price > 0)
    : []

  return (
    <div className="min-h-screen bg-bg-base text-fg-primary pt-16">

      {/* Header */}
      <header className="px-4 sm:px-6 lg:px-10 pt-14 pb-10 border-b border-white/[0.06]">
        <div className="max-w-content mx-auto">
          <p className="text-overline text-gold/80 uppercase mb-3">Market · 实时数据</p>
          <h1 className="font-serif text-display-lg sm:text-display-xl text-fg-primary mb-3 tracking-tight">
            维也纳房价走势
          </h1>
          <p className="text-body-lg text-fg-secondary max-w-prose">
            综合 Statistik Austria 公开数据与本站实时房源，5 年走势 + 23 区均价对比。
          </p>
        </div>
      </header>

      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16 space-y-14">

        {/* ── 1. Vienna overall ─────────────────────────────────────────── */}
        <Reveal>
          <section>
            <div className="mb-6">
              <p className="text-overline text-fg-tertiary uppercase mb-2">Overview</p>
              <h2 className="font-serif text-display-lg text-fg-primary tracking-tight">维也纳整体</h2>
            </div>

            <div className="grid lg:grid-cols-5 gap-6">
              {/* Big stat */}
              <div className="lg:col-span-2 rounded-2xl p-7 bg-bg-elev-1 border border-white/[0.06]">
                <p className="text-overline text-fg-tertiary uppercase mb-3">2026 平均售价</p>
                <div className="font-serif text-display-xl text-gold tabular leading-none">
                  €<CountUp value={latestVienna.price} duration={1600} />
                </div>
                <p className="mt-3 text-caption text-fg-tertiary tabular">每 m² · 全维也纳均值</p>

                <div className="mt-6 pt-5 border-t border-white/[0.06] grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-1 text-success">
                      <TrendingUp size={14} strokeWidth={1.5} />
                      <span className="font-serif text-heading-lg tabular">
                        +<CountUp value={Math.round(fiveYearGrowth)} suffix="%" duration={1400} />
                      </span>
                    </div>
                    <p className="text-caption text-fg-tertiary mt-1">5 年累计增幅</p>
                  </div>
                  <div>
                    <div className="font-serif text-heading-lg text-fg-primary tabular">
                      +<CountUp value={Math.round(((latestVienna.price - prevVienna.price) / prevVienna.price) * 100)} suffix="%" duration={1400} />
                    </div>
                    <p className="text-caption text-fg-tertiary mt-1">同比上年</p>
                  </div>
                </div>
              </div>

              {/* Sparkline */}
              <div className="lg:col-span-3 rounded-2xl p-7 bg-bg-elev-1 border border-white/[0.06]">
                <div className="flex items-end justify-between mb-5">
                  <div>
                    <p className="text-overline text-fg-tertiary uppercase mb-1">5 年走势</p>
                    <p className="text-caption text-fg-secondary tabular">
                      {firstVienna.year} → {latestVienna.year}
                    </p>
                  </div>
                  <p className="text-caption text-fg-tertiary tabular">€ / m²</p>
                </div>
                <Sparkline data={VIENNA_AVG_OVER_YEARS} />
              </div>
            </div>
          </section>
        </Reveal>

        {/* ── 2. District comparison — live from our listings ──────────── */}
        <Reveal>
          <section>
            <div className="mb-6">
              <p className="text-overline text-fg-tertiary uppercase mb-2">By District · 实时</p>
              <h2 className="font-serif text-display-lg text-fg-primary tracking-tight">各区均价对比</h2>
              <p className="mt-2 text-body text-fg-secondary">
                基于本站当前在售房源（{listings.filter(l => !l.forRent && l.price > 0 && l.sqm > 0).length} 套）实时计算 · 点击任意区查看详情
              </p>
            </div>

            {loading ? (
              <div className="rounded-2xl p-8 bg-bg-elev-1 border border-white/[0.06] text-center text-body text-fg-secondary">
                加载中…
              </div>
            ) : districtStats.length === 0 ? (
              <div className="rounded-2xl p-8 bg-bg-elev-1 border border-white/[0.06] text-center text-body text-fg-secondary">
                暂无可对比数据
              </div>
            ) : (
              <div className="rounded-2xl p-5 sm:p-7 bg-bg-elev-1 border border-white/[0.06] space-y-2">
                {districtStats.map((d, i) => (
                  <DistrictBar
                    key={d.district}
                    district={d.district}
                    name={DISTRICT_NAMES[d.district] || ''}
                    avgPerSqm={d.avgPerSqm}
                    count={d.count}
                    maxValue={maxDistrictPrice}
                    selected={d.district === selectedDistrict}
                    onClick={() => setSelectedDistrict(d.district)}
                    delay={i * 40}
                  />
                ))}
              </div>
            )}
          </section>
        </Reveal>

        {/* ── 3. Selected district detail ──────────────────────────────── */}
        {selectedStats && (
          <Reveal>
            <section>
              <div className="mb-6 flex items-baseline justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-overline text-fg-tertiary uppercase mb-2">District {selectedStats.district}</p>
                  <h2 className="font-serif text-display-lg text-fg-primary tracking-tight">
                    {selectedStats.district} 区 · {DISTRICT_NAMES[selectedStats.district]}
                  </h2>
                </div>
                <p className="text-caption text-fg-tertiary tabular">
                  {selectedStats.count} 套在售
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-3 mb-5">
                <DetailStat
                  label="均价"
                  value={`€${Math.round(selectedStats.avgPerSqm).toLocaleString()}`}
                  unit="/ m²"
                  accent
                />
                <DetailStat
                  label="最低售价"
                  value={`€${Math.round(selectedStats.minPrice / 1000)}K`}
                />
                <DetailStat
                  label="最高售价"
                  value={
                    selectedStats.maxPrice >= 1_000_000
                      ? `€${(selectedStats.maxPrice / 1_000_000).toFixed(2).replace(/\.?0+$/, '')} Mio.`
                      : `€${Math.round(selectedStats.maxPrice / 1000)}K`
                  }
                />
              </div>

              {/* Price-bucket distribution */}
              <div className="rounded-2xl p-5 sm:p-7 bg-bg-elev-1 border border-white/[0.06]">
                <p className="text-overline text-fg-tertiary uppercase mb-4">价格分布</p>
                <PriceBucketChart listings={selectedListings} />
              </div>

              <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl p-5 bg-gold-tint border border-gold-line">
                <p className="text-body text-fg-secondary">
                  想看 <span className="text-fg-primary font-medium">{selectedStats.district} 区</span> 在售的 {selectedStats.count} 套房源？
                </p>
                <ButtonLink
                  to={`/listings?district=${selectedStats.district}`}
                  variant="primary"
                  size="md"
                  trailingIcon={<ArrowRight size={14} strokeWidth={1.75} />}
                >
                  浏览 {selectedStats.district} 区房源
                </ButtonLink>
              </div>
            </section>
          </Reveal>
        )}

        {/* Disclaimer */}
        <p className="text-caption text-fg-tertiary max-w-prose leading-relaxed pt-4 border-t border-white/[0.06]">
          * 维也纳整体均价基于 Statistik Austria 公开房价指数与 ImmoUnited 等机构报告综合估算，每年更新。
          各区数据基于本站实时在售房源计算，仅供参考。具体物业的市场价请联系我们做精确评估。
        </p>
      </div>
    </div>
  )
}

// ─── Sparkline chart ────────────────────────────────────────────────────────
function Sparkline({ data }: { data: { year: number; price: number }[] }) {
  const W = 600
  const H = 180
  const PAD_L = 50
  const PAD_R = 20
  const PAD_T = 20
  const PAD_B = 30

  const xs = data.map(d => d.year)
  const ys = data.map(d => d.price)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const xMin = Math.min(...xs)
  const xMax = Math.max(...xs)

  const x = (year: number) =>
    PAD_L + ((year - xMin) / (xMax - xMin)) * (W - PAD_L - PAD_R)
  const y = (price: number) =>
    PAD_T + (1 - (price - minY) / (maxY - minY)) * (H - PAD_T - PAD_B)

  const points = data.map(d => `${x(d.year)},${y(d.price)}`).join(' ')
  const areaPath = `M ${x(data[0].year)},${H - PAD_B} L ${points.split(' ').join(' L ')} L ${x(data[data.length - 1].year)},${H - PAD_B} Z`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="splkArea" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="rgba(212,175,55,0.35)" />
          <stop offset="100%" stopColor="rgba(212,175,55,0)" />
        </linearGradient>
      </defs>

      {/* Y-axis gridlines */}
      {[0, 0.5, 1].map((t, i) => {
        const yVal = minY + t * (maxY - minY)
        const yPos = y(yVal)
        return (
          <g key={i}>
            <line
              x1={PAD_L}
              y1={yPos}
              x2={W - PAD_R}
              y2={yPos}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />
            <text
              x={PAD_L - 8}
              y={yPos}
              fontSize="10"
              fill="rgba(160,160,160,0.6)"
              textAnchor="end"
              dominantBaseline="middle"
              className="tabular"
            >
              {(yVal / 1000).toFixed(1)}K
            </text>
          </g>
        )
      })}

      {/* Area fill under the line */}
      <path d={areaPath} fill="url(#splkArea)" />

      {/* Main line */}
      <polyline
        points={points}
        fill="none"
        stroke="#d4af37"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Year labels + point markers */}
      {data.map((d, i) => (
        <g key={d.year}>
          <circle cx={x(d.year)} cy={y(d.price)} r="3.5" fill="#d4af37" stroke="#0c0c0c" strokeWidth="1.5" />
          <text
            x={x(d.year)}
            y={H - 6}
            fontSize="10"
            fill="rgba(160,160,160,0.7)"
            textAnchor="middle"
            className="tabular"
          >
            {d.year}
          </text>
          {/* Show price label on last point */}
          {i === data.length - 1 && (
            <text
              x={x(d.year) - 8}
              y={y(d.price) - 8}
              fontSize="11"
              fill="#d4af37"
              textAnchor="end"
              className="tabular"
              fontWeight="600"
            >
              €{(d.price / 1000).toFixed(1)}K
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}

// ─── District comparison bar row ────────────────────────────────────────────
function DistrictBar({
  district, name, avgPerSqm, count, maxValue, selected, onClick, delay,
}: {
  district: number; name: string; avgPerSqm: number; count: number
  maxValue: number; selected: boolean; onClick: () => void; delay: number
}) {
  const widthPct = (avgPerSqm / maxValue) * 100

  return (
    <motion.button
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: delay / 1000, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      className={[
        'group w-full text-left p-3 rounded-lg',
        'transition-[background,border-color] duration-base ease-standard',
        selected
          ? 'bg-gold-tint border border-gold-line'
          : 'bg-transparent border border-transparent hover:bg-bg-elev-2',
      ].join(' ')}
    >
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <div className="flex items-baseline gap-2 tabular min-w-0">
          <span className={selected ? 'text-gold font-semibold text-heading-md' : 'text-fg-primary font-medium text-body-lg'}>
            {district} 区
          </span>
          <span className="text-caption text-fg-tertiary truncate">{name}</span>
        </div>
        <div className="flex items-baseline gap-2 tabular shrink-0">
          <span className={selected ? 'text-gold font-serif text-heading-md' : 'text-fg-primary font-serif text-heading-md'}>
            €{Math.round(avgPerSqm).toLocaleString()}
          </span>
          <span className="text-caption text-fg-tertiary">/ m²</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-white/[0.04]">
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            whileInView={{ width: `${widthPct}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: delay / 1000 + 0.1, ease: [0.22, 1, 0.36, 1] }}
            style={{ background: selected ? '#d4af37' : 'rgba(212,175,55,0.55)' }}
          />
        </div>
        <span className="text-caption text-fg-tertiary tabular shrink-0 min-w-[40px] text-right">
          {count} 套
        </span>
      </div>
    </motion.button>
  )
}

// ─── Stat block ─────────────────────────────────────────────────────────────
function DetailStat({ label, value, unit, accent = false }: { label: string; value: string; unit?: string; accent?: boolean }) {
  return (
    <div className="rounded-xl p-5 bg-bg-elev-1 border border-white/[0.06]">
      <p className="text-overline text-fg-tertiary uppercase mb-2">{label}</p>
      <div className="flex items-baseline gap-1.5">
        <span className={['font-serif text-display-lg tabular leading-none', accent ? 'text-gold' : 'text-fg-primary'].join(' ')}>
          {value}
        </span>
        {unit && <span className="text-caption text-fg-tertiary">{unit}</span>}
      </div>
    </div>
  )
}

// ─── Price bucket chart ─────────────────────────────────────────────────────
function PriceBucketChart({ listings }: { listings: Listing[] }) {
  const BUCKETS = [
    { label: '< €300K',         min: 0,           max: 300_000 },
    { label: '€300K–€500K',     min: 300_000,     max: 500_000 },
    { label: '€500K–€1M',       min: 500_000,     max: 1_000_000 },
    { label: '€1M–€2M',         min: 1_000_000,   max: 2_000_000 },
    { label: '> €2M',           min: 2_000_000,   max: Infinity },
  ]

  const counts = BUCKETS.map(b => ({
    ...b,
    count: listings.filter(l => l.price >= b.min && l.price < b.max).length,
  }))
  const maxCount = Math.max(...counts.map(c => c.count), 1)

  return (
    <div className="space-y-3">
      {counts.map(b => {
        const pct = (b.count / maxCount) * 100
        return (
          <div key={b.label} className="flex items-center gap-4">
            <span className="text-caption text-fg-secondary tabular w-28 sm:w-32 shrink-0">{b.label}</span>
            <div className="flex-1 h-2.5 rounded-full overflow-hidden bg-white/[0.04]">
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                whileInView={{ width: `${pct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                style={{ background: b.count > 0 ? '#d4af37' : 'rgba(212,175,55,0.15)' }}
              />
            </div>
            <span className="text-caption tabular text-fg-primary font-medium w-10 text-right">{b.count}</span>
          </div>
        )
      })}
    </div>
  )
}
