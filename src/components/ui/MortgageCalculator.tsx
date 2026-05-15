import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Info, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

/**
 * Reusable Austrian mortgage / acquisition-cost calculator.
 *
 *   - `full`    variant: 2-column layout (inputs + outputs), used by /mortgage
 *   - `compact` variant: collapsed, single column, used on listing detail pages
 *
 * Austrian Nebenkosten included:
 *   - Grunderwerbsteuer       3.5%
 *   - Grundbucheintragung     1.1%
 *   - Notar / Anwalt          ~1.5%
 *   - Maklerprovision (买方)  3% + 20% VAT  =  3.6%
 */

interface Props {
  initialPrice?: number
  variant?: 'full' | 'compact'
  /** Hide the inline link to the full calculator (used on /mortgage itself) */
  hideFullLink?: boolean
}

function fmtEUR(n: number): string {
  return new Intl.NumberFormat('de-AT', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
  }).format(Math.round(n))
}

function monthlyPayment(principal: number, annualRatePct: number, years: number): number {
  if (principal <= 0 || years <= 0) return 0
  const r = annualRatePct / 100 / 12
  const n = years * 12
  if (r === 0) return principal / n
  return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
}

export function MortgageCalculator({ initialPrice = 450_000, variant = 'full', hideFullLink = false }: Props) {
  const [price, setPrice]   = useState<number>(initialPrice)
  const [downPct, setDownPct] = useState<number>(30)
  const [years, setYears]   = useState<number>(25)
  const [rate, setRate]     = useState<number>(3.8)
  const [includeNK, setIN]  = useState<boolean>(true)

  const downAmount    = price * (downPct / 100)
  const principal     = price - downAmount
  const monthly       = monthlyPayment(principal, rate, years)
  const totalPaid     = monthly * years * 12
  const totalInterest = totalPaid - principal

  const grunderwerb  = price * 0.035       // 3.5%
  const grundbuch    = price * 0.011       // 1.1%
  const notar        = price * 0.015       // ~1.5%
  const makler       = price * 0.03 * 1.2  // 3% × 1.2 (VAT) = 3.6%
  const nebenkosten  = grunderwerb + grundbuch + notar + makler

  const totalCash = downAmount + (includeNK ? nebenkosten : 0)

  const isCompact = variant === 'compact'

  return (
    <div className={isCompact ? 'space-y-4' : 'grid lg:grid-cols-5 gap-8 items-start'}>

      {/* ── Inputs ─────────────────────────────────────────────────────── */}
      <div className={[
        isCompact
          ? 'rounded-xl p-5 bg-bg-elev-1 border border-white/[0.06] space-y-5'
          : 'lg:col-span-2 space-y-6 rounded-2xl p-6 sm:p-7 bg-bg-elev-1 border border-white/[0.06]',
      ].join(' ')}>

        <NumberInput
          label="房价"
          suffix="€"
          value={price}
          onChange={setPrice}
          step={10_000}
          min={50_000}
          max={5_000_000}
        />

        <SliderWithLabel
          label="首付比例"
          suffix="%"
          value={downPct}
          onChange={setDownPct}
          min={10}
          max={100}
          step={5}
          hint={fmtEUR(downAmount)}
        />

        <SliderWithLabel
          label="贷款年限"
          suffix="年"
          value={years}
          onChange={setYears}
          min={5}
          max={30}
          step={5}
        />

        <SliderWithLabel
          label="贷款利率"
          suffix="%"
          value={rate}
          onChange={setRate}
          min={1.5}
          max={6.5}
          step={0.1}
          format={n => n.toFixed(1)}
          hint={isCompact ? undefined : '2026 年奥地利市场约 3.5–4.5%'}
        />

        <label className="flex items-center gap-2.5 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={includeNK}
            onChange={e => setIN(e.target.checked)}
            className="w-4 h-4 accent-[var(--gold)]"
          />
          <span className="text-body text-fg-primary">
            包含 Nebenkosten（税费 + 中介 ~9%）
          </span>
        </label>
      </div>

      {/* ── Output ────────────────────────────────────────────────────── */}
      <div className={isCompact ? 'space-y-3' : 'lg:col-span-3 space-y-4'}>

        {/* Big monthly */}
        <motion.div
          layout
          key={Math.round(monthly)}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className={[
            'rounded-xl bg-bg-elev-1 border border-gold-line',
            isCompact ? 'p-5' : 'p-7 sm:p-8 rounded-2xl',
          ].join(' ')}
        >
          <p className="text-overline text-fg-tertiary uppercase mb-2">月供</p>
          <p className={[
            'font-serif text-gold tabular leading-none',
            isCompact ? 'text-display-lg' : 'text-display-xl sm:text-display-2xl',
          ].join(' ')}>
            {fmtEUR(monthly)}
          </p>
          <p className="mt-3 text-caption text-fg-tertiary tabular">
            共还款 {years * 12} 期 · {fmtEUR(totalPaid)} 总额
          </p>
        </motion.div>

        {/* Breakdown */}
        <div className="grid grid-cols-2 gap-2.5">
          <StatCard label="贷款本金"   value={fmtEUR(principal)}    compact={isCompact} />
          <StatCard label="总利息"     value={fmtEUR(totalInterest)} compact={isCompact} />
          <StatCard label="首付金额"   value={fmtEUR(downAmount)}    compact={isCompact} />
          <StatCard label="总前期支出" value={fmtEUR(totalCash)}     compact={isCompact} accent />
        </div>

        {/* Nebenkosten breakdown (collapsed by default in compact) */}
        {includeNK && (
          <div className="rounded-xl p-5 bg-bg-elev-1 border border-white/[0.06]">
            <div className="flex items-center gap-2 mb-3">
              <Info size={13} strokeWidth={1.5} className="text-fg-tertiary" />
              <h3 className="text-caption font-semibold text-fg-primary uppercase tracking-wider">
                Nebenkosten 拆解（{fmtEUR(nebenkosten)}）
              </h3>
            </div>
            <ul className="space-y-2 text-body text-fg-secondary tabular">
              <Row label="Grunderwerbsteuer (3.5%) · 土地交易税"        value={fmtEUR(grunderwerb)} />
              <Row label="Grundbucheintragung (1.1%) · 房产登记"        value={fmtEUR(grundbuch)} />
              <Row label="Notar (~1.5%) · 公证 / 律师"                  value={fmtEUR(notar)} />
              <Row label="Maklerprovision (3% + 20% VAT) · 买方中介费"  value={fmtEUR(makler)} />
            </ul>
          </div>
        )}

        {/* Link to full page (compact only) */}
        {isCompact && !hideFullLink && (
          <Link
            to="/mortgage"
            className="inline-flex items-center gap-1.5 text-caption text-gold hover:text-gold-hover transition-colors duration-base ease-standard"
          >
            打开完整版计算器
            <ArrowRight size={12} strokeWidth={1.5} />
          </Link>
        )}
      </div>
    </div>
  )
}

// ─── Sub-components ─────────────────────────────────────────────────────────
function Row({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex justify-between gap-3">
      <span className="text-fg-secondary">{label}</span>
      <span className="text-fg-primary shrink-0">{value}</span>
    </li>
  )
}

function NumberInput({
  label, value, onChange, suffix, step, min, max,
}: { label: string; value: number; onChange: (n: number) => void; suffix?: string; step: number; min: number; max: number }) {
  return (
    <div>
      <label className="block text-overline text-fg-tertiary uppercase mb-2">{label}</label>
      <div className="relative">
        <input
          type="number"
          value={value}
          step={step}
          min={min}
          max={max}
          onChange={e => onChange(Math.max(min, Math.min(max, Number(e.target.value) || 0)))}
          className="w-full pl-4 pr-10 py-3 text-heading-md text-fg-primary tabular bg-bg-elev-2 border border-white/[0.08] rounded-md outline-none transition-[border-color] duration-base ease-standard focus:border-gold-line"
        />
        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-fg-tertiary pointer-events-none">{suffix}</span>
        )}
      </div>
    </div>
  )
}

function SliderWithLabel({
  label, value, onChange, suffix, min, max, step, format, hint,
}: {
  label: string; value: number; onChange: (n: number) => void
  suffix?: string; min: number; max: number; step: number
  format?: (n: number) => string; hint?: string
}) {
  const display = format ? format(value) : String(value)
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label className="text-overline text-fg-tertiary uppercase">{label}</label>
        <span className="text-heading-md text-gold tabular">
          {display}{suffix && <span className="text-caption text-fg-tertiary ml-1">{suffix}</span>}
        </span>
      </div>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-[var(--gold)]"
      />
      {hint && <p className="mt-1 text-caption text-fg-tertiary tabular">{hint}</p>}
    </div>
  )
}

function StatCard({ label, value, accent = false, compact = false }: { label: string; value: string; accent?: boolean; compact?: boolean }) {
  return (
    <div className={[
      'rounded-xl bg-bg-elev-1 border border-white/[0.06]',
      compact ? 'p-3.5' : 'p-4',
    ].join(' ')}>
      <p className="text-overline text-fg-tertiary uppercase mb-1.5">{label}</p>
      <p className={[
        'font-serif leading-tight tabular',
        compact ? 'text-heading-md' : 'text-heading-lg',
        accent ? 'text-gold' : 'text-fg-primary',
      ].join(' ')}>
        {value}
      </p>
    </div>
  )
}
