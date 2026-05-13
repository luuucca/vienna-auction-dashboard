import React, { useState } from 'react'
import { RefreshCw, Clock, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import type { RefreshState } from '../hooks/useAuctions'

interface HeaderProps {
  lastModified: Date | null
  auctionCount: number
  refresh: RefreshState
  onRefresh: () => void
  onReloadData: () => void
}

export function Header({ lastModified, auctionCount, refresh, onRefresh, onReloadData }: HeaderProps) {
  const [logOpen, setLogOpen] = useState(false)

  const fmtTime = (d: Date | null) => {
    if (!d) return '—'
    return d.toLocaleString('zh-CN', {
      month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <header className="relative flex-shrink-0 overflow-hidden" style={{ background: '#0E0E18' }}>
      <div className="header-pattern absolute inset-0 pointer-events-none opacity-60" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(135deg, rgba(28,28,42,0.92) 0%, rgba(10,10,20,0.98) 100%)' }}
      />
      {/* Top gold accent line */}
      <div className="relative h-px bg-gradient-to-r from-transparent via-gold-400 to-transparent opacity-80" />

      <div className="relative px-4 py-3 sm:px-6 sm:py-4 lg:px-10 lg:py-5">

        {/* Brand row: avatar + name */}
        <div className="flex items-center gap-3 mb-2">
          {/* Avatar */}
          <div
            className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden"
            style={{ boxShadow: '0 0 0 2px rgba(212,168,67,0.55), 0 0 0 4px rgba(212,168,67,0.12), 0 4px 12px rgba(0,0,0,0.5)' }}
          >
            <img
              src="/avatar.png"
              alt="奥匈置业研究所"
              className="w-full h-full object-cover"
              onError={(e) => {
                const el = e.currentTarget
                el.style.display = 'none'
                const parent = el.parentElement!
                parent.style.background = 'rgba(212,168,67,0.15)'
                parent.style.display = 'flex'
                parent.style.alignItems = 'center'
                parent.style.justifyContent = 'center'
                parent.innerHTML = '<span style="color:#D4A843;font-size:18px">🏛️</span>'
              }}
            />
          </div>

          {/* Brand text */}
          <div className="min-w-0">
            <div className="text-[10px] font-medium tracking-[0.2em] uppercase text-gold-400 opacity-70 mb-0.5">
              Ediktsdatei · Wien
            </div>
            <h1 className="font-serif text-lg sm:text-2xl font-bold text-cream-100 leading-tight tracking-tight"
              style={{ textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}>
              奥匈置业研究所
            </h1>
            <div className="text-[10px] text-warm-400 opacity-50 mt-0.5 hidden sm:block tracking-wide">
              维也纳法拍房 · 空间尽调看板
            </div>
          </div>
        </div>

        {/* Mobile subtitle */}
        <div className="text-[10px] text-warm-400 opacity-40 mb-2 sm:hidden tracking-wide">
          维也纳法拍房 · 空间尽调看板
        </div>

        {/* Status row */}
        <div className="flex items-center gap-2 text-xs text-warm-400 opacity-60 mb-2.5">
          <Clock size={11} />
          <span>数据更新：{fmtTime(lastModified)}</span>
          <span className="opacity-50">·</span>
          <span>{auctionCount} 条在拍</span>
        </div>

        {/* Buttons row — wraps on small screens */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onReloadData}
            disabled={refresh.running}
            title="重新读取本地数据文件"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-warm-300 border border-warm-600 border-opacity-30 hover:border-opacity-60 hover:text-cream-100 transition-colors disabled:opacity-40"
          >
            <RefreshCw size={11} />
            刷新显示
          </button>

          <button
            onClick={refresh.running ? undefined : onRefresh}
            disabled={refresh.running}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all
              ${refresh.running
                ? 'bg-gold-600 bg-opacity-20 text-gold-400 cursor-not-allowed'
                : 'bg-gold-500 bg-opacity-20 text-gold-300 border border-gold-500 border-opacity-40 hover:bg-opacity-30 hover:text-gold-200'
              }`}
          >
            {refresh.running
              ? <Loader2 size={11} className="animate-spin" />
              : <RefreshCw size={11} />
            }
            {refresh.running ? '抓取中…' : '从 Ediktsdatei 更新数据'}
          </button>
        </div>

        {/* Progress / last status */}
        {(refresh.lastLine || refresh.error) && (
          <div className="flex items-center gap-1.5 mt-2">
            <span className={`text-xs truncate max-w-xs ${refresh.error ? 'text-red-400' : 'text-warm-400 opacity-70'}`}>
              {refresh.error ?? refresh.lastLine}
            </span>
            {refresh.progress.length > 0 && (
              <button
                onClick={() => setLogOpen((o) => !o)}
                className="text-warm-500 opacity-60 hover:opacity-100 flex-shrink-0"
              >
                {logOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Collapsible log panel */}
      {logOpen && refresh.progress.length > 0 && (
        <div className="relative bg-black bg-opacity-60 border-t border-gold-800 border-opacity-30 px-6 lg:px-10 py-3 max-h-40 overflow-y-auto">
          <p className="text-xs text-warm-500 mb-2 font-medium">抓取日志</p>
          {refresh.progress.map((line, i) => (
            <div key={i} className="text-xs font-mono text-warm-400 opacity-70 leading-5">{line}</div>
          ))}
        </div>
      )}

      <div className="relative h-px bg-gradient-to-r from-transparent via-gold-600 to-transparent opacity-30" />
    </header>
  )
}
