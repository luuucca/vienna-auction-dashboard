import React from 'react'
import { Building2 } from 'lucide-react'
import type { Auction } from '../types/auction'

interface Props {
  auctions: Auction[]
  filteredCount: number
}

/**
 * Single-row stats strip sitting under the page header.
 * Filter-aware count on the left, total auction count on the right.
 */
export function StatsCards({ auctions, filteredCount }: Props) {
  return (
    <div className="flex-shrink-0 bg-bg-elev-1 border-b border-white/[0.06] px-4 py-2.5 sm:px-6 lg:px-10">
      <div className="max-w-content mx-auto flex items-center gap-3">
        <div className="w-7 h-7 rounded-md flex items-center justify-center bg-gold-tint border border-gold-line text-gold flex-shrink-0">
          <Building2 size={14} strokeWidth={1.5} />
        </div>
        <div className="flex items-baseline gap-2 tabular">
          <span className="text-heading-lg text-gold">{filteredCount}</span>
          <span className="text-caption text-fg-secondary">有效拍卖</span>
          <span className="text-caption text-fg-tertiary">/ 共 {auctions.length} 条</span>
        </div>
      </div>
    </div>
  )
}
