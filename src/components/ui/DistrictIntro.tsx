import React from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

/**
 * Full-screen "neighborhood intro" overlay that plays before the
 * listing detail content is revealed.
 *
 * On mount (page navigation): if the district has a generated video
 * AND the user hasn't seen it this session, show a full-viewport
 * black overlay with the cinematic clip playing center-stage,
 * district name typeset large, and a Skip button top-right. When the
 * video ends or the user dismisses, the overlay fades out and the
 * actual listing page underneath is revealed.
 *
 * Per-session memory via sessionStorage so the same district doesn't
 * replay every time you browse another listing in it. Tab close /
 * new tab resets, which is the right cadence — feels fresh on each
 * visit but doesn't get in the way of comparison shopping.
 *
 * prefers-reduced-motion: dismiss instantly, no playback.
 */

interface DistrictMeta {
  name: string
  tagline: string
  file: string | null
}

const DISTRICT_INTROS: Record<number, DistrictMeta> = {
  1:  { name: 'Innere Stadt',     tagline: '维也纳一区核心 · 老城教堂尖塔与皇家宫殿',           file: '/districts/01-innere-stadt.mp4' },
  2:  { name: 'Leopoldstadt',     tagline: 'Prater 摩天轮 · 多瑙运河岸 · 新老交融',            file: null },
  3:  { name: 'Landstraße',       tagline: 'Belvedere 美景宫边 · 大使馆区 · 安静古典',          file: '/districts/03-landstrasse.mp4' },
  4:  { name: 'Wieden',           tagline: 'Karlskirche 边 · TU Wien 大学区 · 文艺街角',        file: '/districts/04-wieden.mp4' },
  5:  { name: 'Margareten',       tagline: '5 区生活气 · Naschmarkt 早市 · 多元文化',           file: '/districts/05-margareten.mp4' },
  6:  { name: 'Mariahilf',        tagline: 'Mariahilfer Straße 步行街 · 购物 + 美食中心',       file: '/districts/06-mariahilf.mp4' },
  7:  { name: 'Neubau',           tagline: 'MuseumsQuartier · 设计师街区 · 文艺最浓',          file: '/districts/07-neubau.mp4' },
  8:  { name: 'Josefstadt',       tagline: '小巷与剧院 · 学术氛围 · 老城气质',                 file: null },
  9:  { name: 'Alsergrund',       tagline: '维也纳大学医学院 · 老建筑 + 安静街道',              file: '/districts/09-alsergrund.mp4' },
  10: { name: 'Favoriten',        tagline: '10 区多元化 · Hauptbahnhof 枢纽 · 新建居住区',     file: null },
  11: { name: 'Simmering',        tagline: '工业转型街区 · 多瑙河南岸 · 性价比优',              file: null },
  12: { name: 'Meidling',         tagline: 'U6 沿线 · 中产居住区 · 通勤便利',                  file: null },
  13: { name: 'Hietzing',         tagline: 'Schönbrunn 美泉宫 · 高端别墅区 · 大片绿地',         file: '/districts/13-hietzing.mp4' },
  14: { name: 'Penzing',          tagline: '14 区静好 · 大片公园绿地 · 家庭友好',              file: null },
  15: { name: 'Rudolfsheim-Fünfhaus', tagline: 'Westbahnhof 西站 · 多元文化 · 房价友好',       file: null },
  16: { name: 'Ottakring',        tagline: '16 区生活气浓 · Brunnenmarkt 集市 · 老建筑',       file: null },
  17: { name: 'Hernals',          tagline: '17 区山坡 · 葡萄园边缘 · 安静住宅',                file: null },
  18: { name: 'Währing',          tagline: 'Türkenschanzpark 公园 · 高端公寓 · 国际学校带',    file: null },
  19: { name: 'Döbling',          tagline: 'Grinzing 葡萄园别墅 · 维也纳高端首选 · 林荫绿地',  file: null },
  20: { name: 'Brigittenau',      tagline: '20 区多瑙岛旁 · 房价合理 · 通勤便利',              file: null },
  21: { name: 'Floridsdorf',      tagline: '北部新城 · 大片绿地 · 新建公寓楼',                file: null },
  22: { name: 'Donaustadt',       tagline: 'DC Tower 玻璃塔 · 多瑙河现代新城',
        file: '/districts/22-donaustadt.mp4' },
  23: { name: 'Liesing',          tagline: '维也纳森林边 · 安静别墅区 · 适合家庭',              file: null },
}

const SESSION_KEY = (d: number) => `district-intro-${d}`

export function DistrictIntro({ district }: { district: number }) {
  const reduce = useReducedMotion()
  const meta = DISTRICT_INTROS[district]

  // Initial visibility derived lazily so the overlay never flashes
  // for districts without a video, or for users who already saw the
  // clip this session.
  const [show, setShow] = React.useState(() => {
    if (!meta || !meta.file) return false
    if (reduce) return false
    if (typeof window === 'undefined') return false
    try {
      if (sessionStorage.getItem(SESSION_KEY(district)) === '1') return false
    } catch { /* private mode etc. */ }
    return true
  })

  // Mark as seen the moment the overlay mounts so back-navigation
  // doesn't replay.
  React.useEffect(() => {
    if (show) {
      try { sessionStorage.setItem(SESSION_KEY(district), '1') } catch {}
    }
  }, [show, district])

  // Keyboard escape dismiss
  React.useEffect(() => {
    if (!show) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShow(false)
    }
    window.addEventListener('keydown', onKey)
    // Lock body scroll while the intro is playing
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [show])

  if (!meta || !meta.file) return null

  const ease = [0.22, 1, 0.36, 1] as const

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="district-intro"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease }}
          className="fixed inset-0 z-[9999] bg-black"
          aria-label={`${district} 区 ${meta.name} 简介`}
        >
          {/* Cinematic clip */}
          <video
            src={meta.file}
            autoPlay
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 0.85 }}
            // eslint-disable-next-line react/no-unknown-property
            x5-video-player-type="h5"
            // eslint-disable-next-line react/no-unknown-property
            webkit-playsinline="true"
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore — valid HTML attribute
            disablePictureInPicture
            onEnded={() => setShow(false)}
            onError={() => setShow(false)} // fail-safe: never block page
          />

          {/* Dim + radial vignette so the centered type stays sharp */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 80% 55% at 50% 50%, rgba(12,12,12,0.55) 0%, rgba(12,12,12,0.88) 100%)',
            }}
          />

          {/* Centered district typography */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease }}
            className="absolute inset-0 flex items-center justify-center px-5"
          >
            <div className="text-center max-w-2xl">
              <p
                className="text-overline text-gold/90 mb-4 tracking-[0.42em]"
                style={{ textShadow: '0 1px 12px rgba(0,0,0,0.6)' }}
              >
                {String(district).padStart(2, '0')}.&nbsp;BEZIRK
              </p>
              <h1
                className="font-serif text-fg-primary tracking-tight mb-5"
                style={{
                  fontSize: 'clamp(48px, 9vw, 112px)',
                  lineHeight: 1.02,
                  textShadow: '0 2px 28px rgba(0,0,0,0.65)',
                }}
              >
                {meta.name}
              </h1>
              <p
                className="text-body-lg text-fg-secondary leading-relaxed"
                style={{ textShadow: '0 1px 12px rgba(0,0,0,0.6)' }}
              >
                {meta.tagline}
              </p>
            </div>
          </motion.div>

          {/* Skip button — top right */}
          <motion.button
            type="button"
            onClick={() => setShow(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.2, ease }}
            className="absolute top-5 right-5 sm:top-7 sm:right-7 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/[0.15] text-caption text-fg-secondary hover:text-gold hover:border-gold-line transition-colors duration-base ease-standard"
            aria-label="跳过简介"
          >
            跳过
            <ChevronRight size={12} strokeWidth={1.5} />
          </motion.button>

          {/* Bottom progress hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.6, ease }}
            className="absolute bottom-6 left-0 right-0 text-center text-caption text-fg-tertiary tabular-nums"
          >
            进入房源详情…
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
