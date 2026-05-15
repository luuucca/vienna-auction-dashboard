import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Gavel, ArrowRight, SlidersHorizontal, X, ChevronDown, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { ListingCard as SharedListingCard } from '../components/ui/ListingCard'
import { ButtonLink } from '../components/ui/Button'

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface Listing {
  id: string
  objektnummer: string
  title: string
  type: string
  typeName: string
  forRent: boolean
  price: number
  priceOnRequest: boolean
  currency: string
  rooms: number
  sqm: number
  plotSqm: number
  buildYear: number
  address: { street: string; plz: string; city: string; district: string; state: string; raw: string }
  location: { lat: number; lng: number }
  images: string[]
  coverImage: string | null
  imageCount: number
}

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function districtFromText(text: string): number {
  const m = String(text || '').match(/Wien\s+(\d+)/i)
  return m ? parseInt(m[1]) : 0
}

function fmtPrice(price: number, forRent: boolean, onRequest: boolean) {
  if (onRequest || !price) return '价格面议'
  if (forRent) return `€ ${price.toLocaleString('de-AT')}/月`
  if (price >= 1000000) return `€ ${(price / 1000000).toFixed(2).replace(/\.?0+$/, '')} Mio.`
  return `€ ${(price / 1000).toFixed(0)}K`
}

const BUY_PRICE_RANGES = [
  { label: '全部价格', min: 0, max: Infinity },
  { label: '< €500K', min: 0, max: 500000 },
  { label: '€500K – €1M', min: 500000, max: 1000000 },
  { label: '€1M – €2M', min: 1000000, max: 2000000 },
  { label: '> €2M', min: 2000000, max: Infinity },
]
const RENT_PRICE_RANGES = [
  { label: '全部价格', min: 0, max: Infinity },
  { label: '< €1,500/月', min: 0, max: 1500 },
  { label: '€1,500 – €3,000/月', min: 1500, max: 3000 },
  { label: '> €3,000/月', min: 3000, max: Infinity },
]
const ROOM_OPTIONS = ['全部', '1间', '2间', '3间', '4间+']
const TYPE_OPTIONS = ['全部类型', '公寓', '别墅', '联排', '出租楼', '商铺', '车库']

const SORT_OPTIONS = [
  { key: 'default',    label: '默认排序' },
  { key: 'price-asc',  label: '价格从低到高' },
  { key: 'price-desc', label: '价格从高到低' },
  { key: 'sqm-desc',   label: '面积从大到小' },
  { key: 'sqm-asc',    label: '面积从小到大' },
  { key: 'rooms-desc', label: '房间数从多到少' },
  { key: 'newest',     label: '最新房源' },
] as const
type SortKey = typeof SORT_OPTIONS[number]['key']

function FilterSelect({
  value, onChange, options,
}: { value: string; onChange: (v: string) => void; options: string[] }) {
  const isDefault = value === options[0]
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={[
          'appearance-none w-full pl-4 pr-9 py-2.5 rounded-lg text-body font-medium',
          'bg-bg-elev-2 border border-white/[0.08]',
          'cursor-pointer transition-[border-color,color] duration-base ease-standard',
          'hover:border-white/16 focus:border-gold-line focus:outline-none',
          isDefault ? 'text-fg-tertiary' : 'text-fg-primary',
        ].join(' ')}
      >
        {options.map(o => (
          <option key={o} value={o} style={{ background: '#1a1a1a', color: '#ededed' }}>{o}</option>
        ))}
      </select>
      <ChevronDown
        size={14}
        strokeWidth={1.5}
        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-fg-tertiary"
      />
    </div>
  )
}

// Local wrapper around the shared ListingCard that keeps the
// staggered enter/exit animation the list grid relies on.
function ListingCard({ listing }: { listing: Listing }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      <SharedListingCard listing={listing as any} />
    </motion.div>
  )
}

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'buy' | 'rent'>('buy')
  const [priceIdx, setPriceIdx] = useState(0)
  const [district, setDistrict] = useState('全部区域')
  const [rooms, setRooms] = useState('全部')
  const [propType, setPropType] = useState('全部类型')
  const [sortBy, setSortBy] = useState<SortKey>('default')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [pageSize, setPageSize] = useState(20)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    let cancelled = false
    fetch('/api/listings')
      .then(r => r.json())
      .then(data => {
        if (cancelled) return
        if (data.error) setError(data.error)
        else setListings(data.listings || [])
        setLoading(false)
      })
      .catch(err => {
        if (!cancelled) { setError(String(err)); setLoading(false) }
      })
    return () => { cancelled = true }
  }, [])

  const districts = useMemo(() => {
    const set = new Set<number>()
    listings.forEach(l => {
      const d = districtFromText(l.address.district)
      if (d > 0) set.add(d)
    })
    return ['全部区域', ...Array.from(set).sort((a, b) => a - b).map(d => `${d}区`)]
  }, [listings])

  const priceRanges = mode === 'buy' ? BUY_PRICE_RANGES : RENT_PRICE_RANGES
  const priceLabel = priceRanges[priceIdx]?.label ?? '全部价格'

  const filtered = useMemo(() => {
    const { min, max } = priceRanges[priceIdx] ?? { min: 0, max: Infinity }
    const arr = listings.filter(l => {
      if (l.forRent !== (mode === 'rent')) return false
      if (!l.priceOnRequest && (l.price < min || l.price > max)) return false
      if (district !== '全部区域') {
        const d = districtFromText(l.address.district)
        if (`${d}区` !== district) return false
      }
      if (rooms !== '全部' && l.rooms > 0) {
        const n = parseInt(rooms)
        if (rooms.endsWith('+')) { if (l.rooms < n) return false }
        else if (l.rooms !== n) return false
      }
      if (propType !== '全部类型' && (l as any).typeName !== propType) return false
      return true
    })

    if (sortBy === 'default') return arr
    const sorted = [...arr]
    switch (sortBy) {
      case 'price-asc':
        sorted.sort((a, b) => {
          if (a.priceOnRequest && !b.priceOnRequest) return 1
          if (!a.priceOnRequest && b.priceOnRequest) return -1
          return (a.price || 0) - (b.price || 0)
        }); break
      case 'price-desc':
        sorted.sort((a, b) => {
          if (a.priceOnRequest && !b.priceOnRequest) return 1
          if (!a.priceOnRequest && b.priceOnRequest) return -1
          return (b.price || 0) - (a.price || 0)
        }); break
      case 'sqm-desc':
        sorted.sort((a, b) => (b.sqm || 0) - (a.sqm || 0)); break
      case 'sqm-asc':
        sorted.sort((a, b) => (a.sqm || 0) - (b.sqm || 0)); break
      case 'rooms-desc':
        sorted.sort((a, b) => (b.rooms || 0) - (a.rooms || 0)); break
      case 'newest':
        sorted.sort((a, b) => (b.id || '').localeCompare(a.id || '')); break
    }
    return sorted
  }, [listings, mode, priceIdx, district, rooms, propType, sortBy])

  function resetFilters() {
    setPriceIdx(0); setDistrict('全部区域'); setRooms('全部'); setPropType('全部类型')
  }
  const hasFilters = priceIdx !== 0 || district !== '全部区域' || rooms !== '全部' || propType !== '全部类型'

  // ── Pagination ────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const paginated = useMemo(
    () => filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filtered, safePage, pageSize]
  )

  // Reset to page 1 whenever the filter or sort or page size changes
  useEffect(() => { setCurrentPage(1) }, [mode, priceIdx, district, rooms, propType, sortBy, pageSize])

  // Scroll to top whenever the page changes (better UX)
  useEffect(() => {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [safePage])

  // Build a compact page-number list: 1 … (current±2) … last
  function pageList(): (number | '...')[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages: (number | '...')[] = [1]
    const start = Math.max(2, safePage - 2)
    const end = Math.min(totalPages - 1, safePage + 2)
    if (start > 2) pages.push('...')
    for (let i = start; i <= end; i++) pages.push(i)
    if (end < totalPages - 1) pages.push('...')
    pages.push(totalPages)
    return pages
  }

  return (
    <div className="min-h-screen bg-bg-base text-fg-primary pt-16">

      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-10 pt-12 pb-8 border-b border-white/[0.06]">
        <div className="max-w-content mx-auto">
          <p className="text-overline text-gold/80 mb-3 uppercase">Listings</p>
          <h1 className="font-serif text-display-lg sm:text-display-xl text-fg-primary mb-2 tracking-tight">
            维也纳精选房源
          </h1>
          <p className="text-body text-fg-secondary">
            真实在售房源 · 共 <span className="text-fg-primary font-medium tabular">{listings.length}</span> 套
          </p>
        </div>
      </div>

      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-10 py-10">

        {/* Filter panel — no glassmorphism */}
        <div className="mb-10 rounded-2xl p-5 bg-bg-elev-1 border border-white/[0.06]">

          <div className="flex items-center gap-3 mb-5">
            <div className="flex rounded-lg overflow-hidden p-0.5 bg-bg-elev-2 border border-white/[0.06]">
              {(['buy', 'rent'] as const).map(m => (
                <button key={m}
                  onClick={() => { setMode(m); setPriceIdx(0) }}
                  className={[
                    'px-5 py-1.5 rounded-md text-body font-semibold',
                    'transition-[background,color] duration-base ease-standard',
                    mode === m
                      ? 'bg-gold text-bg-base'
                      : 'bg-transparent text-fg-secondary hover:text-fg-primary',
                  ].join(' ')}
                >
                  {m === 'buy' ? '购买' : '出租'}
                </button>
              ))}
            </div>
            <button onClick={() => setFiltersOpen(o => !o)}
              className={[
                'sm:hidden ml-auto flex items-center gap-1.5 px-4 py-2 rounded-lg text-body',
                'transition-[background,color,border-color] duration-base ease-standard',
                filtersOpen
                  ? 'bg-gold-tint text-gold border border-gold-line'
                  : 'bg-bg-elev-2 text-fg-secondary border border-white/[0.06]',
              ].join(' ')}>
              <SlidersHorizontal size={14} strokeWidth={1.5} />
              筛选
            </button>
            {hasFilters && (
              <button onClick={resetFilters}
                className="ml-auto hidden sm:flex items-center gap-1.5 text-caption text-fg-tertiary hover:text-fg-secondary transition-colors duration-base ease-standard">
                <X size={13} strokeWidth={1.5} /> 清除筛选
              </button>
            )}
          </div>

          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 ${!filtersOpen ? 'hidden sm:grid' : 'grid'}`}>
            <div>
              <label className="block text-overline text-fg-tertiary mb-2 uppercase">类型</label>
              <FilterSelect value={propType} onChange={setPropType} options={TYPE_OPTIONS} />
            </div>
            <div>
              <label className="block text-overline text-fg-tertiary mb-2 uppercase">总价</label>
              <FilterSelect
                value={priceLabel}
                onChange={v => setPriceIdx(priceRanges.findIndex(r => r.label === v))}
                options={priceRanges.map(r => r.label)}
              />
            </div>
            <div>
              <label className="block text-overline text-fg-tertiary mb-2 uppercase">区域</label>
              <FilterSelect value={district} onChange={setDistrict} options={districts} />
            </div>
            <div>
              <label className="block text-overline text-fg-tertiary mb-2 uppercase">房间数量</label>
              <div className="flex gap-1.5">
                {ROOM_OPTIONS.map(r => (
                  <button
                    key={r}
                    onClick={() => setRooms(r)}
                    className={[
                      'flex-1 py-2.5 rounded-lg text-caption font-medium',
                      'transition-[background,color,border-color] duration-base ease-standard',
                      'active:scale-[0.98]',
                      rooms === r
                        ? 'bg-gold text-bg-base border border-gold'
                        : 'bg-bg-elev-2 text-fg-secondary border border-white/[0.06] hover:text-fg-primary hover:border-white/16',
                    ].join(' ')}
                  >{r}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <p className="text-body text-fg-secondary tabular">
            找到 <span className="text-fg-primary font-medium">{filtered.length}</span> 套{mode === 'buy' ? '购买' : '出租'}房源
            {filtered.length > 0 && (
              <span className="ml-2 text-fg-tertiary">
                · 第 {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filtered.length)} 条
              </span>
            )}
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            {/* Page size selector */}
            <div className="flex items-center gap-2">
              <span className="text-overline text-fg-tertiary uppercase">每页</span>
              <div className="relative">
                <select
                  value={pageSize}
                  onChange={e => setPageSize(Number(e.target.value))}
                  className="appearance-none pl-3 pr-8 py-1.5 rounded-md text-caption font-medium bg-bg-elev-2 border border-white/[0.06] text-fg-secondary cursor-pointer transition-[border-color,color] duration-base ease-standard hover:text-fg-primary hover:border-white/16 focus:border-gold-line focus:outline-none"
                >
                  {[10, 20, 50, 100].map(n => (
                    <option key={n} value={n} style={{ background: '#1a1a1a', color: '#ededed' }}>{n} 条</option>
                  ))}
                </select>
                <ChevronDown size={12} strokeWidth={1.5}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-fg-tertiary" />
              </div>
            </div>

            {/* Sort selector */}
            <div className="flex items-center gap-2">
              <span className="text-overline text-fg-tertiary uppercase">排序</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as SortKey)}
                  className={[
                    'appearance-none pl-3 pr-8 py-1.5 rounded-md text-caption font-medium',
                    'bg-bg-elev-2 border border-white/[0.06] cursor-pointer',
                    'transition-[border-color,color] duration-base ease-standard',
                    'hover:text-fg-primary hover:border-white/16 focus:border-gold-line focus:outline-none',
                    sortBy === 'default' ? 'text-fg-secondary' : 'text-gold',
                  ].join(' ')}
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.key} value={o.key} style={{ background: '#1a1a1a', color: '#ededed' }}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown size={12} strokeWidth={1.5}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-fg-tertiary" />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-fg-secondary">
            <Loader2 size={28} strokeWidth={1.5} className="animate-spin mb-3 text-gold" />
            <p className="text-body">加载中…</p>
          </div>
        ) : error ? (
          <div className="text-center py-24">
            <h3 className="text-heading-lg text-fg-primary mb-2">加载失败</h3>
            <p className="text-body text-fg-secondary">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <h3 className="text-heading-lg text-fg-primary mb-2">暂无匹配房源</h3>
            <p className="text-body text-fg-secondary mb-4">调整筛选条件再试一次</p>
            <button
              onClick={resetFilters}
              className="text-body text-gold hover:underline underline-offset-4"
            >
              清除所有筛选
            </button>
          </div>
        ) : (
          <>
            <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <AnimatePresence mode="popLayout">
                {paginated.map(l => <ListingCard key={l.id} listing={l} />)}
              </AnimatePresence>
            </motion.div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-1.5 flex-wrap">
                {/* Prev */}
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className={[
                    'flex items-center gap-1 px-3.5 py-2 rounded-md text-caption font-medium',
                    'bg-bg-elev-2 border border-white/[0.06] text-fg-secondary',
                    'transition-[background,color,border-color,opacity] duration-base ease-standard',
                    'hover:text-fg-primary hover:border-white/16 active:scale-[0.98]',
                    'disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100',
                  ].join(' ')}>
                  <ChevronLeft size={13} strokeWidth={1.5} /> 上一页
                </button>

                {/* Page numbers */}
                {pageList().map((p, i) =>
                  p === '...' ? (
                    <span key={`dots-${i}`} className="px-2 text-caption text-fg-tertiary">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p as number)}
                      className={[
                        'min-w-[36px] px-3 py-2 rounded-md text-caption font-semibold tabular',
                        'transition-[background,color,border-color] duration-base ease-standard',
                        'active:scale-[0.96]',
                        p === safePage
                          ? 'bg-gold text-bg-base border border-gold'
                          : 'bg-bg-elev-2 border border-white/[0.06] text-fg-secondary hover:text-fg-primary hover:border-white/16',
                      ].join(' ')}>
                      {p}
                    </button>
                  )
                )}

                {/* Next */}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className={[
                    'flex items-center gap-1 px-3.5 py-2 rounded-md text-caption font-medium',
                    'bg-bg-elev-2 border border-white/[0.06] text-fg-secondary',
                    'transition-[background,color,border-color,opacity] duration-base ease-standard',
                    'hover:text-fg-primary hover:border-white/16 active:scale-[0.98]',
                    'disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100',
                  ].join(' ')}>
                  下一页 <ChevronRight size={13} strokeWidth={1.5} />
                </button>
              </div>
            )}
          </>
        )}

        {/* Auction CTA */}
        <div className="mt-16 rounded-2xl p-7 flex flex-col sm:flex-row items-center gap-5 bg-gold-tint border border-gold-line">
          <div className="flex-1">
            <h3 className="text-heading-lg text-fg-primary mb-1">寻找更低价格？</h3>
            <p className="text-body text-fg-secondary">
              法拍房起拍价最低为评估价 50%，一手数据尽在法拍房信息汇总
            </p>
          </div>
          <ButtonLink
            to="/auction"
            variant="primary"
            size="md"
            leadingIcon={<Gavel size={14} strokeWidth={1.75} />}
            trailingIcon={<ArrowRight size={13} strokeWidth={1.75} />}
          >
            查看法拍房信息汇总
          </ButtonLink>
        </div>
      </div>
    </div>
  )
}
