import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Maximize2, Home, ImageIcon } from 'lucide-react'

/**
 * The single listing-card component, used both on HomePage's "近期推荐"
 * section and the full ListingsPage grid.
 *
 * Design per DESIGN.md §5.2:
 *   - 1px subtle border, no shadow at rest
 *   - 16px radius, 4:3 image, object-cover
 *   - Hover: -2px translate + gold-tinted border, NOT scale
 *   - Image hover: subtle scale(1.01) over 320ms, never zoom-in jumps
 *   - One gold pixel max (the price). Tag pills stay monochrome.
 */

export interface ListingCardData {
  id: string
  title: string
  typeName?: string
  forRent: boolean
  price: number
  priceOnRequest?: boolean
  sqm: number
  rooms: number
  buildYear?: number
  address: {
    plz: string
    city: string
    street?: string
    district?: string
  }
  coverImage: string | null
  imageCount?: number
}

interface Props {
  listing: ListingCardData
  /** Override link href (default `/listings/{id}`). */
  href?: string
  /** Compact = home page "near recommendations"; default = listings grid. */
  variant?: 'default' | 'compact'
  className?: string
}

function districtFromText(text?: string): number {
  if (!text) return 0
  const m = text.match(/Wien\s+(\d+)/i)
  return m ? parseInt(m[1]) : 0
}

function fmtPrice(price: number, forRent: boolean, onRequest?: boolean) {
  if (onRequest || !price) return '价格面议'
  if (forRent) return `€ ${price.toLocaleString('de-AT')}/月`
  if (price >= 1_000_000) {
    const mio = (price / 1_000_000).toFixed(2).replace(/\.?0+$/, '')
    return `€ ${mio} Mio.`
  }
  return `€ ${(price / 1000).toFixed(0)}K`
}

export function ListingCard({ listing, href, variant = 'default', className }: Props) {
  const district = districtFromText(listing.address.district)
  const link = href ?? `/listings/${listing.id}`

  return (
    <Link
      to={link}
      className={[
        'group block overflow-hidden rounded-xl bg-bg-elev-1',
        'border border-white/[0.06]',
        'transition-[transform,border-color] duration-base ease-standard',
        'hover:-translate-y-0.5 hover:border-gold-line',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base',
        className || '',
      ].join(' ')}
    >
      {/* ── Image (4:3 aspect, never letterboxed) ────────────────────── */}
      <div
        className="relative w-full overflow-hidden bg-bg-elev-2"
        style={{ aspectRatio: '4 / 3' }}
      >
        {listing.coverImage ? (
          <img
            src={listing.coverImage}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-slow ease-standard group-hover:scale-[1.01]"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon size={28} strokeWidth={1.5} className="text-fg-disabled" />
          </div>
        )}

        {/* Top-left badges — monochrome, never colored */}
        <div className="absolute left-3 top-3 z-10 flex gap-1.5">
          <span className="rounded-md bg-black/55 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-fg-primary backdrop-blur-sm">
            {listing.forRent ? '租' : '售'}
          </span>
          {district > 0 && (
            <span className="rounded-md bg-black/55 px-2 py-0.5 text-[10px] font-medium tracking-wide text-fg-secondary backdrop-blur-sm">
              {district}区
            </span>
          )}
        </div>

        {/* Image count — bottom-right, only when more than one */}
        {(listing.imageCount ?? 0) > 1 && (
          <span className="absolute bottom-3 right-3 z-10 flex items-center gap-1 rounded-md bg-black/55 px-2 py-0.5 text-[10px] font-medium text-fg-secondary backdrop-blur-sm">
            <ImageIcon size={9} strokeWidth={1.75} /> {listing.imageCount}
          </span>
        )}
      </div>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className={variant === 'compact' ? 'p-4' : 'p-5'}>
        {/* Title */}
        <h3 className="line-clamp-1 text-heading-md text-fg-primary">
          {listing.title || listing.typeName}
        </h3>

        {/* Address */}
        <p className="mt-1 flex items-center gap-1 text-caption text-fg-tertiary">
          <MapPin size={11} strokeWidth={1.5} className="shrink-0" />
          <span className="line-clamp-1">
            {listing.address.plz} {listing.address.city}
            {listing.address.street ? ` · ${listing.address.street}` : ''}
          </span>
        </p>

        {/* Meta — sqm · rooms · build year */}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-fg-secondary tabular">
          {listing.sqm > 0 && (
            <span className="flex items-center gap-1">
              <Maximize2 size={11} strokeWidth={1.5} />
              {Math.round(listing.sqm)} m²
            </span>
          )}
          {listing.rooms > 0 && (
            <>
              <span className="h-3 w-px bg-white/8" />
              <span className="flex items-center gap-1">
                <Home size={11} strokeWidth={1.5} />
                {listing.rooms} 室
              </span>
            </>
          )}
          {(listing.buildYear ?? 0) > 0 && (
            <>
              <span className="h-3 w-px bg-white/8" />
              <span>建于 {listing.buildYear}</span>
            </>
          )}
        </div>

        {/* Price — the only gold pixel in the card */}
        <div className="mt-4 flex items-baseline justify-between">
          <span className="text-heading-lg text-gold tabular">
            {fmtPrice(listing.price, listing.forRent, listing.priceOnRequest)}
          </span>
          <span className="text-caption text-fg-tertiary transition-colors duration-base ease-standard group-hover:text-fg-secondary">
            查看详情 →
          </span>
        </div>
      </div>
    </Link>
  )
}

// Re-export the formatter so older callers can still use it.
export { fmtPrice }
