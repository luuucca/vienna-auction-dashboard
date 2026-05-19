export type AuctionCategory =
  | 'Eigentumswohnung'
  | 'Wohnungseigentumsobjekt'
  | 'Einfamilienhaus'
  | 'Mehrfamilienhaus'
  | 'Mietshaus'
  | 'gewerbliche Liegenschaft'
  | 'Sonstiges'

export type GeocodeSource = 'official' | 'manual' | 'approximate'

export type SortOption =
  | 'date-asc'
  | 'value-desc'
  | 'sqm-value-desc'
  | 'bid-asc'
  | 'bid-ratio-asc'
  | 'added-desc'

export type AuctionStatus = 'aktiv' | 'verschoben' | 'ueberbot'

export interface Auction {
  id: string
  caseNumber: string
  auctionDate: string
  address: string
  district: string
  title: string
  category: AuctionCategory
  estimatedValue: number
  minimumBid: number
  area: number
  pricePerSqm: number
  deposit: number
  latitude: number
  longitude: number
  /**
   * geocodeSource 标识坐标来源精度：
   * - 'official'    : 通过 Stadt Wien OGD AddressService 接口精确落点（正式上线时应使用此方式）
   * - 'manual'      : 人工标注的精确坐标
   * - 'approximate' : 当前演示版本使用的近似坐标（以区级中心点估算）
   *
   * 正式版本接入建议：使用 https://data.wien.gv.at/ogdwien/rest/ogdaddress
   * 参数：ADDRESS=<地址>&SRSNAME=EPSG:4326
   * 返回 GeoJSON，提取 coordinates[1] (lat) 和 coordinates[0] (lng)
   */
  geocodeSource: GeocodeSource
  ownershipType: string
  summary: string
  riskTags: string[]
  detailUrl: string
  pdfUrl: string
  shortReportUrl: string
  /**
   * Auction lifecycle status, populated by the scraper:
   *   - 'aktiv'     : 已公示,即将开拍
   *   - 'verschoben': 已延期,新日期在 auctionDate
   *   - 'ueberbot'  : 已落槌,但仍处于 Überbotsfrist —— 理论上还能被超价竞买
   *
   * Older records scraped before this field existed may be missing it;
   * the frontend treats `undefined` as 'aktiv' for backwards compat.
   */
  status?: AuctionStatus
  /** ISO timestamp of when the scraper first encountered this UNID. */
  firstSeenAt?: string
}

export interface FilterState {
  search: string
  category: string
  sortBy: SortOption
}
