import React from 'react'
import {
  X,
  MapPin,
  Calendar,
  Ruler,
  AlertTriangle,
  ExternalLink,
  FileDown,
  FileText,
  Navigation,
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
} from '../utils/formatters'

const GEOCODE_LABELS: Record<string, string> = {
  official:    '官方地址服务（精确）',
  manual:      '人工标注（精确）',
  approximate: '区级近似坐标',
}

interface Props {
  auction: Auction
  onClose: () => void
}

export function DetailPanel({ auction, onClose }: Props) {
  const ratio = bidRatio(auction)
  const isGoodDeal = ratio <= 0.5

  return (
    <div className="flex-shrink-0 bg-bg-elev-1 border-b border-white/[0.06] relative">
      {/* Top accent — subtle gold thread */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      {/* Header row */}
      <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gold bg-gold-tint border border-gold-line px-2 py-0.5 rounded-md">
              已选中
            </span>
            <span className="text-caption text-fg-tertiary font-mono tabular">{auction.caseNumber}</span>
          </div>
          <h2 className="font-serif text-heading-lg text-fg-primary leading-snug">
            {generateTitle(auction)}
          </h2>
          <div className="flex items-center gap-1.5 mt-1.5">
            <MapPin size={11} strokeWidth={1.5} className="text-fg-tertiary flex-shrink-0" />
            <span className="text-caption text-fg-secondary">{auction.address}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 w-8 h-8 rounded-full bg-bg-elev-2 border border-white/[0.06] hover:border-white/16 flex items-center justify-center text-fg-secondary hover:text-fg-primary transition-[color,border-color] duration-base ease-standard active:scale-95"
          title="关闭详情"
          aria-label="关闭详情"
        >
          <X size={14} strokeWidth={1.5} />
        </button>
      </div>

      <div className="px-4 pb-4">
        {/* Big metrics row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          <BigMetric label="估值"        value={formatCurrency(auction.estimatedValue)} />
          <BigMetric label="起拍价"      value={formatCurrency(auction.minimumBid)}    accent />
          <BigMetric label="起拍/估值"   value={formatPercent(ratio)}                  accent={isGoodDeal} />
          <BigMetric label="面积 / 单价" value={formatArea(auction.area)} sub={formatPerSqm(auction.pricePerSqm)} icon={<Ruler size={11} strokeWidth={1.5} />} />
        </div>

        {/* Secondary info row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-caption text-fg-secondary tabular mb-3">
          <span className="flex items-center gap-1">
            <Calendar size={10} strokeWidth={1.5} className="text-fg-tertiary" />
            <span className="text-fg-tertiary">拍卖日期：</span>
            <span className="text-fg-primary font-medium">{formatDate(auction.auctionDate)}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="text-fg-tertiary">Vadium：</span>
            <span className="text-fg-primary font-medium">{formatCurrency(auction.deposit)}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="text-fg-tertiary">类别：</span>
            <span className="text-fg-primary font-medium">{getCategoryLabel(auction.category)}</span>
          </span>
          <span className="flex items-center gap-1">
            <Navigation size={10} strokeWidth={1.5} className="text-fg-tertiary" />
            <span className="text-fg-tertiary">坐标：</span>
            <span className={auction.geocodeSource === 'official' ? 'text-success font-medium' : 'text-gold font-medium'}>
              {GEOCODE_LABELS[auction.geocodeSource]}
            </span>
          </span>
        </div>

        {/* Ownership */}
        <div className="text-caption text-fg-secondary bg-bg-elev-2 rounded-md px-3 py-1.5 border border-white/[0.04] mb-2.5">
          <span className="text-fg-tertiary">产权类型：</span>
          {auction.ownershipType}
        </div>

        {/* Summary */}
        {auction.summary && (
          <div className="rounded-md px-3 py-2.5 mb-2.5 bg-gold-tint border border-gold-line">
            <div className="flex items-center gap-1.5 mb-1.5">
              <FileText size={11} strokeWidth={1.5} className="text-gold" />
              <span className="text-overline text-gold uppercase">专家报告摘要</span>
            </div>
            <p className="text-caption text-fg-secondary leading-relaxed">{auction.summary}</p>
          </div>
        )}

        {/* Risk tags */}
        {(auction.riskTags ?? []).length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-1.5 mb-2">
              <AlertTriangle size={11} strokeWidth={1.5} className="text-gold" />
              <span className="text-overline text-fg-tertiary uppercase">风险提示</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(auction.riskTags ?? []).map(tag => {
                const style = getRiskTagStyle(tag)
                return (
                  <span
                    key={tag}
                    className="text-[10px] px-2.5 py-0.5 rounded-md font-medium"
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
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-white/[0.04]">
          {auction.detailUrl && (
            <ActionLink href={auction.detailUrl} icon={<ExternalLink size={12} strokeWidth={1.5} />} label="司法详情页" primary />
          )}
          {auction.pdfUrl && (
            <ActionLink href={auction.pdfUrl}    icon={<FileDown    size={12} strokeWidth={1.5} />} label="专家报告 PDF" />
          )}
          {auction.shortReportUrl && (
            <ActionLink href={auction.shortReportUrl} icon={<FileText size={12} strokeWidth={1.5} />} label="简版报告" />
          )}
        </div>
      </div>
    </div>
  )
}

function BigMetric({
  label, value, sub, icon, accent = false,
}: { label: string; value: string; sub?: string; icon?: React.ReactNode; accent?: boolean }) {
  return (
    <div className="rounded-md px-3 py-2 bg-bg-elev-2 border border-white/[0.04]">
      <div className="flex items-center gap-1 mb-1">
        {icon && <span className={accent ? 'text-gold' : 'text-fg-tertiary'}>{icon}</span>}
        <span className="text-[10px] uppercase tracking-wider text-fg-tertiary">{label}</span>
      </div>
      <div className={['font-serif text-heading-md leading-tight tabular', accent ? 'text-gold' : 'text-fg-primary'].join(' ')}>
        {value}
      </div>
      {sub && <div className="text-caption text-fg-tertiary mt-0.5 tabular">{sub}</div>}
    </div>
  )
}

function ActionLink({
  href, icon, label, primary = false,
}: { href: string; icon: React.ReactNode; label: string; primary?: boolean }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={[
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-caption font-medium',
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
