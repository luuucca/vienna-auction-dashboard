import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Cookie, X, ShieldCheck } from 'lucide-react'

const STORAGE_KEY = 'auhpi-cookie-consent'

export type ConsentLevel = 'all' | 'necessary' | null

export function useCookieConsent() {
  const stored = localStorage.getItem(STORAGE_KEY) as ConsentLevel
  return stored ?? null
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      // Small delay so the page renders first
      const t = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(t)
    }
  }, [])

  function accept(level: 'all' | 'necessary') {
    localStorage.setItem(STORAGE_KEY, level)
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop on mobile */}
          <motion.div
            className="fixed inset-0 z-40 sm:hidden"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Banner */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 sm:bottom-5 sm:left-5 sm:right-auto sm:max-w-sm"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="m-3 sm:m-0 rounded-2xl p-5 shadow-2xl"
              style={{
                background: 'rgba(18,18,18,0.97)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(212,175,55,0.2)',
              }}>

              {/* Close */}
              <button
                onClick={() => accept('necessary')}
                className="absolute top-3.5 right-3.5 p-1 rounded-lg transition-colors"
                style={{ color: 'rgba(255,255,255,0.35)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
                aria-label="Ablehnen"
              >
                <X size={15} />
              </button>

              {/* Icon + title */}
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.2)' }}>
                  <Cookie size={15} style={{ color: '#d4af37' }} />
                </div>
                <h3 className="font-semibold text-white text-sm">Cookie 偏好设置</h3>
              </div>

              {/* Text */}
              <p className="text-xs leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.45)' }}>
                我们使用必要 Cookie 保障网站正常运行。点击「接受所有」即表示您同意使用分析 Cookie 以改善用户体验。详见{' '}
                <Link to="/datenschutz" onClick={() => accept('necessary')}
                  className="underline underline-offset-2 transition-colors"
                  style={{ color: 'rgba(212,175,55,0.75)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#d4af37')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(212,175,55,0.75)')}>
                  隐私政策
                </Link>。
              </p>

              {/* Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => accept('necessary')}
                  className="flex-1 py-2 rounded-lg text-xs font-medium transition-colors"
                  style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
                >
                  仅必要
                </button>
                <button
                  onClick={() => accept('all')}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  style={{ background: '#d4af37', color: '#141414' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#e0bc4a')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#d4af37')}
                >
                  <ShieldCheck size={12} />
                  接受所有
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
