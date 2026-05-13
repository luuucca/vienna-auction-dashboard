import React from 'react'
import { Link } from 'react-router-dom'
import { Mail, Phone, ArrowRight, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#141414] text-white pt-16">

      {/* Header */}
      <div className="py-10 px-4 sm:px-6 lg:px-10" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(212,175,55,0.65)' }}>Contact</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1">联系我们</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-5">

        {/* 1. 小红书 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="rounded-2xl p-6 flex items-center gap-5"
          style={{ background: 'rgba(254,44,85,0.06)', border: '1px solid rgba(254,44,85,0.2)' }}
        >
          <div className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden">
            <img src="/xiaohongshu-logo.png" alt="小红书" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>小红书</p>
            <p className="text-base font-semibold text-white">奥匈置业研究所 | CH</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>搜索账号直接私信</p>
          </div>
          <a href="https://www.xiaohongshu.com" target="_blank" rel="noopener noreferrer"
            className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-medium transition-colors"
            style={{ color: 'rgba(254,44,85,0.8)' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fe2c55')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(254,44,85,0.8)')}>
            前往 <ExternalLink size={11} />
          </a>
        </motion.div>

        {/* 2. 微信 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl p-5 flex items-center gap-5"
          style={{ background: 'rgba(7,193,96,0.06)', border: '1px solid rgba(7,193,96,0.2)' }}
        >
          <div className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden">
            <img src="/wechat-logo.png" alt="微信" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>微信</p>
            <p className="text-sm font-semibold text-white mb-0.5">扫码添加微信</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>长按或扫描二维码</p>
          </div>
          <div className="flex-shrink-0 rounded-xl overflow-hidden"
            style={{ width: 80, height: 80, background: 'white', padding: 4 }}>
            <img src="/wechat-qr.png" alt="微信二维码" className="w-full h-full object-contain"
              onError={e => {
                const el = e.currentTarget; el.style.display = 'none'
                const p = el.parentElement!
                p.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center"><svg xmlns=\'http://www.w3.org/2000/svg\' width=\'28\' height=\'28\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'rgba(255,255,255,0.2)\' stroke-width=\'2\'><rect x=\'3\' y=\'3\' width=\'7\' height=\'7\'/><rect x=\'14\' y=\'3\' width=\'7\' height=\'7\'/><rect x=\'3\' y=\'14\' width=\'7\' height=\'7\'/></svg></div>'
              }}
            />
          </div>
        </motion.div>

        {/* 3. 电话 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="rounded-2xl p-6 flex items-center gap-5"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}>
            <Phone size={20} style={{ color: '#d4af37' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>电话</p>
            <a href="tel:+436705566666" className="text-base font-semibold transition-colors"
              style={{ color: 'rgba(255,255,255,0.9)' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#d4af37')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')}>
              +43 670 5566666
            </a>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>奥地利本地号码</p>
          </div>
        </motion.div>

        {/* 4. 邮件 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-2xl p-6 flex items-center gap-5"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}>
            <Mail size={20} style={{ color: '#d4af37' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>邮件咨询</p>
            <a href="mailto:L.ZHANG@VALERTO.IMMO" className="text-base font-semibold transition-colors"
              style={{ color: '#d4af37' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#e0bc4a')}
              onMouseLeave={e => (e.currentTarget.style.color = '#d4af37')}>
              L.ZHANG@VALERTO.IMMO
            </a>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>我们将在 24 小时内回复</p>
          </div>
        </motion.div>

        {/* MONOLAW */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="rounded-2xl p-6 flex items-center gap-5"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center"
            style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.12)' }}>
            <span className="text-white font-black text-[11px] tracking-widest leading-none text-center">MONO<br/>LAW</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>法律支持</p>
            <p className="text-base font-semibold text-white">MONOLAW</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>奥地利本地律师事务所，房产法律咨询</p>
          </div>
          <a href="https://www.monolaw.at/about-1" target="_blank" rel="noopener noreferrer"
            className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-medium transition-colors"
            style={{ color: 'rgba(255,255,255,0.45)' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#d4af37')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}>
            前往 <ExternalLink size={11} />
          </a>
        </motion.div>

        {/* Auction CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)' }}
        >
          <div className="flex-1">
            <h3 className="font-bold text-white mb-1">立即查看法拍房机会</h3>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>60+ 条在拍房源，起拍价低至评估价 50%</p>
          </div>
          <Link to="/auction"
            className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            style={{ background: '#d4af37', color: '#141414' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#e0bc4a')}
            onMouseLeave={e => (e.currentTarget.style.background = '#d4af37')}
          >
            进入看板 <ArrowRight size={13} />
          </Link>
        </motion.div>

      </div>
    </div>
  )
}
