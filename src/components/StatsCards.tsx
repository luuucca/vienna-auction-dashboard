import React from 'react'
import { Building2 } from 'lucide-react'
import type { Auction } from '../types/auction'

interface Props {
  auctions: Auction[]
  filteredCount: number
}

export function StatsCards({ auctions, filteredCount }: Props) {
  return (
    <div className="flex-shrink-0 bg-cream-100 border-b border-cream-300 px-4 py-2.5 lg:px-8">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center"
          style={{ backgroundColor: '#1D3A2A14', color: '#1D3A2A' }}>
          <Building2 size={16} />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-base font-semibold font-serif" style={{ color: '#1D3A2A' }}>
            {filteredCount}
          </span>
          <span className="text-xs text-warm-500">有效拍卖</span>
          <span className="text-xs text-warm-400">/ 共 {auctions.length} 条</span>
        </div>
      </div>
    </div>
  )
}
