import React, { useEffect, useRef, Component, useState } from 'react'
import { MapContainer, TileLayer, Marker, Tooltip, useMap, ZoomControl } from 'react-leaflet'
import L from 'leaflet'
import type { Auction } from '../types/auction'
import { formatPriceLabel, formatCurrency } from '../utils/formatters'

function createPriceIcon(label: string, isSelected: boolean, isPast: boolean): L.DivIcon {
  const bg = isSelected ? '#B8922A' : isPast ? '#6E685F' : '#1D3A2A'
  const textColor = isSelected ? '#FFFFFF' : '#D4A843'
  const border = '#D4A843'
  const opacity = isPast ? '0.7' : '1'
  const scale = isSelected ? 'scale(1.15)' : 'scale(1)'
  const zIndex = isSelected ? 9999 : 1000

  return L.divIcon({
    className: '',
    html: `
      <div style="transform:${scale};transition:transform 0.2s ease;z-index:${zIndex};position:relative;opacity:${opacity}">
        <div style="
          background:${bg};color:${textColor};border:1.5px solid ${border};border-radius:5px;
          padding:3px 9px;font-size:11px;font-weight:700;white-space:nowrap;
          font-family:Inter,system-ui,sans-serif;letter-spacing:0.03em;line-height:1.4;
          ${isSelected ? 'box-shadow:0 0 0 3px rgba(184,146,42,0.25),0 3px 8px rgba(0,0,0,0.4);' : 'box-shadow:0 2px 6px rgba(0,0,0,0.35);'}
        ">${label}</div>
        <div style="
          width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;
          border-top:5px solid ${bg};margin:0 auto;position:relative;top:-1px;
        "></div>
      </div>`,
    iconSize: [70, 36],
    iconAnchor: [35, 36],
    popupAnchor: [0, -38],
  })
}

function validCoord(a: Auction) {
  return isFinite(a.latitude) && isFinite(a.longitude) &&
    a.latitude !== 0 && a.longitude !== 0
}

function MapController({
  selectedId, auctions, initialFit,
}: {
  selectedId: string
  auctions: Auction[]
  initialFit: React.MutableRefObject<boolean>
}) {
  const map = useMap()

  useEffect(() => {
    if (initialFit.current || auctions.length === 0) return
    const valid = auctions.filter(validCoord)
    if (valid.length === 0) return
    try {
      const bounds = L.latLngBounds(valid.map((a) => [a.latitude, a.longitude]))
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 })
      initialFit.current = true
    } catch {}
  }, [auctions, map, initialFit])

  useEffect(() => {
    if (!selectedId) return
    const auction = auctions.find((a) => a.id === selectedId)
    if (!auction || !validCoord(auction)) return
    try {
      map.flyTo([auction.latitude, auction.longitude], 15, { duration: 0.7 })
    } catch {}
  }, [selectedId, auctions, map])

  return null
}

// Error boundary — catches Leaflet crashes so only the map shows an error,
// not the entire page
class MapErrorBoundary extends Component<
  { children: React.ReactNode },
  { error: string | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(e: Error) {
    return { error: e.message }
  }
  render() {
    if (this.state.error) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-cream-50 text-sm text-warm-500 p-6 text-center">
          <div>
            <div className="text-2xl mb-2">🗺️</div>
            <p className="font-medium text-warm-700 mb-1">地图加载失败</p>
            <p className="text-xs text-warm-400">{this.state.error}</p>
            <button
              onClick={() => this.setState({ error: null })}
              className="mt-3 px-3 py-1.5 bg-forest-700 text-cream-100 text-xs rounded"
            >
              重试
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

interface Props {
  auctions: Auction[]
  selectedId: string
  onSelect: (id: string) => void
}

const LAYERS = {
  light:     { label: '地图', url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',     attr: '© OpenStreetMap © CARTO', sub: 'abcd' },
  osm:       { label: '街道', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',                   attr: '© OpenStreetMap', sub: 'abc' },
  satellite: { label: '卫星', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attr: '© Esri', sub: undefined },
}
type LayerKey = keyof typeof LAYERS

export function MapView({ auctions, selectedId, onSelect }: Props) {
  const initialFit = useRef(false)
  const today = new Date().toISOString().split('T')[0]
  const validAuctions = auctions.filter(validCoord)
  const [layer, setLayer] = useState<LayerKey>('light')
  const current = LAYERS[layer]

  return (
    <div className="relative w-full h-full">
      {/* Layer switcher */}
      <div className="absolute top-3 right-3 z-[1000] flex rounded-lg overflow-hidden shadow-md border border-cream-200">
        {(Object.keys(LAYERS) as LayerKey[]).map((k) => (
          <button
            key={k}
            onClick={() => setLayer(k)}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              layer === k
                ? 'bg-forest-700 text-cream-100'
                : 'bg-white text-warm-600 hover:bg-cream-50'
            }`}
          >
            {LAYERS[k].label}
          </button>
        ))}
      </div>

      <MapErrorBoundary>
        <MapContainer
          center={[48.21, 16.37]}
          zoom={12}
          className="w-full h-full"
          zoomControl={false}
          attributionControl={true}
        >
          <TileLayer
            key={layer}
            url={current.url}
            attribution={current.attr}
            subdomains={current.sub ?? 'abc'}
            maxZoom={20}
          />
          <ZoomControl position="bottomright" />

          <MapController
            selectedId={selectedId}
            auctions={validAuctions}
            initialFit={initialFit}
          />

          {validAuctions.map((auction) => {
            const isSelected = auction.id === selectedId
            const isPast = auction.auctionDate < today
            const label = formatPriceLabel(auction.minimumBid)
            const icon = createPriceIcon(label, isSelected, isPast)

            return (
              <Marker
                key={auction.id}
                position={[auction.latitude, auction.longitude]}
                icon={icon}
                zIndexOffset={isSelected ? 2000 : 0}
                eventHandlers={{ click: () => onSelect(auction.id) }}
              >
                <Tooltip direction="top" offset={[0, -40]} opacity={1} className="leaflet-custom-tooltip">
                  <MapTooltip auction={auction} />
                </Tooltip>
              </Marker>
            )
          })}
        </MapContainer>
      </MapErrorBoundary>

      <div className="absolute bottom-8 left-2 z-[1000] bg-white bg-opacity-80 backdrop-blur-sm rounded px-2 py-1 text-xs text-warm-500 border border-cream-200">
        ⚠ 演示版坐标：近似区级落点，非精确地址
      </div>
    </div>
  )
}

function MapTooltip({ auction }: { auction: Auction }) {
  return (
    <div className="p-3 min-w-[220px] max-w-[280px]">
      <div className="text-xs font-semibold text-forest-700 font-serif leading-tight mb-1">
        {auction.title}
      </div>
      <div className="text-xs text-warm-600 mb-2 leading-tight">{auction.address}</div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        <div>
          <span className="text-warm-400">起拍价</span>
          <div className="font-semibold text-gold-600">{formatCurrency(auction.minimumBid)}</div>
        </div>
        <div>
          <span className="text-warm-400">估值</span>
          <div className="font-semibold text-warm-700">{formatCurrency(auction.estimatedValue)}</div>
        </div>
      </div>
      <div className="mt-1.5 text-xs text-warm-400">
        📅 {auction.auctionDate} · 案号 {auction.caseNumber}
      </div>
    </div>
  )
}
