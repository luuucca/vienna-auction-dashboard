import React from 'react'
import { Inbox } from 'lucide-react'
import type { Auction } from '../types/auction'
import { AuctionCard } from './AuctionCard'

interface Props {
  auctions: Auction[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function AuctionList({ auctions, selectedId, onSelect }: Props) {
  if (auctions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <Inbox size={32} className="text-warm-300 mb-3" />
        <div className="text-sm font-medium text-warm-500">暂无匹配记录</div>
        <div className="text-xs text-warm-400 mt-1">请调整搜索条件或清除筛选</div>
      </div>
    )
  }

  return (
    <div className="auction-list-scroll overflow-y-auto flex-1 pt-2 pb-4">
      {auctions.map((auction) => (
        <AuctionCard
          key={auction.id}
          auction={auction}
          isSelected={auction.id === selectedId}
          onClick={() => onSelect(auction.id === selectedId ? '' : auction.id)}
        />
      ))}
    </div>
  )
}
