import React, { useMemo, useState } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { useAuctions } from './hooks/useAuctions'
import { Header } from './components/Header'
import { StatsCards } from './components/StatsCards'
import { FilterBar } from './components/FilterBar'
import { MapView } from './components/MapView'
import { AuctionList } from './components/AuctionList'
import { DetailPanel } from './components/DetailPanel'
import type { FilterState, SortOption } from './types/auction'
import { bidRatio } from './utils/formatters'

export default function App() {
  const { auctions, loading, error, lastModified, refresh, reloadData, triggerScrape } = useAuctions()
  const [selectedId, setSelectedId] = useState<string>('')
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
          case 'date-asc':    return a.auctionDate.localeCompare(b.auctionDate)
          case 'value-desc':  return b.estimatedValue - a.estimatedValue
          case 'sqm-value-desc': return b.pricePerSqm - a.pricePerSqm
          case 'bid-asc':     return a.minimumBid - b.minimumBid
          case 'bid-ratio-asc': return bidRatio(a) - bidRatio(b)
          default: return 0
        }
      })
  }, [auctions, filters])

  const selectedAuction = auctions.find((a) => a.id === selectedId) ?? null

  function handleSelect(id: string) {
    setSelectedId((prev) => (prev === id ? '' : id))
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="h-screen flex flex-col bg-cream-100">
        <Header
          lastModified={lastModified}
          auctionCount={0}
          refresh={refresh}
          onRefresh={triggerScrape}
          onReloadData={reloadData}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-forest-700 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-warm-500">正在加载法拍数据…</p>
          </div>
        </div>
      </div>
    )
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="h-screen flex flex-col bg-cream-100">
        <Header
          lastModified={lastModified}
          auctionCount={0}
          refresh={refresh}
          onRefresh={triggerScrape}
          onReloadData={reloadData}
        />
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <AlertCircle size={36} className="text-red-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-warm-700 mb-1">数据加载失败</p>
            <p className="text-xs text-warm-500 mb-4">{error}</p>
            <button
              onClick={reloadData}
              className="inline-flex items-center gap-2 px-4 py-2 bg-forest-700 text-cream-100 text-sm rounded-md hover:bg-forest-600 transition-colors"
            >
              <RefreshCw size={14} />
              重试
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ── Main layout ── */
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-cream-100">
      <Header
        lastModified={lastModified}
        auctionCount={auctions.length}
        refresh={refresh}
        onRefresh={triggerScrape}
        onReloadData={reloadData}
      />

      <StatsCards auctions={auctions} filteredCount={filteredAuctions.length} />

      <FilterBar filters={filters} onChange={setFilters} resultCount={filteredAuctions.length} />

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Map (60%) */}
        <div className="hidden md:block w-3/5 overflow-hidden border-r border-cream-200">
          <MapView auctions={filteredAuctions} selectedId={selectedId} onSelect={handleSelect} />
        </div>

        {/* Right: Detail + List (40%) */}
        <div className="flex-1 md:w-2/5 flex flex-col overflow-hidden bg-cream-100">
          {selectedAuction && (
            <DetailPanel auction={selectedAuction} onClose={() => setSelectedId('')} />
          )}
          <AuctionList auctions={filteredAuctions} selectedId={selectedId} onSelect={handleSelect} />
        </div>
      </div>

      {/* Mobile map */}
      <div className="md:hidden h-[45vh] border-t border-cream-200 flex-shrink-0">
        <MapView auctions={filteredAuctions} selectedId={selectedId} onSelect={handleSelect} />
      </div>
    </div>
  )
}
