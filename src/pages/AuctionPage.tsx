import React, { useMemo, useState } from 'react'
import { AlertCircle, RefreshCw, Map, List, Clock } from 'lucide-react'
import { useAuctions } from '../hooks/useAuctions'
import { StatsCards } from '../components/StatsCards'
import { FilterBar } from '../components/FilterBar'
import { MapView } from '../components/MapView'
import { AuctionList } from '../components/AuctionList'
import { DetailPanel } from '../components/DetailPanel'
import type { FilterState, SortOption } from '../types/auction'
import { bidRatio } from '../utils/formatters'

function fmtTime(d: Date | null) {
  if (!d) return '—'
  return d.toLocaleString('zh-CN', {
    month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function AuctionPage() {
  const { auctions, loading, error, lastModified, reloadData, triggerScrape } = useAuctions()
  const [selectedId, setSelectedId] = useState<string>('')
  const [mobileTab, setMobileTab] = useState<'map' | 'list'>('map')
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'all',
    sortBy: 'date-asc' as SortOption,
  })

  const filteredAuctions = useMemo(() => {
    const q = filters.search.toLowerCase()
    return auctions
      .filter((a) => {
        const matchSearch =
          !q ||
          a.address.toLowerCase().includes(q) ||
          a.caseNumber.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          a.title.toLowerCase().includes(q) ||
          a.district.includes(q)
        const matchCategory =
          filters.category === 'all' || a.category === filters.category
        return matchSearch && matchCategory
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case 'date-asc':       return a.auctionDate.localeCompare(b.auctionDate)
          case 'value-desc':     return b.estimatedValue - a.estimatedValue
          case 'sqm-value-desc': return b.pricePerSqm - a.pricePerSqm
          case 'bid-asc':        return a.minimumBid - b.minimumBid
          case 'bid-ratio-asc':  return bidRatio(a) - bidRatio(b)
          default:               return 0
        }
      })
  }, [auctions, filters])

  const selectedAuction = auctions.find((a) => a.id === selectedId) ?? null

  function handleSelect(id: string) {
    setSelectedId(prev => (prev === id ? '' : id))
  }
  function handleMapPinSelect(id: string) {
    setSelectedId(prev => (prev === id ? '' : id))
    setMobileTab('list')
  }

  // ── Page chrome (sits below the global NavBar) ─────────────────────────────
  const PageHeader = () => (
    <header className="flex-shrink-0 px-4 sm:px-6 lg:px-10 pt-5 pb-4 border-b border-white/[0.06] bg-bg-base">
      <div className="max-w-content mx-auto flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-overline text-gold/80 uppercase mb-2">Ediktsdatei · Wien</p>
          <h1 className="font-serif text-heading-xl sm:text-display-lg text-fg-primary tracking-tight">
            法拍房信息汇总
          </h1>
        </div>
        <div className="flex items-center gap-3 text-caption text-fg-tertiary tabular">
          <Clock size={11} strokeWidth={1.5} />
          <span>更新于 {fmtTime(lastModified)}</span>
          <span className="text-fg-disabled">·</span>
          <span>{auctions.length} 条在拍</span>
        </div>
      </div>
    </header>
  )

  if (loading) {
    return (
      <div className="flex flex-col bg-bg-base text-fg-primary" style={{ height: '100vh', paddingTop: 64 }}>
        <PageHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-2 rounded-full animate-spin mx-auto mb-4"
              style={{ borderColor: 'var(--gold)', borderTopColor: 'transparent' }} />
            <p className="text-body text-fg-secondary">正在加载法拍数据…</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col bg-bg-base text-fg-primary" style={{ height: '100vh', paddingTop: 64 }}>
        <PageHeader />
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <AlertCircle size={36} strokeWidth={1.5} className="text-danger mx-auto mb-4" />
            <p className="text-heading-lg text-fg-primary mb-1">数据加载失败</p>
            <p className="text-body text-fg-secondary mb-5">{error}</p>
            <button
              onClick={reloadData}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-body font-semibold bg-gold text-bg-base hover:bg-gold-hover transition-colors duration-base ease-standard active:scale-[0.98]"
            >
              <RefreshCw size={14} strokeWidth={1.5} />
              重试
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col bg-bg-base text-fg-primary" style={{ height: '100vh', paddingTop: 64 }}>
      <PageHeader />
      <StatsCards auctions={auctions} filteredCount={filteredAuctions.length} />
      <FilterBar filters={filters} onChange={setFilters} resultCount={filteredAuctions.length} />

      {/* ─── Mobile layout: tab switcher ────────────────────────────────────── */}
      <div className="md:hidden flex flex-col flex-1 overflow-hidden">
        <div className="flex flex-shrink-0 border-b border-white/[0.06] bg-bg-elev-1">
          {(['map', 'list'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setMobileTab(tab)}
              className={[
                'flex-1 py-3 text-body font-medium flex items-center justify-center gap-1.5',
                'transition-[color,border-color] duration-base ease-standard',
                mobileTab === tab
                  ? 'text-fg-primary border-b-2 border-gold'
                  : 'text-fg-secondary border-b-2 border-transparent',
              ].join(' ')}
            >
              {tab === 'map' ? <Map size={14} strokeWidth={1.5} /> : <List size={14} strokeWidth={1.5} />}
              {tab === 'map' ? '地图' : `列表 (${filteredAuctions.length})`}
            </button>
          ))}
        </div>

        {mobileTab === 'map' && (
          <div className="flex-1 overflow-hidden">
            <MapView auctions={filteredAuctions} selectedId={selectedId} onSelect={handleMapPinSelect} />
          </div>
        )}

        {mobileTab === 'list' && (
          <div className="flex-1 overflow-y-auto">
            {selectedAuction && <DetailPanel auction={selectedAuction} onClose={() => setSelectedId('')} />}
            <AuctionList auctions={filteredAuctions} selectedId={selectedId} onSelect={handleSelect} />
          </div>
        )}
      </div>

      {/* ─── Desktop layout: 3/5 map + 2/5 list ────────────────────────────── */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        <div className="w-3/5 overflow-hidden border-r border-white/[0.06]">
          <MapView auctions={filteredAuctions} selectedId={selectedId} onSelect={handleSelect} />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden bg-bg-base">
          {selectedAuction && <DetailPanel auction={selectedAuction} onClose={() => setSelectedId('')} />}
          <AuctionList auctions={filteredAuctions} selectedId={selectedId} onSelect={handleSelect} />
        </div>
      </div>
    </div>
  )
}
