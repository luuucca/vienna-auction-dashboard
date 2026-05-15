import React, { useRef, useEffect } from 'react'
import {
  Calendar,
  MapPin,
  FileText,
  ExternalLink,
  FileDown,
  ChevronRight,
} from 'lucide-react'
import type { Auction } from '../types/auction'
import {
  formatCurrency,
  formatDate,
  formatArea,
  formatPercent,
  formatPerSqm,
  bidRatio,
  getRiskTagStyle,
  getCategoryLabel,
  generateTitle,
  generateCnSummary,
} from '../utils/formatters'

interface Props {
  auction: Auction
  isSelected: boolean
  onClick: () => void
}

/* ──────────────────────────────────────────────────────────────────────────
   Auction card — dark editorial. Aligns with the listings ListingCard:
   single subtle border, no shadow at rest, gold accent only on the most
   important metric (bid price + good-deal ratio).
   ────────────────────────────────────────────────────────────────────── */

function DaysChip({ dateStr }: { dateStr: string }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const auc = new Date(dateStr + 'T00:00:00')
  const diff = Math.round((auc.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diff < 0)
    return <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] text-fg-tertiary">已结束</span>
  if (diff === 0)
    return <span className="text-[10px] px-2 py-0.5 rounded-md bg-danger/15 text-danger font-semibold tabular">今日</span>
  if (diff <= 7)
    return <span className="text-[10px] px-2 py-0.5 rounded-md bg-gold-tint text-gold font-semibold border border-gold-line tabular">{diff} 天后</span>
  if (diff <= 30)
    return <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] text-fg-secondary border border-white/[0.06] tabular">{diff} 天后</span>
  return <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] text-fg-tertiary tabular">{diff} 天后</span>
}

export function AuctionCard({ auction, isSelected, onClick }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const ratio = bidRatio(auction)
  const isGoodDeal = ratio <= 0.5

  useEffect(() => {
    if (isSelected && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [isSelected])

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={[
        'group cursor-pointer rounded-xl overflow-hidden mx-3 mb-2.5',
        'bg-bg-elev-1 border',
        'transition-[border-color,transform,background] duration-base ease-standard',
        'hover:-translate-y-0.5',
        isSelected
          ? 'border-gold ring-1 ring-gold/40'
          : 'border-white/[0.06] hover:border-white/[0.12]',
      ].join(' ')}
    >
      {/* Card header — monochrome category badge, day chip */}
      <div className="px-4 py-2.5 flex items-center justify-between gap-2 bg-bg-elev-2 border-b border-white/[0.04]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md text-fg-primary bg-white/[0.06] border border-white/[0.08] flex-shrink-0">
            {getCategoryLabel(auction.category)}
          </span>
          <span className="text-caption text-fg-tertiary truncate font-mono tabular">{auction.caseNumber}</span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <DaysChip dateStr={auction.auctionDate} />
          {isSelected && <ChevronRight size={14} strokeWidth={1.5} className="text-gold" />}
        </div>
      </div>

      {/* Main content */}
      <div className="px-4 pt-3 pb-4">
        <h3 className="font-serif text-heading-md text-fg-primary leading-snug mb-1.5">
          {generateTitle(auction)}
        </h3>

        <div className="flex items-start gap-1.5 mb-3">
          <MapPin size={11} strokeWidth={1.5} className="text-fg-tertiary mt-0.5 flex-shrink-0" />
          <span className="text-caption text-fg-secondary leading-snug">{auction.address}</span>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <MetricCell label="估值"        value={formatCurrency(auction.estimatedValue)} />
          <MetricCell label="起拍价"      value={formatCurrency(auction.minimumBid)}    accent />
          <MetricCell label="起拍/估值"   value={formatPercent(ratio)}                  accent={isGoodDeal} />
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <MetricCell label="面积"    value={formatArea(auction.area)} />
          <MetricCell label="单价"    value={formatPerSqm(auction.pricePerSqm)} />
          <MetricCell label="Vadium"  value={formatCurrency(auction.deposit)} />
        </div>

        {/* Auction date */}
        <div className="flex items-center gap-1.5 mb-3">
          <Calendar size={11} strokeWidth={1.5} className="text-fg-tertiary flex-shrink-0" />
          <span className="text-caption text-fg-secondary tabular">
            拍卖日期：<span className="text-fg-primary font-medium">{formatDate(auction.auctionDate)}</span>
          </span>
        </div>

        {/* Summary */}
        <div className="mb-3 rounded-md px-3 py-2 bg-bg-elev-2 border border-white/[0.04]">
          <div className="flex items-center gap-1 mb-1">
            <FileText size={10} strokeWidth={1.5} className="text-fg-tertiary" />
            <span className="text-overline text-fg-tertiary uppercase">物业概况</span>
          </div>
          <p className="text-caption text-fg-secondary leading-relaxed">{generateCnSummary(auction)}</p>
        </div>

        {/* Risk tags */}
        {(auction.riskTags ?? []).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {(auction.riskTags ?? []).map(tag => {
              const style = getRiskTagStyle(tag)
              return (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 rounded-md font-medium"
                  style={{
                    backgroundColor: style.bg,
                    color: style.text,
                    border: `1px solid ${style.border}`,
                  }}
                >
                  {tag}
                </span>
              )
            })}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-3 border-t border-white/[0.04]">
          {auction.detailUrl && (
            <ActionButton href={auction.detailUrl} icon={<ExternalLink size={11} strokeWidth={1.5} />} label="司法详情页" primary />
          )}
          {auction.pdfUrl && (
            <ActionButton href={auction.pdfUrl}    icon={<FileDown    size={11} strokeWidth={1.5} />} label="专家报告 PDF" />
          )}
          {auction.shortReportUrl && (
            <ActionButton href={auction.shortReportUrl} icon={<FileText size={11} strokeWidth={1.5} />} label="简版报告" />
          )}
        </div>
      </div>
    </div>
  )
}

function MetricCell({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-md px-2.5 py-1.5 bg-bg-elev-2 border border-white/[0.04]">
      <div className="text-[10px] uppercase tracking-wider text-fg-tertiary leading-tight">{label}</div>
      <div
        className={[
          'text-caption font-semibold leading-tight mt-0.5 truncate tabular',
          accent ? 'text-gold' : 'text-fg-primary',
        ].join(' ')}
      >
        {value}
      </div>
    </div>
  )
}

function ActionButton({
  href, icon, label, primary = false,
}: { href: string; icon: React.ReactNode; label: string; primary?: boolean }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={e => e.stopPropagation()}
      className={[
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium',
        'transition-[background,color,border-color] duration-base ease-standard',
        'active:scale-[0.97]',
        primary
          ? 'bg-gold text-bg-base hover:bg-gold-hover'
          : 'bg-bg-elev-2 text-fg-secondary border border-white/[0.06] hover:text-fg-primary hover:border-white/16',
      ].join(' ')}
    >
      {icon}
      {label}
    </a>
  )
}
