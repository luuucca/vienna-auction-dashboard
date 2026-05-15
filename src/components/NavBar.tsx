import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, ChevronDown } from 'lucide-react'

interface NavItem {
  to?: string
  label: string
  children?: { to: string; label: string; desc?: string }[]
}

const navLinks: NavItem[] = [
  { to: '/',             label: '首页' },
  { to: '/listings',     label: '房源' },
  { to: '/auction',      label: '法拍房' },
  {
    label: '工具',
    children: [
      { to: '/quiz',          label: '资格测试',      desc: '90 秒判断能否在维也纳买房' },
      { to: '/mortgage',      label: '贷款计算器',     desc: '月供 + 税费一键算清' },
      { to: '/buying-guide',  label: '购房指南',       desc: '完整购房流程与税费规则' },
      { to: '/market',        label: '房价走势',       desc: '5 年趋势 + 23 区均价对比' },
    ],
  },
  { to: '/list-property', label: '业主委托' },
  { to: '/about',        label: '联系' },
]

export function NavBar() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const toolsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll while mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [open])

  // Close tools dropdown on outside click
  useEffect(() => {
    if (!toolsOpen) return
    const onDoc = (e: MouseEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) setToolsOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [toolsOpen])

  // Close tools when route changes
  useEffect(() => { setToolsOpen(false) }, [pathname])

  const isToolsActive = navLinks
    .find(l => l.children)
    ?.children?.some(c => pathname === c.to) ?? false

  return (
    <>
      <nav
        className={[
          'fixed top-0 left-0 right-0 z-50',
          'bg-bg-base border-b',
          'transition-[height,border-color] duration-base ease-standard',
          scrolled ? 'h-14 border-white/[0.06]' : 'h-16 border-transparent',
        ].join(' ')}
      >
        <div className="max-w-content mx-auto h-full px-4 sm:px-6 lg:px-10 flex items-center justify-between">

          {/* Wordmark */}
          <Link
            to="/"
            className="font-semibold tracking-tight text-gold hover:text-gold-hover transition-colors duration-base ease-standard"
            style={{ fontSize: 15, letterSpacing: '-0.01em' }}
          >
            奥匈置业研究所
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(item => {
              if (item.children) {
                const active = isToolsActive
                return (
                  <div key={item.label} className="relative" ref={toolsRef}>
                    <button
                      type="button"
                      onClick={() => setToolsOpen(o => !o)}
                      className={[
                        'relative px-3 py-2 text-body transition-colors duration-base ease-standard',
                        'inline-flex items-center gap-1',
                        active ? 'text-fg-primary font-medium' : 'text-fg-secondary hover:text-fg-primary',
                      ].join(' ')}
                    >
                      {item.label}
                      <ChevronDown
                        size={13}
                        strokeWidth={1.5}
                        className={`transition-transform duration-base ease-standard ${toolsOpen ? 'rotate-180' : ''}`}
                      />
                      {active && (
                        <span aria-hidden className="absolute left-3 right-7 -bottom-px h-px bg-gold" />
                      )}
                    </button>

                    {/* Dropdown */}
                    {toolsOpen && (
                      <div
                        className="absolute right-0 top-full mt-2 w-72 rounded-xl p-2 bg-bg-elev-1 border border-white/[0.08] shadow-card-hover"
                        style={{ animation: 'sectionFadeUp 0.18s var(--ease-standard) both' }}
                      >
                        {item.children.map(c => {
                          const cActive = pathname === c.to
                          return (
                            <Link
                              key={c.to}
                              to={c.to}
                              className={[
                                'block px-3 py-2.5 rounded-lg transition-[background,color] duration-base ease-standard',
                                cActive
                                  ? 'bg-gold-tint text-gold'
                                  : 'text-fg-primary hover:bg-bg-elev-2 hover:text-fg-primary',
                              ].join(' ')}
                              onClick={() => setToolsOpen(false)}
                            >
                              <div className="text-body font-medium">{c.label}</div>
                              {c.desc && (
                                <div className="text-caption text-fg-tertiary mt-0.5">{c.desc}</div>
                              )}
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              }

              const active = pathname === item.to
              return (
                <Link
                  key={item.to}
                  to={item.to!}
                  className={[
                    'relative px-3 py-2 text-body transition-colors duration-base ease-standard',
                    active ? 'text-fg-primary font-medium' : 'text-fg-secondary hover:text-fg-primary',
                  ].join(' ')}
                >
                  {item.label}
                  {active && (
                    <span aria-hidden className="absolute left-3 right-3 -bottom-px h-px bg-gold" />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            className="md:hidden -mr-2 p-2 text-fg-secondary hover:text-fg-primary transition-colors duration-base ease-standard active:scale-95"
            aria-label={open ? '关闭菜单' : '打开菜单'}
          >
            {open ? <X size={20} strokeWidth={1.75} /> : <Menu size={20} strokeWidth={1.75} />}
          </button>
        </div>
      </nav>

      {/* ── Mobile menu — full-screen overlay ───────────────────────────── */}
      <div
        className={[
          'fixed inset-0 z-40 md:hidden',
          'transition-[opacity,visibility] duration-base ease-standard',
          open ? 'opacity-100 visible' : 'opacity-0 invisible',
        ].join(' ')}
        style={{ background: 'rgba(12,12,12,0.96)', backdropFilter: 'blur(8px)' }}
        onClick={() => setOpen(false)}
      >
        <div
          className="absolute inset-0 pt-20 px-6 flex flex-col gap-1 overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {navLinks.flatMap((item, i) => {
            if (item.children) {
              return [
                <div
                  key={item.label}
                  className="block py-3 mt-2 text-overline uppercase tracking-[0.25em] text-fg-tertiary"
                  style={{ animation: open ? `heroFadeUp 0.4s var(--ease-standard) ${0.05 + i * 0.04}s both` : undefined }}
                >
                  {item.label}
                </div>,
                ...item.children.map((c, ci) => {
                  const cActive = pathname === c.to
                  return (
                    <Link
                      key={c.to}
                      to={c.to}
                      onClick={() => setOpen(false)}
                      className={[
                        'block py-3 pl-3 text-heading-lg transition-colors duration-base ease-standard',
                        cActive ? 'text-gold' : 'text-fg-primary hover:text-gold',
                      ].join(' ')}
                      style={{ animation: open ? `heroFadeUp 0.4s var(--ease-standard) ${0.1 + (i + ci) * 0.04}s both` : undefined }}
                    >
                      {c.label}
                    </Link>
                  )
                }),
              ]
            }
            const active = pathname === item.to
            return [
              <Link
                key={item.to}
                to={item.to!}
                onClick={() => setOpen(false)}
                className={[
                  'block py-4 text-display-lg tracking-tight transition-colors duration-base ease-standard',
                  active ? 'text-gold' : 'text-fg-primary hover:text-gold',
                ].join(' ')}
                style={{ animation: open ? `heroFadeUp 0.4s var(--ease-standard) ${0.05 + i * 0.04}s both` : undefined }}
              >
                {item.label}
              </Link>,
            ]
          })}

          <div className="mt-auto mb-10 pt-8 border-t border-white/[0.06] flex items-center justify-between text-caption text-fg-tertiary">
            <span>奥匈置业研究所</span>
            <span>Wien, Austria</span>
          </div>
        </div>
      </div>
    </>
  )
}
