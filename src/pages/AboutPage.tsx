import React from 'react'
import { Mail, Phone, ArrowRight, ArrowUpRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { ButtonLink } from '../components/ui/Button'
import { AmbientVideoBg } from '../components/ui/AmbientVideoBg'

/**
 * Contact page — editorial layout, asymmetric.
 *
 * Composition strategy:
 *   1. Hero panel keeps the AmbientVideoBg + scanlines, but the type
 *      breaks out of the centered prose column into an offset layout
 *      with a vertical kicker and a channel index in the gutter.
 *   2. The 小红书 channel is the hero of the contact list — given a
 *      tall, generous panel that doesn't share dimensions with the
 *      smaller channels below. This is the user's primary lead source
 *      so it earns the visual weight.
 *   3. Secondary channels (微信, 邮件, 电话) sit in an offset 12-col
 *      grid with intentional empty spans for rhythm. Borders are
 *      replaced with hairlines and negative space; no identical cards.
 *   4. A thin footnote-style row introduces MONOLAW, then the auction
 *      CTA closes the page with a single committed gold panel.
 *
 * No icon-in-circle stat-card cliché. Gold appears only on:
 *   - the small hero index marker
 *   - the 小红书 outbound chevron
 *   - the email address (it IS the link)
 *   - the auction CTA
 *
 * Motion: staggered editorial reveal, 60ms apart, exponential ease-out
 * matching DESIGN.md §6.1. No bounce, no scale.
 */

const ease = [0.22, 1, 0.36, 1] as const

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease },
})

const Hairline = ({ className = '' }: { className?: string }) => (
  <div aria-hidden className={`h-px bg-white/[0.08] ${className}`} />
)

const ChannelNum = ({ n }: { n: string }) => (
  <span className="text-overline text-fg-tertiary tabular-nums">{n}</span>
)

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-bg-base text-fg-primary pt-16">

      {/* ── HERO ──────────────────────────────────────────────────────
          AmbientVideoBg behind an asymmetric type layout. The display
          headline sits left, oversized; a vertical "CONTACT" kicker
          marks the column; a small index "06 channels" anchors the
          right rail. Gradient lift bottom-fades into the body. */}
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <AmbientVideoBg
          src={[
            '/about/kaffeehaus.mp4',
            '/about/street-twilight.mp4',
            '/contact/apartment-keys.mp4',
            '/contact/kitchen-dawn.mp4',
            '/contact/plant-window.mp4',
          ]}
          opacity={0.22}
          scanlines
        />
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(12,12,12,0.35) 0%, rgba(12,12,12,0.55) 55%, rgba(12,12,12,0.95) 100%)',
          }}
        />

        <div className="relative max-w-content mx-auto px-5 sm:px-8 lg:px-12 pt-20 pb-24 sm:pt-28 sm:pb-32">
          {/* Vertical kicker — sits in the left gutter on desktop,
              becomes a horizontal overline on mobile. */}
          <div className="hidden lg:block absolute left-12 top-28">
            <div
              className="text-overline text-gold/70"
              style={{
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)',
              }}
            >
              Contact ·  联系
            </div>
          </div>

          <div className="lg:pl-24">
            <p className="lg:hidden text-overline text-gold/70 mb-6">Contact</p>

            <motion.h1
              {...fadeUp(0)}
              className="font-serif text-fg-primary tracking-tight leading-[0.95]"
            >
              <span className="block text-[44px] sm:text-[64px] lg:text-[96px]">
                联系
              </span>
              <span className="block text-[44px] sm:text-[64px] lg:text-[96px] -mt-1 text-fg-secondary">
                <em className="not-italic font-serif">我们</em>
              </span>
            </motion.h1>

            <motion.div
              {...fadeUp(0.12)}
              className="mt-10 grid grid-cols-1 sm:grid-cols-12 gap-y-6 sm:gap-x-8"
            >
              <p className="sm:col-span-7 text-body-lg text-fg-secondary max-w-prose">
                维也纳房产、法拍、出租。任何疑问，直接联系。
                <br className="hidden sm:block" />
                中文接洽，从看房到过户。
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── PRIMARY: 小红书 ───────────────────────────────────────────
          The single hero contact panel. Tall, asymmetric, no frame.
          Logo lives in the left rail; copy sweeps wide across the
          remaining columns with a display-scale handle. */}
      <section className="relative">
        <div className="max-w-content mx-auto px-5 sm:px-8 lg:px-12 pt-20 sm:pt-28">
          <motion.a
            {...fadeUp(0.05)}
            href="https://www.xiaohongshu.com"
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <div className="grid grid-cols-12 gap-x-6 sm:gap-x-10 items-start">
              {/* Index + logo column */}
              <div className="col-span-12 sm:col-span-3 lg:col-span-2 flex sm:block items-center gap-4 mb-6 sm:mb-0">
                <ChannelNum n="01" />
                <div className="w-14 h-14 sm:w-20 sm:h-20 sm:mt-4 rounded-xl overflow-hidden bg-bg-elev-1 ring-1 ring-white/[0.06]">
                  <img
                    src="/xiaohongshu-logo.png"
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Wide handle column */}
              <div className="col-span-12 sm:col-span-9 lg:col-span-9">
                <p className="text-overline text-fg-tertiary mb-3">
                  小红书 · 主账号
                </p>
                <h2 className="font-serif text-[32px] sm:text-[44px] lg:text-[56px] leading-[1.05] tracking-tight text-fg-primary mb-5">
                  奥匈置业研究所{' '}
                  <span className="text-fg-tertiary">|</span>{' '}
                  <span className="text-gold/90">CH</span>
                </h2>
                <p className="text-body-lg text-fg-secondary max-w-[52ch]">
                  日更房源、政策解读、看房 vlog。搜索账号直接私信，回应通常在 24 小时内。
                </p>
                <div className="mt-7 inline-flex items-center gap-2 text-caption text-fg-tertiary group-hover:text-gold transition-colors duration-base ease-standard">
                  <span className="tracking-[0.08em]">前往主页</span>
                  <ArrowUpRight
                    size={14}
                    strokeWidth={1.5}
                    className="transition-transform duration-base ease-standard group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </div>
              </div>
            </div>
          </motion.a>
        </div>
      </section>

      {/* ── SECONDARY CHANNELS — asymmetric grid ────────────────────
          12-col offset layout. WeChat panel spans wider (it carries
          the QR), email + phone share a narrower stack on the right.
          Hairlines instead of card borders; intentional empty cells
          for rhythm. */}
      <section className="relative">
        <div className="max-w-content mx-auto px-5 sm:px-8 lg:px-12 pt-24 sm:pt-32">
          <Hairline className="mb-16" />

          <div className="grid grid-cols-12 gap-x-6 sm:gap-x-10 gap-y-16">

            {/* ── 02. 微信 — wider panel with QR image ─────────── */}
            <motion.div
              {...fadeUp(0.05)}
              className="col-span-12 lg:col-span-7"
            >
              <div className="flex items-start gap-4 mb-6">
                <ChannelNum n="02" />
                <p className="text-overline text-fg-tertiary">微信公众号</p>
              </div>

              <div className="flex flex-col sm:flex-row items-start gap-6 sm:gap-10">
                <div className="flex-1 min-w-0 order-2 sm:order-1">
                  <h3 className="font-serif text-[28px] sm:text-[36px] leading-[1.1] tracking-tight text-fg-primary mb-3">
                    扫码添加
                  </h3>
                  <p className="text-body text-fg-secondary max-w-[40ch]">
                    长按或扫描二维码即可添加微信。
                    <br />
                    适合需要发送户型图、合同的客户。
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg overflow-hidden bg-bg-elev-2 flex-shrink-0">
                      <img
                        src="/wechat-logo.png"
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-caption text-fg-tertiary">
                      WeChat · 即时回复
                    </span>
                  </div>
                </div>

                {/* QR — keeps a true frame because the QR itself
                    demands a high-contrast white field to scan. This
                    is the one deliberate "box" on the page. */}
                <div className="order-1 sm:order-2 flex-shrink-0 rounded-xl overflow-hidden bg-white p-2 ring-1 ring-white/[0.06]" style={{ width: 132, height: 132 }}>
                  <img
                    src="/wechat-qr.png"
                    alt="微信二维码"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const el = e.currentTarget
                      el.style.display = 'none'
                      const p = el.parentElement!
                      p.innerHTML =
                        '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#888;font-size:10px">QR</div>'
                    }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Spacer column gives the right side a deliberate breath
                before the email / phone stack. */}
            <div className="hidden lg:block lg:col-span-1" />

            {/* ── 03 + 04. Email & Phone — narrow stack, right-aligned */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-12">
              <motion.a
                {...fadeUp(0.1)}
                href="mailto:L.ZHANG@VALERTO.IMMO"
                className="group block"
              >
                <div className="flex items-center gap-4 mb-3">
                  <ChannelNum n="03" />
                  <p className="text-overline text-fg-tertiary">邮件</p>
                </div>
                <p className="text-heading-md sm:text-heading-lg text-gold group-hover:text-gold-hover transition-colors duration-base ease-standard break-all leading-[1.25]">
                  L.ZHANG@VALERTO.IMMO
                </p>
                <p className="mt-2 text-caption text-fg-tertiary">
                  <Mail size={11} strokeWidth={1.5} className="inline-block mr-1.5 -mt-px" />
                  24 小时内回复
                </p>
              </motion.a>

              <motion.a
                {...fadeUp(0.15)}
                href="tel:+436705566666"
                className="group block"
              >
                <div className="flex items-center gap-4 mb-3">
                  <ChannelNum n="04" />
                  <p className="text-overline text-fg-tertiary">电话</p>
                </div>
                <p className="text-heading-md sm:text-heading-lg text-fg-primary tabular-nums group-hover:text-gold transition-colors duration-base ease-standard leading-[1.25]">
                  +43 670 5566666
                </p>
                <p className="mt-2 text-caption text-fg-tertiary">
                  <Phone size={11} strokeWidth={1.5} className="inline-block mr-1.5 -mt-px" />
                  奥地利本地号码 · GMT+1
                </p>
              </motion.a>
            </div>
          </div>

          <Hairline className="mt-20" />
        </div>
      </section>

      {/* ── 05. MONOLAW — footnote line ─────────────────────────────
          A single editorial line, not a card. Reads as an annotation
          rather than a stacked tile. */}
      <section className="relative">
        <div className="max-w-content mx-auto px-5 sm:px-8 lg:px-12 pt-12">
          <motion.a
            {...fadeUp(0.05)}
            href="https://www.monolaw.at/about-1"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col sm:flex-row sm:items-baseline gap-x-8 gap-y-3"
          >
            <div className="flex items-center gap-4 flex-shrink-0">
              <ChannelNum n="05" />
              <p className="text-overline text-fg-tertiary">法律支持</p>
            </div>
            <div className="flex-1 flex flex-col sm:flex-row sm:items-baseline gap-x-4 gap-y-1">
              <span className="font-serif text-heading-lg sm:text-heading-xl text-fg-primary tracking-tight">
                MONOLAW
              </span>
              <span className="text-body text-fg-secondary">
                奥地利本地律师事务所 · 房产法律咨询
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 text-caption text-fg-tertiary group-hover:text-gold transition-colors duration-base ease-standard">
              前往
              <ArrowUpRight
                size={12}
                strokeWidth={1.5}
                className="transition-transform duration-base ease-standard group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </span>
          </motion.a>
        </div>
      </section>

      {/* ── 06. Auction CTA — closing committed gold band ──────────
          One panel, full width inside the content rail, gold tint.
          The page's one primary CTA per DESIGN.md §5.1. */}
      <section className="relative">
        <div className="max-w-content mx-auto px-5 sm:px-8 lg:px-12 pt-16 pb-24 sm:pb-32">
          <motion.div
            {...fadeUp(0.1)}
            className="relative overflow-hidden rounded-2xl bg-gold-tint border border-gold-line"
          >
            <div className="relative grid grid-cols-12 gap-6 items-center p-7 sm:p-10">
              <div className="col-span-12 sm:col-span-8">
                <p className="text-overline text-gold/80 mb-4">下一步</p>
                <h3 className="font-serif text-[26px] sm:text-[34px] leading-[1.15] tracking-tight text-fg-primary mb-3">
                  立即查看法拍房机会
                </h3>
                <p className="text-body text-fg-secondary max-w-[44ch] tabular-nums">
                  60+ 条在拍房源 · 起拍价低至评估价 50%
                </p>
              </div>
              <div className="col-span-12 sm:col-span-4 flex sm:justify-end">
                <ButtonLink
                  to="/auction"
                  variant="primary"
                  size="md"
                  trailingIcon={<ArrowRight size={13} strokeWidth={1.75} />}
                >
                  进入看板
                </ButtonLink>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  )
}
