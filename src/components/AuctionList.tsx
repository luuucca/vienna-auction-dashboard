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
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <Inbox size={28} strokeWidth={1.5} className="text-fg-tertiary mb-3" />
        <div className="text-heading-md text-fg-primary mb-1">暂无匹配记录</div>
        <div className="text-caption text-fg-secondary">调整搜索条件或清除筛选再试</div>
      </div>
    )
  }

  return (
    <div className="auction-list-scroll overflow-y-auto flex-1 pt-3 pb-4">
      {auctions.map(auction => (
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
