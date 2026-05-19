import React from 'react'
import {
  X,
  MapPin,
  Calendar,
  Ruler,
  TrendingDown,
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
  official: '官方地址服务（精确）',
  manual: '人工标注（精确）',
  approximate: '区级近似坐标（演示版）',
}

interface Props {
  auction: Auction
  onClose: () => void
}

export function DetailPanel({ auction, onClose }: Props) {
  const ratio = bidRatio(auction)
  const isGoodDeal = ratio <= 0.5

  return (
    <div className="flex-shrink-0 bg-white border-b border-cream-200 shadow-md relative overflow-hidden">
      {/* Accent top bar */}
      <div className="h-0.5 bg-gradient-to-r from-gold-500 via-gold-400 to-transparent" />

      {/* Header row */}
      <div className="flex items-start justify-between gap-3 px-4 pt-3 pb-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-medium text-gold-600 bg-gold-50 border border-gold-200 px-2 py-0.5 rounded-full">
              当前选中
            </span>
            {auction.status === 'ueberbot' && (
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full border"
                style={{ background: '#FBF4DC', color: '#8C6A12', borderColor: '#D4AF37' }}
                title="此房源已成交,但仍处于 Überbotsfrist —— 出更高价仍有机会获得"
              >
                可超价 · Zuschlag mit Überbot
              </span>
            )}
            <span className="text-xs text-warm-400 font-mono">{auction.caseNumber}</span>
          </div>
          <h2 className="font-serif font-semibold text-forest-700 text-base leading-tight">
            {generateTitle(auction)}
          </h2>
          <div className="flex items-center gap-1.5 mt-1">
            <MapPin size={12} className="text-warm-400 flex-shrink-0" />
            <span className="text-xs text-warm-600">{auction.address}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 w-7 h-7 rounded-full bg-cream-100 hover:bg-cream-200 flex items-center justify-center transition-colors"
          title="关闭详情"
        >
          <X size={14} className="text-warm-500" />
        </button>
      </div>

      {/* Metrics row */}
      <div className="px-4 pb-3">
        {auction.status === 'ueberbot' && (
          <div
            className="rounded-md px-3 py-2 mb-3 text-xs leading-relaxed"
            style={{
              background: '#FBF4DC',
              color: '#5C4308',
              border: '1px solid #E8C766',
            }}
          >
            <strong>Zuschlag mit Überbot</strong> · 此房源已在拍卖中落槌成交,
            但在 <strong>Überbotsfrist</strong>(法定超价期,通常 14 天)内,
            任何人仍可向法院提交至少高出 25% 的"超价竞买"申请,获得购房机会。
            建议先联系我们核实当前期限及详细条件。
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          <BigMetric
            label="估值"
            value={formatCurrency(auction.estimatedValue)}
            icon={<TrendingDown size={13} />}
          />
          <BigMetric
            label="起拍价"
            value={formatCurrency(auction.minimumBid)}
            icon={<TrendingDown size={13} />}
            accent={isGoodDeal ? '#B8922A' : '#1D3A2A'}
          />
          <BigMetric
            label="起拍/估值"
            value={formatPercent(ratio)}
            icon={<TrendingDown size={13} />}
            accent={isGoodDeal ? '#B8922A' : '#1D3A2A'}
          />
          <BigMetric
            label="面积 / 单价"
            value={`${formatArea(auction.area)}`}
            sub={formatPerSqm(auction.pricePerSqm)}
            icon={<Ruler size={13} />}
          />
        </div>

        {/* Secondary info row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-warm-500 mb-3">
          <span className="flex items-center gap-1">
            <Calendar size={11} className="text-warm-400" />
            拍卖日期：<span className="text-warm-700 font-medium">{formatDate(auction.auctionDate)}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="text-warm-400">Vadium：</span>
            <span className="text-warm-700 font-medium">{formatCurrency(auction.deposit)}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="text-warm-400">类别：</span>
            <span className="text-warm-700 font-medium">
              {getCategoryLabel(auction.category)} · {auction.category}
            </span>
          </span>
          <span className="flex items-center gap-1">
            <Navigation size={11} className="text-warm-400" />
            <span className="text-warm-400">坐标来源：</span>
            <span className={`font-medium ${auction.geocodeSource === 'official' ? 'text-emerald-700' : 'text-amber-600'}`}>
              {GEOCODE_LABELS[auction.geocodeSource]}
            </span>
          </span>
        </div>

        {/* Ownership */}
        <div className="text-xs text-warm-500 bg-cream-50 rounded px-2.5 py-1.5 border border-cream-200 mb-2.5">
          <span className="font-medium text-warm-600">产权类型：</span>
          {auction.ownershipType}
        </div>

        {/* Summary */}
        {auction.summary && (
          <div className="bg-forest-700 bg-opacity-5 border border-forest-700 border-opacity-10 rounded-lg px-3 py-2.5 mb-2.5">
            <div className="flex items-center gap-1.5 mb-1.5">
              <FileText size={12} className="text-forest-600" />
              <span className="text-xs font-semibold text-forest-700">专家报告摘要</span>
            </div>
            <p className="text-xs text-warm-700 leading-relaxed">{auction.summary}</p>
          </div>
        )}

        {/* Risk tags */}
        {(auction.riskTags ?? []).length > 0 && (
          <div className="mb-2.5">
            <div className="flex items-center gap-1.5 mb-1.5">
              <AlertTriangle size={12} className="text-amber-500" />
              <span className="text-xs font-semibold text-warm-600">风险提示</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(auction.riskTags ?? []).map((tag) => {
                const style = getRiskTagStyle(tag)
                return (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-full font-medium"
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
        <div className="flex items-center gap-2 pt-2 border-t border-cream-200">
          {auction.detailUrl && (
            <a
              href={auction.detailUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-forest-700 text-cream-100 text-xs font-medium rounded-md hover:bg-forest-600 transition-colors"
            >
              <ExternalLink size={12} />
              司法详情页
            </a>
          )}
          {auction.pdfUrl && (
            <a
              href={auction.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-cream-300 text-warm-700 text-xs font-medium rounded-md hover:border-forest-600 hover:text-forest-700 transition-colors"
            >
              <FileDown size={12} />
              专家报告 PDF
            </a>
          )}
          {auction.shortReportUrl && (
            <a
              href={auction.shortReportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gold-300 text-gold-600 text-xs font-medium rounded-md hover:bg-gold-50 transition-colors"
            >
              <FileText size={12} />
              简版报告
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function BigMetric({
  label,
  value,
  sub,
  icon,
  accent = '#1D3A2A',
}: {
  label: string
  value: string
  sub?: string
  icon: React.ReactNode
  accent?: string
}) {
  return (
    <div className="bg-cream-50 rounded-lg px-3 py-2 border border-cream-200">
      <div className="flex items-center gap-1 mb-1" style={{ color: accent }}>
        {icon}
        <span className="text-xs text-warm-400">{label}</span>
      </div>
      <div className="text-sm font-semibold font-serif leading-tight" style={{ color: accent }}>
        {value}
      </div>
      {sub && <div className="text-xs text-warm-400 mt-0.5">{sub}</div>}
    </div>
  )
}
