import React, { useState, useMemo } from 'react'
import { Calculator, Info, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { ButtonLink } from '../components/ui/Button'

/**
 * Austrian-context mortgage / acquisition cost calculator.
 *
 * Default rate ≈ Austrian market mid-2026 average. Editable.
 * Side-cost toggle adds Grunderwerbsteuer 3.5%, Grundbucheintragung 1.1%,
 * notary 1.5%, and *no* broker fee (we waive it for buyers).
 */

function fmtEUR(n: number): string {
  return new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

function fmtEURCents(n: number): string {
  return new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Math.round(n))
}

/** Standard fixed-rate annuity payment formula. */
function monthlyPayment(principal: number, annualRatePct: number, years: number): number {
  if (principal <= 0 || years <= 0) return 0
  const r = annualRatePct / 100 / 12
  const n = years * 12
  if (r === 0) return principal / n
  return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
}

interface Props {}

export default function MortgagePage(_: Props) {
  const [price, setPrice]           = useState<number>(450_000)
  const [downPct, setDownPct]       = useState<number>(30)
  const [years, setYears]           = useState<number>(25)
  const [rate, setRate]             = useState<number>(3.8)
  const [includeNebenkosten, setIN] = useState<boolean>(true)

  const downAmount  = price * (downPct / 100)
  const principal   = price - downAmount
  const monthly     = monthlyPayment(principal, rate, years)
  const totalPaid   = monthly * years * 12
  const totalInterest = totalPaid - principal

  // Side costs (Austrian Nebenkosten)
  const grunderwerbsteuer = price * 0.035       // 3.5%
  const grundbuch         = price * 0.011       // 1.1%
  const notar             = price * 0.015       // ~1.5% (sliding)
  const nebenkosten = grunderwerbsteuer + grundbuch + notar
  const totalCashRequired = downAmount + (includeNebenkosten ? nebenkosten : 0)

  return (
    <div className="min-h-screen bg-bg-base text-fg-primary pt-16">
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-16">

        {/* Header */}
        <div className="mb-10 max-w-prose">
          <p className="text-overline text-gold/80 uppercase mb-3">Tool · 实时计算</p>
          <h1 className="font-serif text-display-lg sm:text-display-xl text-fg-primary mb-2 tracking-tight">
            贷款计算器
          </h1>
          <p className="text-body-lg text-fg-secondary">
            按奥地利市场实际利率与税费计算月供 + 全部前期成本。所有数字实时更新。
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 items-start">

          {/* ── Inputs ─────────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6 rounded-2xl p-6 sm:p-7 bg-bg-elev-1 border border-white/[0.06]">
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
              hint="2026 年奥地利市场约 3.5–4.5%"
            />

            <label className="flex items-center gap-2.5 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={includeNebenkosten}
                onChange={e => setIN(e.target.checked)}
                className="w-4 h-4 accent-[var(--gold)]"
              />
              <span className="text-body text-fg-primary">
                包含 Nebenkosten（税费 ~6%）
              </span>
            </label>
          </div>

          {/* ── Output ────────────────────────────────────────────────── */}
          <div className="lg:col-span-3 space-y-4">

            {/* Big monthly */}
            <motion.div
              layout
              key={Math.round(monthly)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl p-7 sm:p-8 bg-bg-elev-1 border border-gold-line"
            >
              <p className="text-overline text-fg-tertiary uppercase mb-3">月供</p>
              <p className="font-serif text-display-xl sm:text-display-2xl text-gold tabular leading-none">
                {fmtEURCents(monthly)}
              </p>
              <p className="mt-4 text-caption text-fg-tertiary tabular">
                共还款 {years * 12} 期 · {fmtEUR(totalPaid)} 总额
              </p>
            </motion.div>

            {/* Breakdown grid */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="贷款本金"  value={fmtEUR(principal)}      />
              <StatCard label="总利息"    value={fmtEUR(totalInterest)}  />
              <StatCard label="首付金额"  value={fmtEUR(downAmount)}     />
              <StatCard label="总前期支出" value={fmtEUR(totalCashRequired)} accent />
            </div>

            {/* Nebenkosten breakdown */}
            {includeNebenkosten && (
              <div className="rounded-xl p-5 bg-bg-elev-1 border border-white/[0.06]">
                <div className="flex items-center gap-2 mb-3">
                  <Info size={13} strokeWidth={1.5} className="text-fg-tertiary" />
                  <h3 className="text-caption font-semibold text-fg-primary uppercase tracking-wider">
                    Nebenkosten 拆解（{fmtEUR(nebenkosten)}）
                  </h3>
                </div>
                <ul className="space-y-2 text-body text-fg-secondary tabular">
                  <li className="flex justify-between">
                    <span>Grunderwerbsteuer (3.5%) · 土地交易税</span>
                    <span className="text-fg-primary">{fmtEUR(grunderwerbsteuer)}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Grundbucheintragung (1.1%) · 房产登记</span>
                    <span className="text-fg-primary">{fmtEUR(grundbuch)}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Notar (~1.5%) · 公证 / 律师</span>
                    <span className="text-fg-primary">{fmtEUR(notar)}</span>
                  </li>
                  <li className="flex justify-between pt-2 border-t border-white/[0.05]">
                    <span className="text-fg-tertiary">买方中介费</span>
                    <span className="text-gold">免费（我们承担）</span>
                  </li>
                </ul>
              </div>
            )}

            {/* CTA */}
            <div className="rounded-xl p-5 sm:p-6 bg-gold-tint border border-gold-line flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <h3 className="text-heading-md text-fg-primary mb-1">想看具体房源？</h3>
                <p className="text-caption text-fg-secondary">
                  根据您的预算和首付，我们可以推荐 3-5 套精准匹配的房子。
                </p>
              </div>
              <ButtonLink to="/listings" variant="primary" size="md" trailingIcon={<ArrowRight size={14} strokeWidth={1.75} />}>
                浏览房源
              </ButtonLink>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="max-w-prose text-caption text-fg-tertiary mt-12 leading-relaxed">
          * 计算结果仅供参考，实际贷款条件以银行 KIM-V 标准和您的个人资质为准。
          税费按 2026 年奥地利标准估算。具体金额请咨询银行或我们的合作律所 MONOLAW。
        </p>
      </div>
    </div>
  )
}

// ─── UI sub-components ──────────────────────────────────────────────────────

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
  label: string
  value: number
  onChange: (n: number) => void
  suffix?: string
  min: number
  max: number
  step: number
  format?: (n: number) => string
  hint?: string
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

function StatCard({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl p-4 bg-bg-elev-1 border border-white/[0.06]">
      <p className="text-overline text-fg-tertiary uppercase mb-1.5">{label}</p>
      <p className={['font-serif text-heading-lg leading-tight tabular', accent ? 'text-gold' : 'text-fg-primary'].join(' ')}>
        {value}
      </p>
    </div>
  )
}
