import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Maximize2, Home, Calendar, Building, Mail, Phone, ChevronLeft, ChevronRight, Loader2, ExternalLink } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Custom gold pin icon
const goldPinIcon = L.divIcon({
  className: 'custom-gold-pin',
  html: `<div style="
    width: 36px; height: 36px;
    background: #d4af37;
    border: 3px solid #141414;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    box-shadow: 0 4px 14px rgba(0,0,0,0.6), 0 0 0 2px rgba(212,175,55,0.35);
    position: relative;
  "><div style="
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%,-50%) rotate(45deg);
    width: 10px; height: 10px;
    background: #141414;
    border-radius: 50%;
  "></div></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
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

function fmtPrice(p: number, rent: boolean, onReq: boolean, currency: string) {
  if (onReq || !p) return '价格面议'
  const formatted = p.toLocaleString('de-AT')
  return rent ? `€ ${formatted}/月` : `€ ${formatted}`
}

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imgIdx, setImgIdx] = useState(0)

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

  const cover = data.images[imgIdx] || data.coverImage
  const district = String(data.address.district || '').match(/Wien\s+(\d+)/i)
  const districtNum = district ? district[1] : ''

  return (
    <div className="min-h-screen bg-[#141414] text-white pt-16">

      {/* Back nav */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 pt-6">
        <Link to="/listings"
          className="inline-flex items-center gap-1.5 text-sm transition-colors"
          style={{ color: 'rgba(255,255,255,0.5)' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#d4af37')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}>
          <ArrowLeft size={14} /> 返回列表
        </Link>
      </div>

      {/* Gallery */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 pt-4">
        <div className="relative rounded-2xl overflow-hidden" style={{ background: '#0a0a0a', aspectRatio: '16/10' }}>
          {cover ? (
            <img src={cover} alt={data.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/20">无图片</div>
          )}
          {data.images.length > 1 && (
            <>
              <button onClick={() => setImgIdx((imgIdx - 1 + data.images.length) % data.images.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => setImgIdx((imgIdx + 1) % data.images.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
                <ChevronRight size={18} />
              </button>
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md text-xs"
                style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}>
                {imgIdx + 1} / {data.images.length}
              </div>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {data.images.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
            {data.images.slice(0, 30).map((img, i) => (
              <button key={i} onClick={() => setImgIdx(i)}
                className="flex-shrink-0 rounded-lg overflow-hidden transition-all"
                style={{
                  width: 80, height: 56,
                  border: i === imgIdx ? '2px solid #d4af37' : '2px solid transparent',
                  opacity: i === imgIdx ? 1 : 0.55,
                }}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-8 grid lg:grid-cols-3 gap-6">

        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs" style={{ color: 'rgba(212,175,55,0.7)' }}>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
                style={{ background: data.forRent ? 'rgba(34,197,94,0.85)' : '#d4af37', color: '#141414' }}>
                {data.forRent ? '出租' : '购买'}
              </span>
              <span>{data.typeName || data.type}</span>
              {districtNum && <span>· {districtNum}区 {data.address.district.split(',')[1]?.trim() || ''}</span>}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">{data.title}</h1>
            <div className="flex items-center gap-1.5 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              <MapPin size={13} />
              <span>{data.address.plz} {data.address.city}{data.address.street ? ` · ${data.address.street}` : ''}</span>
            </div>
          </div>

          {/* Key stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {data.sqm > 0 && (
              <Stat icon={<Maximize2 size={14} />} label="居住面积" value={`${Math.round(data.sqm)} m²`} />
            )}
            {data.rooms > 0 && (
              <Stat icon={<Home size={14} />} label="房间数" value={`${data.rooms} 间`} />
            )}
            {data.balconyTerraceSqm > 0 && (
              <Stat icon={<Maximize2 size={14} />} label="阳台/露台" value={`${Math.round(data.balconyTerraceSqm)} m²`} />
            )}
            {data.buildYear > 0 && (
              <Stat icon={<Calendar size={14} />} label="建造年份" value={String(data.buildYear)} />
            )}
            {data.floors > 0 && (
              <Stat icon={<Building size={14} />} label="楼层数" value={`${data.floors} 层`} />
            )}
            {data.bedrooms > 0 && (
              <Stat icon={<Home size={14} />} label="卧室" value={`${data.bedrooms}`} />
            )}
            {data.bathrooms > 0 && (
              <Stat icon={<Home size={14} />} label="浴室" value={`${data.bathrooms}`} />
            )}
          </div>

          {/* Features */}
          {data.featuresText && (
            <div className="rounded-2xl p-5"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <h3 className="text-sm font-semibold mb-2 uppercase tracking-wider" style={{ color: 'rgba(212,175,55,0.8)' }}>配置 / 设施</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>{data.featuresText}</p>
            </div>
          )}

          {/* Description */}
          {data.description && (
            <div className="rounded-2xl p-5 sm:p-6"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: 'rgba(212,175,55,0.8)' }}>房源详情</h3>
              <div className="prose prose-sm prose-invert max-w-none listing-desc"
                style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 1.7 }}
                dangerouslySetInnerHTML={{ __html: data.description }} />
            </div>
          )}

          {/* Map */}
          {data.location.lat > 0 && data.location.lng > 0 && (
            <div className="rounded-2xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="p-5 pb-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'rgba(212,175,55,0.8)' }}>地理位置</h3>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {data.address.plz} {data.address.city}{data.address.street ? ` · ${data.address.street}` : ''}
                </p>
              </div>
              <div className="relative" style={{ height: 380 }}>
                <MapContainer
                  center={[data.location.lat, data.location.lng]}
                  zoom={15}
                  scrollWheelZoom={false}
                  style={{ height: '100%', width: '100%', background: '#1a1a1a' }}
                  attributionControl={false}
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution=""
                  />
                  <Marker position={[data.location.lat, data.location.lng]} icon={goldPinIcon}>
                    <Popup className="custom-popup">
                      <div style={{ color: '#141414', fontWeight: 600, fontSize: 12 }}>{data.title}</div>
                      <div style={{ color: '#555', fontSize: 11, marginTop: 2 }}>
                        {data.address.plz} {data.address.city}
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
                <div className="absolute bottom-2 right-2 z-[400] flex gap-2">
                  <a href={`https://www.google.com/maps?q=${data.location.lat},${data.location.lng}`}
                    target="_blank" rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-colors"
                    style={{ background: 'rgba(20,20,20,0.85)', color: '#d4af37', backdropFilter: 'blur(6px)', border: '1px solid rgba(212,175,55,0.3)' }}>
                    Google 地图 <ExternalLink size={10} />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right column: price + contact */}
        <aside className="space-y-4 lg:sticky lg:top-24 self-start">
          <div className="rounded-2xl p-5"
            style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
            <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'rgba(212,175,55,0.7)' }}>
              {data.forRent ? '月租金' : '购买价'}
            </p>
            <p className="text-3xl font-bold" style={{ color: '#d4af37' }}>
              {fmtPrice(data.price, data.forRent, data.priceOnRequest, data.currency)}
            </p>
            {data.objektnummer && (
              <p className="text-[10px] mt-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
                房源编号：{data.objektnummer}
              </p>
            )}
          </div>

          <Link to="/about"
            className="block w-full text-center py-3 rounded-xl text-sm font-semibold transition-colors"
            style={{ background: '#d4af37', color: '#141414' }}>
            咨询此房源
          </Link>

        </aside>
      </div>
    </div>
  )
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl p-3"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
        {icon}
        {label}
      </div>
      <p className="text-base font-semibold text-white">{value}</p>
    </div>
  )
}
