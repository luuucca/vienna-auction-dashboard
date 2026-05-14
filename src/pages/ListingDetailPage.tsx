import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, MapPin, Maximize2, Home, Calendar, Building,
  ChevronLeft, ChevronRight, Loader2, ExternalLink, Heart, Share2,
  Bed, Bath, TreePine, Layers, Sparkles
} from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// ─── POI types ───────────────────────────────────────────────────────────────
interface POIPoint { lat: number; lng: number; name: string; type: 'subway' | 'shop' }

// ─── Emoji map icons ─────────────────────────────────────────────────────────
const makeEmojiIcon = (emoji: string) =>
  L.divIcon({
    className: '',
    html: `<div style="font-size:26px;line-height:1;background:rgba(12,12,12,0.78);border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;border:2px solid rgba(255,255,255,0.14);box-shadow:0 3px 12px rgba(0,0,0,0.5);cursor:pointer;">${emoji}</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  })
const subwayIcon = makeEmojiIcon('🚇')
const shopIcon   = makeEmojiIcon('🛒')

// ─── Fetch nearest POIs from Overpass ────────────────────────────────────────
async function fetchPOIs(lat: number, lng: number): Promise<{ subway: POIPoint | null; shop: POIPoint | null }> {
  const q = `[out:json][timeout:15];
(
  node(around:2500,${lat},${lng})[station=subway];
  node(around:2500,${lat},${lng})[railway=subway_entrance];
  node(around:2500,${lat},${lng})[railway=station][station=subway];
  node(around:1200,${lat},${lng})[shop=supermarket];
  node(around:1200,${lat},${lng})[shop=convenience];
  node(around:1200,${lat},${lng})[shop=grocery];
);
out body 30;`

  const r = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: q })
  const data = await r.json()
  const els: any[] = data.elements || []

  const dist = (e: any) => Math.hypot(e.lat - lat, e.lon - lng)

  const subwayEls = els.filter(e =>
    e.tags?.station === 'subway' || e.tags?.railway === 'subway_entrance' ||
    (e.tags?.railway === 'station' && e.tags?.station === 'subway')
  )
  const shopEls = els.filter(e =>
    e.tags?.shop === 'supermarket' || e.tags?.shop === 'convenience' || e.tags?.shop === 'grocery'
  )

  const nearest = (arr: any[]): POIPoint | null => {
    if (!arr.length) return null
    const e = arr.reduce((a, b) => dist(a) < dist(b) ? a : b)
    return { lat: e.lat, lng: e.lon, name: e.tags?.name || '', type: 'subway' }
  }

  const sub = nearest(subwayEls)
  const sh  = shopEls.length
    ? (() => { const e = shopEls.reduce((a, b) => dist(a) < dist(b) ? a : b); return { lat: e.lat, lng: e.lon, name: e.tags?.name || '', type: 'shop' as const } })()
    : null

  return { subway: sub, shop: sh }
}

// ─── Fetch walking route from OSRM ───────────────────────────────────────────
async function fetchRoute(from: POIPoint, toLat: number, toLng: number): Promise<[number,number][] | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/foot/${from.lng},${from.lat};${toLng},${toLat}?overview=full&geometries=geojson`
    const r = await fetch(url)
    const d = await r.json()
    const coords = d.routes?.[0]?.geometry?.coordinates
    if (!coords) return null
    return coords.map(([lng, lat]: [number, number]) => [lat, lng])
  } catch { return null }
}

// ─── POI Layer (must live inside MapContainer) ────────────────────────────────
function POILayer({ propLat, propLng }: { propLat: number; propLng: number }) {
  const map = useMap()
  const [subway, setSubway]         = useState<POIPoint | null>(null)
  const [shop, setShop]             = useState<POIPoint | null>(null)
  const [route, setRoute]           = useState<[number,number][] | null>(null)
  const [activeType, setActiveType] = useState<'subway' | 'shop' | null>(null)
  const [fetching, setFetching]     = useState(false)

  useEffect(() => {
    fetchPOIs(propLat, propLng).then(({ subway: s, shop: sh }) => {
      setSubway(s)
      setShop(sh)
    })
  }, [propLat, propLng])

  const handleClick = async (poi: POIPoint) => {
    if (activeType === poi.type) {           // toggle off
      setRoute(null); setActiveType(null); return
    }
    setActiveType(poi.type)
    setFetching(true)
    const r = await fetchRoute(poi, propLat, propLng)
    setRoute(r)
    setFetching(false)
    if (r) {
      // Fit map to show both property and POI
      const bounds = L.latLngBounds([[propLat, propLng], [poi.lat, poi.lng]])
      map.fitBounds(bounds, { padding: [60, 60] })
    }
  }

  return (
    <>
      {subway && (
        <Marker position={[subway.lat, subway.lng]} icon={subwayIcon}
          eventHandlers={{ click: () => handleClick({ ...subway, type: 'subway' }) }}>
          <Popup className="custom-popup">
            <div style={{ fontWeight: 700, fontSize: 13 }}>🚇 {subway.name || 'U-Bahn Station'}</div>
            <div style={{ fontSize: 11, color: '#888', marginTop: 3 }}>
              {activeType === 'subway' ? '点击关闭路线' : '点击查看步行路线'}
            </div>
          </Popup>
        </Marker>
      )}
      {shop && (
        <Marker position={[shop.lat, shop.lng]} icon={shopIcon}
          eventHandlers={{ click: () => handleClick({ ...shop, type: 'shop' }) }}>
          <Popup className="custom-popup">
            <div style={{ fontWeight: 700, fontSize: 13 }}>🛒 {shop.name || '超市'}</div>
            <div style={{ fontSize: 11, color: '#888', marginTop: 3 }}>
              {activeType === 'shop' ? '点击关闭路线' : '点击查看步行路线'}
            </div>
          </Popup>
        </Marker>
      )}
      {route && (
        <Polyline positions={route}
          pathOptions={{ color: '#d4af37', weight: 4, opacity: 0.9, dashArray: '10 7' }} />
      )}
    </>
  )
}

const goldPinIcon = L.divIcon({
  className: 'custom-gold-pin',
  html: `<div style="
    width: 40px; height: 40px;
    background: linear-gradient(135deg, #e8c552 0%, #d4af37 100%);
    border: 3px solid #141414;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    box-shadow: 0 6px 18px rgba(212,175,55,0.45), 0 0 0 2px rgba(212,175,55,0.25);
    animation: pulse-gold 2s infinite;
  "><div style="
    position: absolute; top: 50%; left: 50%;
    transform: translate(-50%,-50%) rotate(45deg);
    width: 12px; height: 12px;
    background: #141414; border-radius: 50%;
  "></div></div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
})

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
  bedrooms: number
  bathrooms: number
  sqm: number
  plotSqm: number
  balconyTerraceSqm: number
  floors: number
  buildYear: number
  address: { street: string; plz: string; city: string; district: string; state: string; raw: string }
  location: { lat: number; lng: number }
  images: string[]
  coverImage: string | null
  imageCount: number
  description: string
  locationText: string
  featuresText: string
  contact: { name: string; email: string; phone: string; company: string }
}

function fmtPrice(p: number, rent: boolean, onReq: boolean) {
  if (onReq || !p) return '价格面议'
  const f = p.toLocaleString('de-AT')
  return rent ? `€ ${f}/月` : `€ ${f}`
}

/* ─────────────────────────────────────────────
   Hero Gallery
───────────────────────────────────────────── */
function HeroGallery({ images, title }: { images: string[]; title: string }) {
  const [idx, setIdx] = useState(0)
  const [direction, setDirection] = useState(0)

  const go = (delta: number) => {
    setDirection(delta)
    setIdx((i) => (i + delta + images.length) % images.length)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === 'ArrowRight') go(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [idx])

  // Preload neighboring images for instant nav
  useEffect(() => {
    const preload = (src: string) => {
      const img = new Image()
      img.src = src
    }
    const next = (idx + 1) % images.length
    const prev = (idx - 1 + images.length) % images.length
    if (images[next]) preload(images[next])
    if (images[prev]) preload(images[prev])
  }, [idx, images])

  if (!images.length) {
    return (
      <div className="relative w-full max-w-6xl mx-auto" style={{ aspectRatio: '16/10', background: '#0a0a0a' }}>
        <div className="absolute inset-0 flex items-center justify-center text-white/20">无图片</div>
      </div>
    )
  }

  return (
    <>
      <div className="relative w-full max-w-6xl mx-auto overflow-hidden rounded-2xl" style={{ aspectRatio: '16/10', background: '#0a0a0a' }}>
        <AnimatePresence initial={false} mode="popLayout" custom={direction}>
          <motion.img
            key={idx}
            src={images[idx]}
            alt={title}
            custom={direction}
            initial={{ opacity: 0, scale: 1.02, x: direction > 0 ? 40 : -40 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 1.02, x: direction > 0 ? -40 : 40 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ background: '#0a0a0a' }}
            draggable={false}
            loading="eager"
            decoding="async"
            // @ts-ignore - fetchpriority is valid HTML attribute
            fetchpriority="high"
          />
        </AnimatePresence>

        {/* Vignette */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, rgba(20,20,20,0.35) 0%, transparent 25%, transparent 60%, rgba(20,20,20,0.95) 100%)' }} />

        {images.length > 1 && (
          <>
            <button onClick={() => go(-1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ background: 'rgba(20,20,20,0.55)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <ChevronLeft size={18} color="white" />
            </button>
            <button onClick={() => go(1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ background: 'rgba(20,20,20,0.55)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <ChevronRight size={18} color="white" />
            </button>

            {/* Counter */}
            <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background: 'rgba(20,20,20,0.7)', backdropFilter: 'blur(10px)', color: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.1)' }}>
              {idx + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 mt-3">
          <div className="flex gap-2 overflow-x-auto pb-2 thumb-strip">
            {images.slice(0, 30).map((img, i) => (
              <motion.button
                key={i}
                onClick={() => { setDirection(i > idx ? 1 : -1); setIdx(i) }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
                className="flex-shrink-0 rounded-lg overflow-hidden"
                style={{
                  width: 88, height: 60,
                  border: i === idx ? '2px solid #d4af37' : '2px solid rgba(255,255,255,0.08)',
                  opacity: i === idx ? 1 : 0.55,
                  transition: 'opacity 0.2s, border-color 0.2s',
                  boxShadow: i === idx ? '0 4px 14px rgba(212,175,55,0.35)' : 'none',
                }}>
                <img src={img} alt="" className="w-full h-full object-cover"
                  loading={i < 6 ? 'eager' : 'lazy'} decoding="async" />
              </motion.button>
            ))}
          </div>
        </div>
      )}

    </>
  )
}

/* ─────────────────────────────────────────────
   Stat Card
───────────────────────────────────────────── */
function StatCard({ icon, label, value, delay = 0 }: { icon: React.ReactNode; label: string; value: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, borderColor: 'rgba(212,175,55,0.35)' }}
      className="rounded-2xl p-4 transition-colors"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] mb-2" style={{ color: 'rgba(212,175,55,0.75)' }}>
        {icon}
        {label}
      </div>
      <p className="text-xl font-serif font-semibold text-white tracking-tight">{value}</p>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)


  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetch(`/api/listings?id=${encodeURIComponent(id)}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error)
        else setData(d)
        setLoading(false)
      })
      .catch(err => { setError(String(err)); setLoading(false) })
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#141414] text-white pt-16">
        <Loader2 size={32} className="animate-spin mb-3" style={{ color: '#d4af37' }} />
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>加载房源…</p>
      </div>
    )
  }
  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#141414] text-white pt-16 px-4 text-center">
        <p className="text-3xl mb-3">😶</p>
        <p className="font-semibold mb-2">房源未找到</p>
        <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.45)' }}>{error || '该房源可能已下架'}</p>
        <Link to="/listings" className="px-5 py-2 rounded-xl text-sm font-semibold" style={{ background: '#d4af37', color: '#141414' }}>
          返回房源列表
        </Link>
      </div>
    )
  }

  const district = String(data.address.district || '').match(/Wien\s+(\d+)/i)
  const districtNum = district ? district[1] : ''
  const districtName = data.address.district?.split(',')[1]?.trim() || ''

  return (
    <div className="min-h-screen bg-[#141414] text-white pt-16">
      <style>{`
        @keyframes pulse-gold {
          0%, 100% { box-shadow: 0 6px 18px rgba(212,175,55,0.45), 0 0 0 2px rgba(212,175,55,0.25); }
          50% { box-shadow: 0 8px 24px rgba(212,175,55,0.65), 0 0 0 8px rgba(212,175,55,0.08); }
        }
        .thumb-strip::-webkit-scrollbar { height: 6px; }
        .thumb-strip::-webkit-scrollbar-thumb { background: rgba(212,175,55,0.3); border-radius: 3px; }
        .listing-desc h1, .listing-desc h2 { font-size: 18px; font-weight: 600; color: #d4af37; margin: 1.5em 0 0.6em; letter-spacing: -0.01em; }
        .listing-desc h3, .listing-desc h4 { font-size: 15px; font-weight: 600; color: rgba(255,255,255,0.95); margin: 1.2em 0 0.5em; }
        .listing-desc p { margin: 0.7em 0; }
        .listing-desc ul { margin: 0.6em 0; padding-left: 1.2em; }
        .listing-desc li { margin: 0.3em 0; list-style: disc; }
        .listing-desc strong { color: rgba(255,255,255,0.95); font-weight: 600; }
        .listing-desc hr { border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 1.5em 0; }
        .listing-desc a { color: #d4af37; text-decoration: underline; text-underline-offset: 2px; }
      `}</style>

      {/* Top toolbar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 pt-5 pb-2 flex items-center justify-between">
        <Link to="/listings"
          className="inline-flex items-center gap-1.5 text-sm transition-all px-3 py-1.5 rounded-xl"
          style={{ color: 'rgba(255,255,255,0.55)', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#d4af37'; e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}>
          <ArrowLeft size={13} /> 返回列表
        </Link>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.1)'; e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' }}
            title="收藏">
            <Heart size={14} style={{ color: 'rgba(255,255,255,0.6)' }} />
          </button>
          <button onClick={() => navigator.share && navigator.share({ url: window.location.href, title: data.title })}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.1)'; e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' }}
            title="分享">
            <Share2 size={14} style={{ color: 'rgba(255,255,255,0.6)' }} />
          </button>
        </div>
      </div>

      {/* Hero Gallery */}
      <div className="mt-4 px-4 sm:px-6 lg:px-10">
        <HeroGallery images={data.images} title={data.title} />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 pt-8 pb-16 grid lg:grid-cols-3 gap-8">

        {/* Main column */}
        <div className="lg:col-span-2 space-y-8">

          {/* Title block */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase"
                style={{ background: data.forRent ? 'rgba(34,197,94,0.18)' : 'rgba(212,175,55,0.18)', color: data.forRent ? '#22c55e' : '#d4af37', border: `1px solid ${data.forRent ? 'rgba(34,197,94,0.35)' : 'rgba(212,175,55,0.35)'}` }}>
                {data.forRent ? '出租' : '出售'}
              </span>
              <span className="text-xs" style={{ color: 'rgba(212,175,55,0.6)' }}>{data.typeName || data.type}</span>
              {districtNum && (
                <>
                  <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{districtNum} 区 {districtName}</span>
                </>
              )}
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight leading-tight">
              {data.title}
            </h1>
            <div className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              <MapPin size={14} style={{ color: '#d4af37' }} />
              <span>{data.address.plz} {data.address.city}{data.address.street ? ` · ${data.address.street}` : ''}</span>
            </div>
          </motion.div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {data.sqm > 0 && (
              <StatCard icon={<Maximize2 size={11} />} label="居住面积" value={`${Math.round(data.sqm)} m²`} delay={0.05} />
            )}
            {data.rooms > 0 && (
              <StatCard icon={<Home size={11} />} label="房间数" value={`${data.rooms} 间`} delay={0.1} />
            )}
            {data.bedrooms > 0 && (
              <StatCard icon={<Bed size={11} />} label="卧室" value={`${data.bedrooms}`} delay={0.15} />
            )}
            {data.bathrooms > 0 && (
              <StatCard icon={<Bath size={11} />} label="浴室" value={`${data.bathrooms}`} delay={0.2} />
            )}
            {data.balconyTerraceSqm > 0 && (
              <StatCard icon={<TreePine size={11} />} label="阳台/露台" value={`${Math.round(data.balconyTerraceSqm)} m²`} delay={0.25} />
            )}
            {data.buildYear > 0 && (
              <StatCard icon={<Calendar size={11} />} label="建造年份" value={String(data.buildYear)} delay={0.3} />
            )}
            {data.floors > 0 && (
              <StatCard icon={<Layers size={11} />} label="楼层数" value={`${data.floors} 层`} delay={0.35} />
            )}
            {data.plotSqm > 0 && (
              <StatCard icon={<Building size={11} />} label="土地面积" value={`${Math.round(data.plotSqm)} m²`} delay={0.4} />
            )}
          </div>

          {/* Features */}
          {data.featuresText && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl p-6"
              style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.06) 0%, rgba(255,255,255,0.02) 100%)', border: '1px solid rgba(212,175,55,0.15)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} style={{ color: '#d4af37' }} />
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: '#d4af37' }}>配置与亮点</h3>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>{data.featuresText}</p>
            </motion.div>
          )}

          {/* Description */}
          {data.description && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl p-6 sm:p-8"
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] mb-5" style={{ color: '#d4af37' }}>房源详情</h3>
              <div className="prose prose-sm prose-invert max-w-none listing-desc"
                style={{ color: 'rgba(255,255,255,0.78)', fontSize: 14.5, lineHeight: 1.75 }}
                dangerouslySetInnerHTML={{ __html: data.description }} />
            </motion.div>
          )}

          {/* Map */}
          {data.location.lat > 0 && data.location.lng > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="p-6 pb-4">
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] mb-1" style={{ color: '#d4af37' }}>地理位置</h3>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  {data.address.plz} {data.address.city}{data.address.street ? ` · ${data.address.street}` : ''}
                </p>
              </div>
              <div className="relative" style={{ height: 420 }}>
                <MapContainer
                  center={[data.location.lat, data.location.lng]}
                  zoom={15}
                  scrollWheelZoom={false}
                  style={{ height: '100%', width: '100%', background: '#0e0e0e' }}
                  attributionControl={false}
                >
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution="" />
                  <Marker position={[data.location.lat, data.location.lng]} icon={goldPinIcon}>
                    <Popup className="custom-popup">
                      <div style={{ color: '#141414', fontWeight: 600, fontSize: 12 }}>{data.title}</div>
                      <div style={{ color: '#666', fontSize: 11, marginTop: 2 }}>{data.address.plz} {data.address.city}</div>
                    </Popup>
                  </Marker>
                  {/* POI markers — only for listings with a precise street address */}
                  {data.address.street && /\d/.test(data.address.street) && (
                    <POILayer propLat={data.location.lat} propLng={data.location.lng} />
                  )}
                </MapContainer>
                {/* Legend */}
                {data.address.street && /\d/.test(data.address.street) && (
                  <div className="absolute bottom-3 left-3 z-[400] flex gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium"
                      style={{ background: 'rgba(12,12,12,0.82)', color: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      🚇 <span>地铁站</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium"
                      style={{ background: 'rgba(12,12,12,0.82)', color: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      🛒 <span>超市</span>
                    </div>
                  </div>
                )}
                <a href={`https://www.google.com/maps?q=${data.location.lat},${data.location.lng}`}
                  target="_blank" rel="noopener noreferrer"
                  className="absolute bottom-3 right-3 z-[400] px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all hover:scale-105"
                  style={{ background: 'rgba(20,20,20,0.85)', color: '#d4af37', backdropFilter: 'blur(10px)', border: '1px solid rgba(212,175,55,0.3)' }}>
                  Google 地图 <ExternalLink size={11} />
                </a>
              </div>
            </motion.div>
          )}
        </div>

        {/* Sticky sidebar */}
        <aside className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:sticky lg:top-24 space-y-4"
          >
            <div className="rounded-2xl p-6 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0.03) 100%)',
                border: '1px solid rgba(212,175,55,0.3)',
              }}>
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.3) 0%, transparent 70%)' }} />

              <p className="text-[10px] uppercase tracking-[0.2em] mb-2 relative z-10" style={{ color: 'rgba(212,175,55,0.85)' }}>
                {data.forRent ? '月租金' : '出售价格'}
              </p>
              <p className="font-serif text-3xl sm:text-4xl font-bold mb-1 relative z-10" style={{ color: '#d4af37', letterSpacing: '-0.02em' }}>
                {fmtPrice(data.price, data.forRent, data.priceOnRequest)}
              </p>
              {data.sqm > 0 && data.price > 0 && !data.priceOnRequest && !data.forRent && (
                <p className="text-xs relative z-10" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  约 € {Math.round(data.price / data.sqm).toLocaleString()} / m²
                </p>
              )}
            </div>

            <Link to="/about"
              className="group relative block w-full text-center py-4 rounded-xl text-sm font-semibold transition-all overflow-hidden"
              style={{ background: '#d4af37', color: '#141414' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <span className="relative z-10">咨询此房源 →</span>
            </Link>

            {data.objektnummer && (
              <div className="px-4 py-3 rounded-xl text-xs flex items-center justify-between"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)' }}>
                <span>房源编号</span>
                <span className="font-mono" style={{ color: 'rgba(255,255,255,0.7)' }}>{data.objektnummer}</span>
              </div>
            )}
          </motion.div>
        </aside>

      </div>
    </div>
  )
}
