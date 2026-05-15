import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Home, Maximize2, Gavel, ArrowRight, SlidersHorizontal, X, ChevronDown, ImageIcon, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'

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
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none w-full pl-4 pr-9 py-2.5 rounded-xl text-sm font-medium outline-none cursor-pointer transition-colors"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: value === options[0] ? 'rgba(255,255,255,0.45)' : 'white',
        }}
      >
        {options.map(o => <option key={o} value={o} style={{ background: '#1e1e1e', color: 'white' }}>{o}</option>)}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: 'rgba(255,255,255,0.4)' }} />
    </div>
  )
}

function ListingCard({ listing }: { listing: Listing }) {
  const district = districtFromText(listing.address.district)
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, borderColor: 'rgba(212,175,55,0.45)' }}
      className="group relative overflow-hidden rounded-2xl transition-all duration-300"
      style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(16px)', border: '1px solid rgba(212,175,55,0.16)' }}
    >
      {/* Image */}
      <Link to={`/listings/${listing.id}`} className="block relative h-52 overflow-hidden">
        <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(to top,#141414 0%,transparent 55%)' }} />
        {listing.coverImage ? (
          <img src={listing.coverImage} alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-700"
            style={{ transition: 'transform 0.7s ease' }}
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <ImageIcon size={32} style={{ color: 'rgba(255,255,255,0.18)' }} />
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-3 left-3 z-20 flex gap-1.5">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
            style={{ background: listing.forRent ? 'rgba(34,197,94,0.85)' : 'rgba(212,175,55,0.9)', color: '#141414' }}>
            {listing.forRent ? '租' : '买'}
          </span>
          {district > 0 && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium"
              style={{ background: 'rgba(20,20,20,0.7)', backdropFilter: 'blur(6px)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.12)' }}>
              {district}区
            </span>
          )}
        </div>
        {listing.imageCount > 1 && (
          <span className="absolute top-3 right-3 z-20 px-2 py-0.5 rounded-md text-[10px] font-medium flex items-center gap-1"
            style={{ background: 'rgba(20,20,20,0.7)', backdropFilter: 'blur(6px)', color: 'rgba(255,255,255,0.85)' }}>
            <ImageIcon size={9} /> {listing.imageCount}
          </span>
        )}
      </Link>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-semibold text-white text-sm mb-1 line-clamp-1">{listing.title || listing.typeName}</h3>
        <div className="flex items-center gap-1 text-[11px] mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
          <MapPin size={10} />
          <span className="line-clamp-1">{listing.address.plz} {listing.address.city}{listing.address.street ? ` · ${listing.address.street}` : ''}</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] mb-4" style={{ color: 'rgba(255,255,255,0.45)' }}>
          {listing.sqm > 0 && (
            <span className="flex items-center gap-1"><Maximize2 size={10} />{Math.round(listing.sqm)} m²</span>
          )}
          {listing.rooms > 0 && (
            <>
              <span className="w-px h-3 bg-white/10" />
              <span className="flex items-center gap-1"><Home size={10} />{listing.rooms} 间</span>
            </>
          )}
          {listing.buildYear > 0 && (
            <>
              <span className="w-px h-3 bg-white/10" />
              <span>建于 {listing.buildYear}</span>
            </>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold" style={{ color: '#d4af37' }}>
            {fmtPrice(listing.price, listing.forRent, listing.priceOnRequest)}
          </span>
          <Link to={`/listings/${listing.id}`}
            className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
            style={{ background: 'rgba(212,175,55,0.1)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.2)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,175,55,0.22)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(212,175,55,0.1)')}
          >
            查看详情 →
          </Link>
        </div>
      </div>
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
    <div className="min-h-screen bg-[#141414] text-white pt-16">

      {/* Header */}
      <div className="py-10 px-4 sm:px-6 lg:px-10" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="max-w-6xl mx-auto">
          <p className="text-[11px] tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(212,175,55,0.65)' }}>真实房源</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1">维也纳精选房源</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            真实在售房源 · 共 <span className="text-white font-semibold">{listings.length}</span> 套
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-8">

        {/* Filter panel */}
        <div className="mb-8 rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex rounded-xl overflow-hidden p-0.5" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              {(['buy', 'rent'] as const).map(m => (
                <button key={m}
                  onClick={() => { setMode(m); setPriceIdx(0) }}
                  className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
                  style={mode === m
                    ? { background: '#d4af37', color: '#141414' }
                    : { color: 'rgba(255,255,255,0.45)', background: 'transparent' }}
                >
                  {m === 'buy' ? '购买' : '出租'}
                </button>
              ))}
            </div>
            <button onClick={() => setFiltersOpen(o => !o)}
              className="sm:hidden ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm transition-colors"
              style={{ background: filtersOpen ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.06)', color: filtersOpen ? '#d4af37' : 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <SlidersHorizontal size={14} />
              筛选
            </button>
            {hasFilters && (
              <button onClick={resetFilters}
                className="ml-auto hidden sm:flex items-center gap-1.5 text-xs transition-colors"
                style={{ color: 'rgba(255,255,255,0.4)' }}>
                <X size={13} /> 清除筛选
              </button>
            )}
          </div>

          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 ${!filtersOpen ? 'hidden sm:grid' : 'grid'}`}>
            <div>
              <label className="block text-[10px] uppercase tracking-wider mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>类型</label>
              <FilterSelect value={propType} onChange={setPropType} options={TYPE_OPTIONS} />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>总价</label>
              <FilterSelect
                value={priceLabel}
                onChange={v => setPriceIdx(priceRanges.findIndex(r => r.label === v))}
                options={priceRanges.map(r => r.label)}
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>区域</label>
              <FilterSelect value={district} onChange={setDistrict} options={districts} />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>房间数量</label>
              <div className="flex gap-1.5">
                {ROOM_OPTIONS.map(r => (
                  <button key={r} onClick={() => setRooms(r)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-medium transition-all"
                    style={rooms === r
                      ? { background: '#d4af37', color: '#141414' }
                      : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >{r}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            找到 <span className="font-semibold text-white">{filtered.length}</span> 套{mode === 'buy' ? '购买' : '出租'}房源
            {filtered.length > 0 && (
              <span className="ml-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                · 第 {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filtered.length)} 条
              </span>
            )}
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Page size selector */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>每页</span>
              <div className="relative">
                <select
                  value={pageSize}
                  onChange={e => setPageSize(Number(e.target.value))}
                  className="appearance-none pl-3.5 pr-8 py-2 rounded-lg text-xs font-medium outline-none cursor-pointer transition-colors"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(212,175,55,0.25)',
                    color: 'rgba(255,255,255,0.85)',
                  }}
                >
                  {[10, 20, 50, 100].map(n => (
                    <option key={n} value={n} style={{ background: '#1e1e1e', color: 'white' }}>{n} 条</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'rgba(212,175,55,0.5)' }} />
              </div>
            </div>

            {/* Sort selector */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>排序</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as SortKey)}
                  className="appearance-none pl-3.5 pr-8 py-2 rounded-lg text-xs font-medium outline-none cursor-pointer transition-colors"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(212,175,55,0.25)',
                    color: sortBy === 'default' ? 'rgba(255,255,255,0.6)' : '#d4af37',
                  }}
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.key} value={o.key} style={{ background: '#1e1e1e', color: 'white' }}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'rgba(212,175,55,0.5)' }} />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24" style={{ color: 'rgba(255,255,255,0.45)' }}>
            <Loader2 size={28} className="animate-spin mb-3" style={{ color: '#d4af37' }} />
            <p className="text-sm">加载中…</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-3xl mb-3">⚠️</p>
            <p className="font-semibold text-white mb-1">加载失败</p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-3xl mb-3">🔍</p>
            <p className="font-semibold text-white mb-1">暂无匹配房源</p>
            <button onClick={resetFilters} className="mt-3 text-sm underline underline-offset-2" style={{ color: '#d4af37' }}>
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
              <div className="mt-10 flex items-center justify-center gap-1.5 flex-wrap">
                {/* Prev */}
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="flex items-center gap-1 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.7)',
                  }}>
                  <ChevronLeft size={13} /> 上一页
                </button>

                {/* Page numbers */}
                {pageList().map((p, i) =>
                  p === '...' ? (
                    <span key={`dots-${i}`} className="px-2 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p as number)}
                      className="min-w-[36px] px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                      style={p === safePage ? {
                        background: '#d4af37',
                        color: '#141414',
                        border: '1px solid #d4af37',
                      } : {
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: 'rgba(255,255,255,0.7)',
                      }}>
                      {p}
                    </button>
                  )
                )}

                {/* Next */}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="flex items-center gap-1 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.7)',
                  }}>
                  下一页 <ChevronRight size={13} />
                </button>
              </div>
            )}
          </>
        )}

        {/* Auction CTA */}
        <div className="mt-10 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-5"
          style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)' }}>
          <div className="flex-1">
            <h3 className="font-bold text-white text-base mb-1">寻找更低价格？</h3>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
              法拍房起拍价最低为评估价 50%，一手数据尽在法拍房信息汇总
            </p>
          </div>
          <Link to="/auction"
            className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            style={{ background: '#d4af37', color: '#141414' }}
          >
            <Gavel size={14} />
            查看法拍房信息汇总
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  )
}
