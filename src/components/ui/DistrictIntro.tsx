import React from 'react'
import { useReducedMotion } from 'framer-motion'

/**
 * Per-district "neighborhood intro" video banner.
 *
 * Drops into a listing detail page between the hero gallery and the
 * stats grid. Shows a 5-second Seedance-generated cinematic clip of
 * the district + a single-line tagline, giving Chinese buyers a
 * one-glance sense of the area's character before they read the
 * spec rows.
 *
 * If we don't yet have a video for the requested district, the
 * component returns null (degrades silently — the spec rows still
 * make sense without it).
 */

interface DistrictMeta {
  name: string
  tagline: string
  /** mp4 filename in /public/districts. Null = video not generated yet */
  file: string | null
}

const DISTRICT_INTROS: Record<number, DistrictMeta> = {
  1:  { name: 'Innere Stadt',     tagline: '维也纳一区核心 · 老城教堂尖塔与皇家宫殿',           file: null },
  2:  { name: 'Leopoldstadt',     tagline: 'Prater 摩天轮 · 多瑙运河岸 · 新老交融',            file: null },
  3:  { name: 'Landstraße',       tagline: 'Belvedere 美景宫边 · 大使馆区 · 安静古典',          file: null },
  4:  { name: 'Wieden',           tagline: 'Karlskirche 边 · TU Wien 大学区 · 文艺街角',        file: null },
  5:  { name: 'Margareten',       tagline: '5 区生活气 · Naschmarkt 早市 · 多元文化',           file: null },
  6:  { name: 'Mariahilf',        tagline: 'Mariahilfer Straße 步行街 · 购物 + 美食中心',       file: null },
  7:  { name: 'Neubau',           tagline: 'MuseumsQuartier · 设计师街区 · 文艺最浓',          file: null },
  8:  { name: 'Josefstadt',       tagline: '小巷与剧院 · 学术氛围 · 老城气质',                 file: null },
  9:  { name: 'Alsergrund',       tagline: '维也纳大学医学院 · 老建筑 + 安静街道',              file: null },
  10: { name: 'Favoriten',        tagline: '10 区多元化 · Hauptbahnhof 枢纽 · 新建居住区',     file: null },
  11: { name: 'Simmering',        tagline: '工业转型街区 · 多瑙河南岸 · 性价比优',              file: null },
  12: { name: 'Meidling',         tagline: 'U6 沿线 · 中产居住区 · 通勤便利',                  file: null },
  13: { name: 'Hietzing',         tagline: 'Schönbrunn 美泉宫 · 高端别墅区 · 大片绿地',         file: null },
  14: { name: 'Penzing',          tagline: '14 区静好 · 大片公园绿地 · 家庭友好',              file: null },
  15: { name: 'Rudolfsheim-Fünfhaus', tagline: 'Westbahnhof 西站 · 多元文化 · 房价友好',       file: null },
  16: { name: 'Ottakring',        tagline: '16 区生活气浓 · Brunnenmarkt 集市 · 老建筑',       file: null },
  17: { name: 'Hernals',          tagline: '17 区山坡 · 葡萄园边缘 · 安静住宅',                file: null },
  18: { name: 'Währing',          tagline: 'Türkenschanzpark 公园 · 高端公寓 · 国际学校带',    file: null },
  19: { name: 'Döbling',          tagline: 'Grinzing 葡萄园别墅 · 维也纳高端首选 · 林荫绿地',  file: null },
  20: { name: 'Brigittenau',      tagline: '20 区多瑙岛旁 · 房价合理 · 通勤便利',              file: null },
  21: { name: 'Floridsdorf',      tagline: '北部新城 · 大片绿地 · 新建公寓楼',                file: null },
  22: { name: 'Donaustadt',       tagline: 'DC Tower 玻璃塔 · 多瑙河现代新城 · 22 区新区',
        file: '/districts/22-donaustadt.mp4' },
  23: { name: 'Liesing',          tagline: '维也纳森林边 · 安静别墅区 · 适合家庭',              file: null },
}

export function DistrictIntro({ district }: { district: number }) {
  const reduce = useReducedMotion()
  const meta = DISTRICT_INTROS[district]
  if (!meta || !meta.file) return null

  return (
    <section
      className="relative overflow-hidden rounded-2xl mb-8"
      style={{ aspectRatio: '21 / 9' }}
      aria-label={`${district} 区 ${meta.name} — ${meta.tagline}`}
    >
      <video
        src={meta.file}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay={!reduce}
        loop
        muted
        playsInline
        preload="metadata"
        // eslint-disable-next-line react/no-unknown-property
        x5-video-player-type="h5"
        // eslint-disable-next-line react/no-unknown-property
        webkit-playsinline="true"
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore — valid HTML attribute
        disablePictureInPicture
      />
      {/* Bottom-fade gradient so the caption sits over a dark band */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-2/3 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, rgba(12,12,12,0.45) 55%, rgba(12,12,12,0.92) 100%)',
        }}
      />
      {/* Caption */}
      <div className="absolute left-5 sm:left-7 right-5 sm:right-7 bottom-5 sm:bottom-6 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-overline text-gold/85 mb-1.5 uppercase tabular-nums">
            {String(district).padStart(2, '0')}.&nbsp;BEZIRK · {meta.name}
          </p>
          <p className="text-body sm:text-body-lg text-fg-primary leading-snug max-w-[64ch]">
            {meta.tagline}
          </p>
        </div>
      </div>
    </section>
  )
}
