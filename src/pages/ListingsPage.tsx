import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Home, Maximize2, Gavel, ArrowRight, SlidersHorizontal, X, ChevronDown } from 'lucide-react'

/* ─────────────────────────────────────────────
   Data
───────────────────────────────────────────── */
interface Listing {
  id: string
  title: string
  address: string
  district: number        // 1–23
  districtName: string
  price: number           // EUR — sale price or monthly rent
  sqm: number
  rooms: number
  tag?: string
  forRent: boolean
  image: string
  url?: string            // 真实房源链接，留空则跳转联系页
}

const ALL_LISTINGS: Listing[] = [
  {
    id: '1', title: '19区别墅式公寓', address: '1190 Wien, Döbling',
    district: 19, districtName: 'Döbling', price: 850000, sqm: 120, rooms: 4,
    tag: '精选推荐', forRent: false,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=700&q=75',
  },
  {
    id: '2', title: '1区历史建筑改造', address: '1010 Wien, Innere Stadt',
    district: 1, districtName: 'Innere Stadt', price: 1200000, sqm: 95, rooms: 3,
    tag: '投资优选', forRent: false,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=700&q=75',
  },
  {
    id: '3', title: '22区新建住宅', address: '1220 Wien, Donaustadt',
    district: 22, districtName: 'Donaustadt', price: 420000, sqm: 78, rooms: 3,
    tag: '首次购房', forRent: false,
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=700&q=75',
  },
  {
    id: '4', title: '13区精装单身公寓', address: '1130 Wien, Hietzing',
    district: 13, districtName: 'Hietzing', price: 320000, sqm: 52, rooms: 2,
    forRent: false,
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=700&q=75',
  },
  {
    id: '5', title: '3区整栋出租楼', address: '1030 Wien, Landstraße',
    district: 3, districtName: 'Landstraße', price: 2100000, sqm: 480, rooms: 8,
    tag: '高收益', forRent: false,
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=700&q=75',
  },
  {
    id: '6', title: '18区花园住宅', address: '1180 Wien, Währing',
    district: 18, districtName: 'Währing', price: 980000, sqm: 165, rooms: 5,
    forRent: false,
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=700&q=75',
  },
  {
    id: '7', title: '7区设计感公寓（出租）', address: '1070 Wien, Neubau',
    district: 7, districtName: 'Neubau', price: 1800, sqm: 68, rooms: 2,
    tag: '现代装修', forRent: true,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=700&q=75',
  },
  {
    id: '8', title: '4区老楼改造公寓（出租）', address: '1040 Wien, Wieden',
    district: 4, districtName: 'Wieden', price: 2200, sqm: 85, rooms: 3,
    tag: '近地铁', forRent: true,
    image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=700&q=75',
  },
  {
    id: '9', title: '9区现代公寓（出租）', address: '1090 Wien, Alsergrund',
    district: 9, districtName: 'Alsergrund', price: 1500, sqm: 55, rooms: 2,
    forRent: true,
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=700&q=75',
  },
  {
    id: '10', title: '2区新楼单卧公寓（出租）', address: '1020 Wien, Leopoldstadt',
    district: 2, districtName: 'Leopoldstadt', price: 1350, sqm: 48, rooms: 1,
    forRent: true,
    image: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=700&q=75',
  },
]

/* ─────────────────────────────────────────────
   Filter helpers
───────────────────────────────────────────── */
const BUY_PRICE_RANGES = [
  { label: '全部价格', min: 0, max: Infinity },
  { label: '< €300K', min: 0, max: 300000 },
  { label: '€300K – €600K', min: 300000, max: 600000 },
  { label: '€600K – €1M', min: 600000, max: 1000000 },
  { label: '> €1M', min: 1000000, max: Infinity },
]
const RENT_PRICE_RANGES = [
  { label: '全部价格', min: 0, max: Infinity },
  { label: '< €1,500/月', min: 0, max: 1500 },
  { label: '€1,500 – €2,000/月', min: 1500, max: 2000 },
  { label: '> €2,000/月', min: 2000, max: Infinity },
]
const ROOM_OPTIONS = ['全部', '1间', '2间', '3间', '4间+']
const DISTRICTS = ['全部区域', ...Array.from(new Set(ALL_LISTINGS.map(l => `${l.district}. ${l.districtName}`))).sort((a, b) => parseInt(a) - parseInt(b))]

function fmtPrice(price: number, forRent: boolean) {
  if (forRent) return `€ ${price.toLocaleString('de-AT')}/月`
  if (price >= 1000000) return `€ ${(price / 1000000).toFixed(1).replace('.0', '')} Mio.`
  return `€ ${(price / 1000).toFixed(0)}K`
}

/* ─────────────────────────────────────────────
   Select component
───────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────
   Card
───────────────────────────────────────────── */
function ListingCard({ listing }: { listing: Listing }) {
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
      <div className="relative h-52 overflow-hidden">
        <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(to top,#141414 0%,transparent 55%)' }} />
        <img src={listing.image} alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-108"
          style={{ transition: 'transform 0.7s ease' }} />
        {/* Badges */}
        <div className="absolute top-3 left-3 z-20 flex gap-1.5">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
            style={{ background: listing.forRent ? 'rgba(34,197,94,0.85)' : 'rgba(212,175,55,0.9)', color: '#141414' }}>
            {listing.forRent ? '租' : '买'}
          </span>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium"
            style={{ background: 'rgba(20,20,20,0.7)', backdropFilter: 'blur(6px)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.12)' }}>
            {listing.district}区 · {listing.districtName}
          </span>
        </div>
        {listing.tag && (
          <span className="absolute top-3 right-3 z-20 px-2 py-0.5 rounded-md text-[10px] font-bold"
            style={{ background: '#d4af37', color: '#141414' }}>
            {listing.tag}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-semibold text-white text-sm mb-1 line-clamp-1">{listing.title}</h3>
        <div className="flex items-center gap-1 text-[11px] mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
          <MapPin size={10} />{listing.address}
        </div>
        <div className="flex items-center gap-3 text-[11px] mb-4" style={{ color: 'rgba(255,255,255,0.42)' }}>
          <span className="flex items-center gap-1"><Maximize2 size={10} />{listing.sqm} m²</span>
          <span className="w-px h-3 bg-white/10" />
          <span className="flex items-center gap-1"><Home size={10} />{listing.rooms} 间</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold" style={{ color: '#d4af37' }}>
            {fmtPrice(listing.price, listing.forRent)}
          </span>
          {listing.url ? (
            <a href={listing.url} target="_blank" rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
              style={{ background: 'rgba(212,175,55,0.1)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.2)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,175,55,0.22)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(212,175,55,0.1)')}
            >
              查看详情 →
            </a>
          ) : (
            <Link to="/about"
              className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
              style={{ background: 'rgba(212,175,55,0.1)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.2)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,175,55,0.22)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(212,175,55,0.1)')}
            >
              咨询详情
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function ListingsPage() {
  const [mode, setMode] = useState<'buy' | 'rent'>('buy')
  const [priceIdx, setPriceIdx] = useState(0)
  const [district, setDistrict] = useState('全部区域')
  const [rooms, setRooms] = useState('全部')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const priceRanges = mode === 'buy' ? BUY_PRICE_RANGES : RENT_PRICE_RANGES
  const priceLabel = priceRanges[priceIdx]?.label ?? '全部价格'

  const filtered = useMemo(() => {
    const { min, max } = priceRanges[priceIdx] ?? { min: 0, max: Infinity }
    return ALL_LISTINGS.filter(l => {
      if (l.forRent !== (mode === 'rent')) return false
      if (l.price < min || l.price > max) return false
      if (district !== '全部区域' && !district.startsWith(String(l.district) + '.')) return false
      if (rooms !== '全部') {
        const n = parseInt(rooms)
        if (rooms.endsWith('+')) { if (l.rooms < n) return false }
        else if (l.rooms !== n) return false
      }
      return true
    })
  }, [mode, priceIdx, district, rooms])

  function resetFilters() {
    setPriceIdx(0); setDistrict('全部区域'); setRooms('全部')
  }
  const hasFilters = priceIdx !== 0 || district !== '全部区域' || rooms !== '全部'

  return (
    <div className="min-h-screen bg-[#141414] text-white pt-16">

      {/* ── Header ── */}
      <div className="py-10 px-4 sm:px-6 lg:px-10" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="max-w-6xl mx-auto">
          <p className="text-[11px] tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(212,175,55,0.65)' }}>房源列表</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1">精选房源</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.38)' }}>与维也纳本地中介合作，为华人投资者精选优质住宅</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-8">

        {/* ── Filter panel ── */}
        <div className="mb-8 rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}>

          {/* Buy / Rent toggle */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex rounded-xl overflow-hidden p-0.5" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              {(['buy', 'rent'] as const).map(m => (
                <button key={m}
                  onClick={() => { setMode(m); setPriceIdx(0) }}
                  className="px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                  style={mode === m
                    ? { background: '#d4af37', color: '#141414' }
                    : { color: 'rgba(255,255,255,0.45)', background: 'transparent' }}
                >
                  {m === 'buy' ? '购买' : '出租'}
                </button>
              ))}
            </div>

            {/* Mobile filter toggle */}
            <button onClick={() => setFiltersOpen(o => !o)}
              className="sm:hidden ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm transition-colors"
              style={{ background: filtersOpen ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.06)', color: filtersOpen ? '#d4af37' : 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <SlidersHorizontal size={14} />
              筛选
            </button>

            {/* Active filter count badge */}
            {hasFilters && (
              <button onClick={resetFilters}
                className="ml-auto hidden sm:flex items-center gap-1.5 text-xs transition-colors"
                style={{ color: 'rgba(255,255,255,0.38)' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#d4af37')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.38)')}>
                <X size={13} /> 清除筛选
              </button>
            )}
          </div>

          {/* Filter selects — desktop always visible, mobile collapsible */}
          <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 ${!filtersOpen ? 'hidden sm:grid' : 'grid'}`}>
            {/* Price */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>总价</label>
              <FilterSelect
                value={priceLabel}
                onChange={v => setPriceIdx(priceRanges.findIndex(r => r.label === v))}
                options={priceRanges.map(r => r.label)}
              />
            </div>

            {/* District */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>区域</label>
              <FilterSelect value={district} onChange={setDistrict} options={DISTRICTS} />
            </div>

            {/* Rooms */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>房间数量</label>
              <div className="flex gap-1.5">
                {ROOM_OPTIONS.map(r => (
                  <button key={r} onClick={() => setRooms(r)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-medium transition-all duration-200"
                    style={rooms === r
                      ? { background: '#d4af37', color: '#141414' }
                      : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Results header ── */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            找到 <span className="font-semibold text-white">{filtered.length}</span> 条{mode === 'buy' ? '购买' : '出租'}房源
          </p>
          {hasFilters && (
            <button onClick={resetFilters} className="sm:flex hidden items-center gap-1 text-xs"
              style={{ color: 'rgba(255,255,255,0.35)' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#d4af37')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}>
              <X size={12} /> 清除筛选
            </button>
          )}
        </div>

        {/* ── Grid ── */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-3xl mb-3">🔍</p>
            <p className="font-semibold text-white mb-1">暂无匹配房源</p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>尝试调整筛选条件，或</p>
            <button onClick={resetFilters} className="mt-3 text-sm underline underline-offset-2" style={{ color: '#d4af37' }}>
              清除所有筛选
            </button>
          </div>
        ) : (
          <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {filtered.map(l => <ListingCard key={l.id} listing={l} />)}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── Notice ── */}
        <div className="mt-8 rounded-xl px-4 py-3 flex gap-2 items-start text-xs"
          style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)', color: 'rgba(255,255,255,0.42)' }}>
          <span className="mt-0.5 flex-shrink-0" style={{ color: '#d4af37' }}>ℹ</span>
          <span>
            以下为示例房源，最新真实房源请通过
            <Link to="/about" className="underline underline-offset-2 mx-1" style={{ color: '#d4af37' }}>联系页面</Link>
            获取，或在小红书搜索「奥匈置业研究所 | CH」。
          </span>
        </div>

        {/* ── Auction CTA ── */}
        <div className="mt-6 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-5"
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
            onMouseEnter={e => (e.currentTarget.style.background = '#e0bc4a')}
            onMouseLeave={e => (e.currentTarget.style.background = '#d4af37')}
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
