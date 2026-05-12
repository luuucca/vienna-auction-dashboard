import React, { useState } from 'react'
import { Scale, RefreshCw, Clock, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
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
    <header className="relative flex-shrink-0 bg-forest-700 overflow-hidden">
      <div className="header-pattern absolute inset-0 pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(135deg, rgba(29,58,42,0.95) 0%, rgba(13,28,20,0.98) 100%)' }}
      />
      <div className="relative h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />

      <div className="relative px-4 py-3 sm:px-6 sm:py-4 lg:px-10 lg:py-5">

        {/* Top row: icon + title */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gold-500 bg-opacity-20 border border-gold-400 border-opacity-40 flex items-center justify-center">
            <Scale size={16} className="text-gold-400" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium tracking-widest uppercase text-gold-400 opacity-80">
              Ediktsdatei · Wien
            </div>
            <h1 className="font-serif text-base sm:text-xl font-semibold text-cream-100 leading-tight tracking-tight">
              维也纳法拍房空间尽调看板
            </h1>
          </div>
        </div>

        {/* Status row */}
        <div className="flex items-center gap-2 text-xs text-warm-400 opacity-70 mb-2.5">
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
