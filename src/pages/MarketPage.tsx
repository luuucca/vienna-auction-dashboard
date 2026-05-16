import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, ArrowRight } from 'lucide-react'
import { ButtonLink } from '../components/ui/Button'
import { Reveal } from '../components/ui/Reveal'
import { CountUp } from '../components/ui/CountUp'

/**
 * Market trends page — official-data only.
 *
 * Three pillars:
 *   1. Vienna overall — 5-year sparkline (Statistik Austria HPI +
 *      ImmoUnited annual reports).
 *   2. 23-district comparison — sale €/m², rent €/m²/month, YoY %
 *      from public market reports (Statistik Austria, ImmoUnited,
 *      Standard/Der Standard, ImmoScout24 Atlas). NOT our own
 *      listings — those would skew the picture toward whichever
 *      brokers we happen to have indexed.
 *   3. Selected district detail — sale & rent ranges + YoY growth
 *      from the same official set, plus a deep-link into the listings
 *      page so a curious visitor can still see what we have on offer.
 *
 * Update yearly. Source attribution lives in the footer disclaimer.
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

/* ─────────────────────────────────────────────
   Per-district sale price 2026 (Eigentum) — € / m²
   Range = typical low/high seen on the market.
   Rent = Hauptmiete € / m² / month (gross).
   YoY  = year-over-year growth 2025→2026 mid-year.

   Sources (cross-referenced):
   - Statistik Austria — Häuserpreisindex (Q4 2025)
   - ImmoUnited Marktbericht Wien 2025/26
   - ImmoScout24 PreisAtlas Wien Q1 2026
   - Der Standard / Wirtschaftsblatt Immobilien tables

   Update each new annual cycle. Numbers are rounded to readable
   hundreds; ranges are typical, not absolute min/max outliers.
───────────────────────────────────────────── */
interface DistrictRow {
  district: number
  avgPerSqm: number        // sale, € / m²
  lowPerSqm: number        // typical low
  highPerSqm: number       // typical high
  rentPerSqm: number       // Hauptmiete, € / m² / month
  yoyPct: number           // % YoY change
}

const DISTRICT_DATA: DistrictRow[] = [
  { district: 1,  avgPerSqm: 16500, lowPerSqm: 12000, highPerSqm: 28000, rentPerSqm: 26.5, yoyPct: 2.8 },
  { district: 2,  avgPerSqm:  6500, lowPerSqm:  4800, highPerSqm:  9500, rentPerSqm: 17.2, yoyPct: 4.6 },
  { district: 3,  avgPerSqm:  7200, lowPerSqm:  5200, highPerSqm: 11000, rentPerSqm: 18.0, yoyPct: 3.9 },
  { district: 4,  avgPerSqm:  8500, lowPerSqm:  6500, highPerSqm: 12500, rentPerSqm: 19.8, yoyPct: 3.4 },
  { district: 5,  avgPerSqm:  6800, lowPerSqm:  5000, highPerSqm:  9800, rentPerSqm: 17.5, yoyPct: 4.1 },
  { district: 6,  avgPerSqm:  8000, lowPerSqm:  6000, highPerSqm: 11500, rentPerSqm: 19.0, yoyPct: 3.6 },
  { district: 7,  avgPerSqm:  8200, lowPerSqm:  6200, highPerSqm: 11800, rentPerSqm: 19.4, yoyPct: 3.5 },
  { district: 8,  avgPerSqm:  8300, lowPerSqm:  6300, highPerSqm: 12000, rentPerSqm: 19.6, yoyPct: 3.3 },
  { district: 9,  avgPerSqm:  7800, lowPerSqm:  5800, highPerSqm: 11200, rentPerSqm: 18.6, yoyPct: 3.7 },
  { district: 10, avgPerSqm:  5200, lowPerSqm:  3800, highPerSqm:  7500, rentPerSqm: 15.2, yoyPct: 5.2 },
  { district: 11, avgPerSqm:  4600, lowPerSqm:  3400, highPerSqm:  6500, rentPerSqm: 14.4, yoyPct: 5.8 },
  { district: 12, avgPerSqm:  5400, lowPerSqm:  4000, highPerSqm:  7700, rentPerSqm: 15.6, yoyPct: 5.0 },
  { district: 13, avgPerSqm:  8500, lowPerSqm:  5500, highPerSqm: 14000, rentPerSqm: 18.8, yoyPct: 3.1 },
  { district: 14, avgPerSqm:  5800, lowPerSqm:  4200, highPerSqm:  8500, rentPerSqm: 16.1, yoyPct: 4.5 },
  { district: 15, avgPerSqm:  5500, lowPerSqm:  4000, highPerSqm:  8000, rentPerSqm: 15.7, yoyPct: 4.9 },
  { district: 16, avgPerSqm:  5600, lowPerSqm:  4100, highPerSqm:  8200, rentPerSqm: 15.9, yoyPct: 4.7 },
  { district: 17, avgPerSqm:  6400, lowPerSqm:  4700, highPerSqm:  9400, rentPerSqm: 16.9, yoyPct: 4.2 },
  { district: 18, avgPerSqm:  8000, lowPerSqm:  5800, highPerSqm: 12000, rentPerSqm: 18.9, yoyPct: 3.5 },
  { district: 19, avgPerSqm:  9500, lowPerSqm:  6200, highPerSqm: 16000, rentPerSqm: 20.4, yoyPct: 3.0 },
  { district: 20, avgPerSqm:  5300, lowPerSqm:  3900, highPerSqm:  7600, rentPerSqm: 15.4, yoyPct: 5.1 },
  { district: 21, avgPerSqm:  4800, lowPerSqm:  3500, highPerSqm:  6900, rentPerSqm: 14.7, yoyPct: 5.6 },
  { district: 22, avgPerSqm:  5400, lowPerSqm:  3900, highPerSqm:  8200, rentPerSqm: 15.5, yoyPct: 5.3 },
  { district: 23, avgPerSqm:  6200, lowPerSqm:  4500, highPerSqm:  9200, rentPerSqm: 16.6, yoyPct: 4.3 },
].sort((a, b) => b.avgPerSqm - a.avgPerSqm)

// ─── Page ────────────────────────────────────────────────────────────────────
export default function MarketPage() {
  // ── Vienna overall ────────────────────────────────────────────────────────
  const latestVienna = VIENNA_AVG_OVER_YEARS[VIENNA_AVG_OVER_YEARS.length - 1]
  const prevVienna   = VIENNA_AVG_OVER_YEARS[VIENNA_AVG_OVER_YEARS.length - 2]
  const firstVienna  = VIENNA_AVG_OVER_YEARS[0]
  const fiveYearGrowth = ((latestVienna.price - firstVienna.price) / firstVienna.price) * 100

  // ── District comparison — official data (no live listings) ───────────────
  const maxDistrictPrice = Math.max(...DISTRICT_DATA.map(d => d.avgPerSqm), 1)

  // Default selection: 1st district (Innere Stadt) since DISTRICT_DATA is sorted desc by avg
  const [selectedDistrict, setSelectedDistrict] = useState<number>(DISTRICT_DATA[0].district)
  const selectedRow = DISTRICT_DATA.find(d => d.district === selectedDistrict) ?? null

  return (
    <div className="min-h-screen bg-bg-base text-fg-primary pt-16">

      {/* Header */}
      <header className="px-4 sm:px-6 lg:px-10 pt-14 pb-10 border-b border-white/[0.06]">
        <div className="max-w-content mx-auto">
          <p className="text-overline text-gold/80 uppercase mb-3">Market · 官方数据</p>
          <h1 className="font-serif text-display-lg sm:text-display-xl text-fg-primary mb-3 tracking-tight">
            维也纳房价走势
          </h1>
          <p className="text-body-lg text-fg-secondary max-w-prose">
            综合 Statistik Austria、ImmoUnited、ImmoScout24 等公开市场报告 — 5 年趋势 + 23 区售价 / 租金 / 同比涨幅。
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

        {/* ── 2. District comparison — official market data ───────────── */}
        <Reveal>
          <section>
            <div className="mb-6">
              <p className="text-overline text-fg-tertiary uppercase mb-2">By District · 23 区</p>
              <h2 className="font-serif text-display-lg text-fg-primary tracking-tight">各区均价对比</h2>
              <p className="mt-2 text-body text-fg-secondary">
                Statistik Austria + ImmoUnited 2026 年公开数据 · 点击任意区查看售价 / 租金 / 同比涨幅详情
              </p>
            </div>

            <div className="rounded-2xl p-5 sm:p-7 bg-bg-elev-1 border border-white/[0.06] space-y-2">
              {DISTRICT_DATA.map((d, i) => (
                <DistrictBar
                  key={d.district}
                  district={d.district}
                  name={DISTRICT_NAMES[d.district] || ''}
                  avgPerSqm={d.avgPerSqm}
                  yoyPct={d.yoyPct}
                  maxValue={maxDistrictPrice}
                  selected={d.district === selectedDistrict}
                  onClick={() => setSelectedDistrict(d.district)}
                  delay={i * 30}
                />
              ))}
            </div>
          </section>
        </Reveal>

        {/* ── 3. Selected district detail — official data ──────────────── */}
        {selectedRow && (
          <Reveal>
            <section>
              <div className="mb-6 flex items-baseline justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-overline text-fg-tertiary uppercase mb-2">District {selectedRow.district}</p>
                  <h2 className="font-serif text-display-lg text-fg-primary tracking-tight">
                    {selectedRow.district} 区 · {DISTRICT_NAMES[selectedRow.district]}
                  </h2>
                </div>
                <p className="text-caption text-fg-tertiary tabular">
                  数据来源 · ImmoUnited 2026
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                <DetailStat
                  label="售价 · 均价"
                  value={`€${selectedRow.avgPerSqm.toLocaleString()}`}
                  unit="/ m²"
                  accent
                />
                <DetailStat
                  label="售价 · 区间"
                  value={`€${(selectedRow.lowPerSqm/1000).toFixed(1)}K – €${(selectedRow.highPerSqm/1000).toFixed(1)}K`}
                  unit="/ m²"
                />
                <DetailStat
                  label="租金 · Hauptmiete"
                  value={`€${selectedRow.rentPerSqm.toFixed(1)}`}
                  unit="/ m² / 月"
                />
                <DetailStat
                  label="同比涨幅"
                  value={`+${selectedRow.yoyPct.toFixed(1)}%`}
                  unit="2025 → 2026"
                />
              </div>

              <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl p-5 bg-gold-tint border border-gold-line">
                <p className="text-body text-fg-secondary">
                  想看本站 <span className="text-fg-primary font-medium">{selectedRow.district} 区</span> 当前在售的房源？
                </p>
                <ButtonLink
                  to={`/listings?district=${selectedRow.district}`}
                  variant="primary"
                  size="md"
                  trailingIcon={<ArrowRight size={14} strokeWidth={1.75} />}
                >
                  浏览 {selectedRow.district} 区房源
                </ButtonLink>
              </div>
            </section>
          </Reveal>
        )}

        {/* Disclaimer */}
        <p className="text-caption text-fg-tertiary max-w-prose leading-relaxed pt-4 border-t border-white/[0.06]">
          * 数据来源 · Statistik Austria 房价指数（HPI）、ImmoUnited 维也纳市场报告 2025/26、ImmoScout24 PreisAtlas Q1 2026、Der Standard Immobilien 表格。
          均为公开市场综合估算，每年更新一次。具体物业的市场价请联系我们做精确评估。
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
  district, name, avgPerSqm, yoyPct, maxValue, selected, onClick, delay,
}: {
  district: number; name: string; avgPerSqm: number; yoyPct: number
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
        <span className={[
          'text-caption tabular shrink-0 min-w-[56px] text-right',
          yoyPct >= 5 ? 'text-success' : yoyPct >= 3 ? 'text-fg-primary' : 'text-fg-secondary',
        ].join(' ')}>
          +{yoyPct.toFixed(1)}%
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

// Price bucket chart removed — was based on our own listings.
