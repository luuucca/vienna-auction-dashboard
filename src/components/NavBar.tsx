import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { to: '/',              label: '首页' },
  { to: '/listings',      label: '房源列表' },
  { to: '/auction',       label: '法拍看板' },
  { to: '/list-property', label: '业主委托' },
  { to: '/about',         label: '联系我们' },
]

export function NavBar() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-shadow duration-200"
      style={{
        background: '#0a0a0a',
        borderBottom: '1px solid rgba(212,175,55,0.2)',
        boxShadow: scrolled ? '0 2px 16px rgba(0,0,0,0.5)' : 'none',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between">

        {/* Logo — text only */}
        <Link to="/" className="flex-shrink-0 group">
          <span className="font-bold text-[15px] tracking-tight transition-colors"
            style={{ color: '#d4af37' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#e8c552')}
            onMouseLeave={e => (e.currentTarget.style.color = '#d4af37')}>
            奥匈置业研究所
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-0.5">
          {navLinks.map(({ to, label }) => {
            const active = pathname === to
            return (
              <Link key={to} to={to}
                className="px-4 py-2 text-sm transition-colors rounded-md"
                style={{
                  color: active ? '#d4af37' : 'rgba(212,175,55,0.6)',
                  fontWeight: active ? 600 : 400,
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#d4af37')}
                onMouseLeave={e => (e.currentTarget.style.color = active ? '#d4af37' : 'rgba(212,175,55,0.6)')}>
                {label}
              </Link>
            )
          })}
        </div>

        {/* Mobile menu button */}
        <button onClick={() => setOpen(o => !o)} className="md:hidden p-1 transition-colors"
          style={{ color: 'rgba(212,175,55,0.7)' }}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden px-4 pb-3 pt-1 flex flex-col gap-0.5"
          style={{ background: '#0a0a0a', borderTop: '1px solid rgba(212,175,55,0.12)' }}>
          {navLinks.map(({ to, label }) => {
            const active = pathname === to
            return (
              <Link key={to} to={to} onClick={() => setOpen(false)}
                className="px-3 py-2.5 rounded-md text-sm transition-colors"
                style={{
                  color: active ? '#d4af37' : 'rgba(212,175,55,0.6)',
                  fontWeight: active ? 600 : 400,
                  background: active ? 'rgba(212,175,55,0.08)' : 'transparent',
                }}>
                {label}
              </Link>
            )
          })}
        </div>
      )}
    </nav>
  )
}
