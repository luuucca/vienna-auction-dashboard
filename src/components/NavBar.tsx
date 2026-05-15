import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { to: '/',              label: '首页' },
  { to: '/listings',      label: '房源' },
  { to: '/auction',       label: '法拍房' },
  { to: '/list-property', label: '业主委托' },
  { to: '/about',         label: '联系' },
]

export function NavBar() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

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

  return (
    <>
      <nav
        className={[
          'fixed top-0 left-0 right-0 z-50',
          'transition-[background-color,backdrop-filter,height,border-color] duration-base ease-standard',
          scrolled
            ? 'h-14 bg-bg-base/78 backdrop-blur-md border-b border-white/[0.06]'
            : 'h-16 bg-transparent border-b border-transparent',
        ].join(' ')}
      >
        <div className="max-w-content mx-auto h-full px-4 sm:px-6 lg:px-10 flex items-center justify-between">

          {/* Wordmark — single brand accent on the page */}
          <Link
            to="/"
            className="font-semibold tracking-tight text-gold hover:text-gold-hover transition-colors duration-base ease-standard"
            style={{ fontSize: 15, letterSpacing: '-0.01em' }}
          >
            奥匈置业研究所
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => {
              const active = pathname === to
              return (
                <Link
                  key={to}
                  to={to}
                  className={[
                    'relative px-3 py-2 text-body transition-colors duration-base ease-standard',
                    active ? 'text-fg-primary font-medium' : 'text-fg-secondary hover:text-fg-primary',
                  ].join(' ')}
                >
                  {label}
                  {active && (
                    <span
                      aria-hidden
                      className="absolute left-3 right-3 -bottom-px h-px bg-gold"
                    />
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

      {/* ── Mobile menu — full-screen overlay (per DESIGN.md §5.4) ────────── */}
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
          className="absolute inset-0 pt-20 px-6 flex flex-col gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          {navLinks.map(({ to, label }, i) => {
            const active = pathname === to
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={[
                  'block py-4 text-display-lg tracking-tight transition-colors duration-base ease-standard',
                  active ? 'text-gold' : 'text-fg-primary hover:text-gold',
                ].join(' ')}
                style={{
                  animation: open ? `heroFadeUp 0.4s var(--ease-standard) ${0.05 + i * 0.04}s both` : undefined,
                }}
              >
                {label}
              </Link>
            )
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
