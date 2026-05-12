import React from 'react'
import { Building2, TrendingUp, BarChart3, MapPin } from 'lucide-react'
import type { Auction } from '../types/auction'
import { formatCurrency, formatPercent, bidRatio } from '../utils/formatters'

interface Props {
  auctions: Auction[]
  filteredCount: number
}

interface StatCard {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  accent: string
}

export function StatsCards({ auctions, filteredCount }: Props) {
  const totalValue = auctions.reduce((s, a) => s + a.estimatedValue, 0)
  const avgRatio =
    auctions.length > 0
      ? auctions.reduce((s, a) => s + bidRatio(a), 0) / auctions.length
      : 0
  const geoCount = auctions.filter((a) => a.geocodeSource !== 'approximate').length

  const cards: StatCard[] = [
    {
      icon: <Building2 size={18} />,
      label: '有效拍卖数量',
      value: String(filteredCount),
      sub: `共 ${auctions.length} 条数据`,
      accent: '#1D3A2A',
    },
    {
      icon: <TrendingUp size={18} />,
      label: '估值总额',
      value: formatCurrency(totalValue),
      sub: '所有资产合计',
      accent: '#1D3A2A',
    },
    {
      icon: <BarChart3 size={18} />,
      label: '平均起拍/估值',
      value: formatPercent(avgRatio),
      sub: '低于 50% 为折价拍卖',
      accent: avgRatio < 0.5 ? '#B8922A' : '#1D3A2A',
    },
    {
      icon: <MapPin size={18} />,
      label: '精确落点数量',
      value: String(geoCount),
      sub: `共 ${auctions.length} 处（演示版均为近似坐标）`,
      accent: '#1D3A2A',
    },
  ]

  return (
    <div className="flex-shrink-0 bg-cream-100 border-b border-cream-300 px-4 py-3 lg:px-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-lg px-4 py-3 border border-cream-200 shadow-card flex items-start gap-3"
          >
            <div
              className="flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center mt-0.5"
              style={{ backgroundColor: card.accent + '14', color: card.accent }}
            >
              {card.icon}
            </div>
            <div className="min-w-0">
              <div className="text-xs text-warm-500 font-medium truncate">{card.label}</div>
              <div
                className="text-base lg:text-lg font-semibold font-serif leading-tight mt-0.5 truncate"
                style={{ color: card.accent }}
              >
                {card.value}
              </div>
              <div className="text-xs text-warm-400 mt-0.5 leading-tight">{card.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
