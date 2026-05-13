import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight, Check, ShieldCheck, TrendingUp, Languages,
  Camera, FileText, Users, Sparkles, ArrowLeft,
} from 'lucide-react'

const SERVICES = [
  { icon: <TrendingUp size={17} />, title: '市场评估与定价', desc: '基于维也纳各区实时成交数据，给出合理估价区间与定价策略。' },
  { icon: <Camera size={17} />, title: '专业房源包装', desc: '专业摄影、户型图、视频呈现，让您的房产在第一眼吸引买家/租客。' },
  { icon: <Languages size={17} />, title: '中文客户推广', desc: '小红书 / 微信渠道覆盖大量在维华人群体，精准触达目标客户。' },
  { icon: <Users size={17} />, title: '看房与谈判', desc: '我们安排预约、陪同看房、协助价格谈判，您只需等待签约。' },
  { icon: <FileText size={17} />, title: '中德文合同支持', desc: '与本地律所合作（MONOLAW），中文解读合同、保障交易安全。' },
  { icon: <ShieldCheck size={17} />, title: '后续过户与税务', desc: '协助完成产权过户、土地登记、土地交易税申报等流程。' },
]

export default function ListPropertyPage() {
  const [searchParams] = useSearchParams()
  const initialMode = searchParams.get('mode') === 'rent' ? 'rent' : 'sale'
  const [mode, setMode] = useState<'sale' | 'rent'>(initialMode)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    setMode(searchParams.get('mode') === 'rent' ? 'rent' : 'sale')
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.append('_subject', `业主委托 - ${mode === 'sale' ? '出售' : '出租'}`)
    try {
      const res = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
        method: 'POST', body: formData,
        headers: { Accept: 'application/json' },
      })
      if (res.ok) setSent(true)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white pt-16">

      {/* Hero */}
      <section className="relative overflow-hidden py-16 sm:py-20 px-4 sm:px-6 lg:px-10"
        style={{ background: 'radial-gradient(ellipse at top, rgba(212,175,55,0.08) 0%, transparent 60%)' }}>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Link to="/"
            className="inline-flex items-center gap-1.5 text-xs mb-6 transition-colors"
            style={{ color: 'rgba(255,255,255,0.45)' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#d4af37')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}>
            <ArrowLeft size={12} /> 返回首页
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
            <p className="text-[11px] tracking-[0.25em] uppercase mb-3" style={{ color: 'rgba(212,175,55,0.7)' }}>For Property Owners</p>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-5 tracking-tight leading-tight">
              业主委托 · 出售 / 出租
            </h1>
            <p className="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
              如果您在维也纳或奥地利拥有房产，并计划出售或出租，我们可以为您提供从市场评估到交易完成的一站式中文服务。
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 px-4 sm:px-6 lg:px-10">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-10">
            <p className="text-[11px] tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(212,175,55,0.65)' }}>专业服务</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">我们能为您做什么</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICES.map((s, i) => (
              <motion.div key={s.title}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.4 }}
                className="rounded-2xl p-5 transition-colors"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: 'rgba(212,175,55,0.1)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.2)' }}>
                  {s.icon}
                </div>
                <h3 className="font-semibold text-white text-base mb-1.5">{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section id="form" className="py-16 px-4 sm:px-6 lg:px-10" style={{ background: '#0f0f0f' }}>
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-8">
            <p className="text-[11px] tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(212,175,55,0.65)' }}>免费咨询</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">提交委托信息</h2>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>填写下方表单，我们将在 24 小时内与您联系</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="rounded-3xl p-6 sm:p-8"
            style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(212,175,55,0.2)' }}
          >
            {sent ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)' }}>
                  <Check size={28} style={{ color: '#d4af37' }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">提交成功！</h3>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>我们会尽快与您联系</p>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                {/* Sale / Rent toggle */}
                <div>
                  <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>需求类型</label>
                  <div className="grid grid-cols-2 gap-2 p-1 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {([['sale', '出售房产'], ['rent', '出租房产']] as const).map(([k, label]) => (
                      <button key={k} type="button" onClick={() => setMode(k)}
                        className="py-2.5 rounded-lg text-sm font-semibold transition-all"
                        style={mode === k
                          ? { background: '#d4af37', color: '#141414' }
                          : { background: 'transparent', color: 'rgba(255,255,255,0.5)' }}>
                        {label}
                      </button>
                    ))}
                  </div>
                  <input type="hidden" name="mode" value={mode === 'sale' ? '出售' : '出租'} />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="姓名" name="name" type="text" placeholder="请输入您的姓名" required />
                  <Field label="电话 / 微信" name="contact" type="tel" placeholder="电话或微信号" required />
                </div>
                <Field label="邮箱" name="email" type="email" placeholder="请输入您的邮箱" required />
                <Field label="房产地址或所在区域" name="address" type="text" placeholder={`如：1190 Wien, Döbling 或具体街道地址`} required />

                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>房产简介</label>
                  <textarea name="description" rows={5} required
                    placeholder={`例如：3室公寓，95平米，2020年装修，带阳台 ${mode === 'rent' ? '；期望月租金 €1500' : '；期望售价 €550,000'}`}
                    className="w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition-colors resize-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                    onFocus={e => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
                  />
                </div>

                <motion.button type="submit" disabled={loading}
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  className="w-full py-3.5 rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-colors"
                  style={{ background: loading ? 'rgba(212,175,55,0.6)' : '#d4af37', color: '#141414', cursor: loading ? 'not-allowed' : 'pointer' }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#e0bc4a' }}
                  onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#d4af37' }}
                >
                  {loading ? '提交中…' : <>提交委托 <ArrowRight size={16} /></>}
                </motion.button>

                <p className="text-center text-xs pt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  您的信息将被严格保密，仅用于本次咨询
                </p>
              </form>
            )}
          </motion.div>

          {/* Alt contact */}
          <div className="mt-6 text-center text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            或通过{' '}
            <Link to="/about" className="underline underline-offset-2" style={{ color: '#d4af37' }}>微信 / 电话 / 邮件</Link>
            {' '}直接联系我们
          </div>
        </div>
      </section>
    </div>
  )
}

function Field({ label, name, type, placeholder, required }: {
  label: string; name: string; type: string; placeholder: string; required?: boolean
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</label>
      <input name={name} type={type} placeholder={placeholder} required={required}
        className="w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition-colors"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        onFocus={e => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)')}
        onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
      />
    </div>
  )
}
