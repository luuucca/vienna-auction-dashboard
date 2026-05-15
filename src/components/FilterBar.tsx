import React from 'react'
import { Search, ChevronDown, X } from 'lucide-react'
import type { FilterState, SortOption, AuctionCategory } from '../types/auction'
import { getCategoryLabel } from '../utils/formatters'

const CATEGORIES: AuctionCategory[] = [
  'Eigentumswohnung',
  'Wohnungseigentumsobjekt',
  'Einfamilienhaus',
  'Mehrfamilienhaus',
  'Mietshaus',
  'gewerbliche Liegenschaft',
  'Sonstiges',
]

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'date-asc',       label: '拍卖日期最近'   },
  { value: 'value-desc',     label: '估价最高'       },
  { value: 'sqm-value-desc', label: '每平米估价最高' },
  { value: 'bid-asc',        label: '起拍价最低'     },
  { value: 'bid-ratio-asc',  label: '起拍/估值最低'  },
]

interface Props {
  filters: FilterState
  onChange: (filters: FilterState) => void
  resultCount: number
}

export function FilterBar({ filters, onChange, resultCount }: Props) {
  const hasActiveFilter = filters.search !== '' || filters.category !== 'all'

  return (
    <div className="flex-shrink-0 bg-bg-base border-b border-white/[0.06] px-4 py-3 sm:px-6 lg:px-10">
      <div className="max-w-content mx-auto flex flex-wrap items-center gap-2.5">

        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search size={14} strokeWidth={1.5}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-tertiary pointer-events-none" />
          <input
            type="text"
            placeholder="搜索地址、案号、类别…"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="w-full pl-9 pr-8 py-1.5 text-body bg-bg-elev-2 border border-white/[0.08] rounded-md
                       placeholder:text-fg-disabled text-fg-primary
                       outline-none transition-[border-color] duration-base ease-standard
                       focus:border-gold-line"
          />
          {filters.search && (
            <button
              onClick={() => onChange({ ...filters, search: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-fg-tertiary hover:text-fg-primary transition-colors duration-base ease-standard"
            >
              <X size={13} strokeWidth={1.5} />
            </button>
          )}
        </div>

        {/* Category filter */}
        <div className="relative">
          <select
            value={filters.category}
            onChange={(e) => onChange({ ...filters, category: e.target.value })}
            className="appearance-none pl-3 pr-8 py-1.5 text-body bg-bg-elev-2 border border-white/[0.08] rounded-md
                       text-fg-primary cursor-pointer
                       outline-none transition-[border-color] duration-base ease-standard
                       hover:border-white/16 focus:border-gold-line"
          >
            <option value="all" style={{ background: '#1a1a1a', color: '#ededed' }}>全部类别</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat} style={{ background: '#1a1a1a', color: '#ededed' }}>
                {getCategoryLabel(cat)} · {cat}
              </option>
            ))}
          </select>
          <ChevronDown size={13} strokeWidth={1.5}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-fg-tertiary pointer-events-none" />
        </div>

        {/* Clear filters */}
        {hasActiveFilter && (
          <button
            onClick={() => onChange({ ...filters, search: '', category: 'all' })}
            className="flex items-center gap-1 px-2.5 py-1.5 text-caption text-fg-secondary border border-white/[0.08] rounded-md hover:text-fg-primary hover:border-white/16 transition-[color,border-color] duration-base ease-standard"
          >
            <X size={12} strokeWidth={1.5} />
            清除
          </button>
        )}

        {/* Sort + Result count — right side */}
        <div className="ml-auto flex items-center gap-2 flex-shrink-0">
          <div className="relative">
            <select
              value={filters.sortBy}
              onChange={(e) => onChange({ ...filters, sortBy: e.target.value as SortOption })}
              className="appearance-none pl-3 pr-8 py-1.5 text-body bg-bg-elev-2 border border-white/[0.08] rounded-md
                         text-fg-primary cursor-pointer
                         outline-none transition-[border-color] duration-base ease-standard
                         hover:border-white/16 focus:border-gold-line"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value} style={{ background: '#1a1a1a', color: '#ededed' }}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown size={13} strokeWidth={1.5}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-fg-tertiary pointer-events-none" />
          </div>
          <span className="text-caption text-fg-tertiary tabular hidden sm:inline">
            显示 <span className="font-semibold text-fg-primary">{resultCount}</span> 条
          </span>
        </div>
      </div>
    </div>
  )
}
