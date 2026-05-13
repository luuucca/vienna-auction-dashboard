import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { to: '/',         label: '首页' },
  { to: '/listings', label: '房源列表' },
  { to: '/auction',  label: '法拍房信息汇总' },
  { to: '/about',    label: '联系我们' },
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
      className="fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-200"
      style={{ borderBottom: '1px solid #e8e8e8', boxShadow: scrolled ? '0 2px 12px rgba(0,0,0,0.07)' : 'none' }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between">

        {/* Logo — text only */}
        <Link to="/" className="flex-shrink-0 group">
          <span className="font-bold text-[15px] text-gray-900 tracking-tight group-hover:text-gray-700 transition-colors">
            奥匈置业研究所
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-0.5">
          {navLinks.map(({ to, label }) => {
            const active = pathname === to
            return (
              <Link key={to} to={to}
                className={`px-4 py-2 text-sm transition-colors rounded-md ${
                  active
                    ? 'text-gray-900 font-medium'
                    : 'text-gray-500 hover:text-gray-900'
                }`}>
                {label}
              </Link>
            )
          })}
        </div>

        {/* Mobile menu button */}
        <button onClick={() => setOpen(o => !o)} className="md:hidden text-gray-500 hover:text-gray-900 p-1">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden px-4 pb-3 pt-1 flex flex-col gap-0.5 bg-white border-t border-gray-100">
          {navLinks.map(({ to, label }) => {
            const active = pathname === to
            return (
              <Link key={to} to={to} onClick={() => setOpen(false)}
                className={`px-3 py-2.5 rounded-md text-sm transition-colors ${
                  active ? 'text-gray-900 font-medium bg-gray-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}>
                {label}
              </Link>
            )
          })}
        </div>
      )}
    </nav>
  )
}
