import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Shield, Eye, Database, UserCheck, Mail, Trash2 } from 'lucide-react'

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-6"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}>
          <span style={{ color: '#d4af37' }}>{icon}</span>
        </div>
        <h2 className="font-bold text-white">{title}</h2>
      </div>
      <div className="text-xs leading-relaxed space-y-2" style={{ color: 'rgba(255,255,255,0.48)' }}>
        {children}
      </div>
    </div>
  )
}

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-[#141414] text-white pt-16">

      {/* Header */}
      <div className="py-10 px-4 sm:px-6 lg:px-10" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="max-w-3xl mx-auto">
          <Link to="/"
            className="inline-flex items-center gap-1.5 text-xs mb-6 transition-colors"
            style={{ color: 'rgba(255,255,255,0.35)' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#d4af37')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}>
            <ArrowLeft size={13} /> 返回首页
          </Link>
          <p className="text-[11px] tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(212,175,55,0.65)' }}>Legal</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1">隐私政策</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.38)' }}>
            Datenschutzerklärung · DSGVO / GDPR
          </p>
          <p className="text-xs mt-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Stand: Mai 2025 · Letzte Aktualisierung: 01.05.2025
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-5">

        {/* Verantwortlicher */}
        <Section icon={<Shield size={16} />} title="Verantwortlicher / 数据控制者">
          <p className="text-white font-medium text-sm">Yellowbird Immobilienmakler GmbH</p>
          <p>Schwindgasse 11/3, 1040 Wien, Austria</p>
          <p>E-Mail:{' '}
            <a href="mailto:office@yellowbird-immo.at" style={{ color: 'rgba(212,175,55,0.75)' }}
              className="underline underline-offset-2">
              office@yellowbird-immo.at
            </a>
          </p>
          <p className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            本网站由 Yellowbird Immobilienmakler GmbH（以下简称"我们"）运营，作为 DSGVO（奥地利数据保护法/GDPR）意义上的数据控制者，负责处理您在使用本网站时提交的个人数据。
          </p>
        </Section>

        {/* Was wir sammeln */}
        <Section icon={<Database size={16} />} title="Erhobene Daten / 收集的数据">
          <div className="space-y-3">
            <div>
              <p className="font-semibold text-white mb-1">1. Kontaktformular 联系表单</p>
              <p>当您通过联系表单提交咨询时，我们收集：</p>
              <ul className="mt-1 space-y-0.5 ml-3">
                <li>• 姓名（Vorname / Nachname）</li>
                <li>• 电话号码 / 微信号（Telefonnummer）</li>
                <li>• 电子邮件地址（E-Mail-Adresse）</li>
                <li>• 留言内容（Nachricht）</li>
              </ul>
              <p className="mt-1">法律依据：DSGVO Art. 6 Abs. 1 lit. b（合同履行前的措施）或 lit. f（正当利益）。</p>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '8px' }}>
              <p className="font-semibold text-white mb-1">2. Server-Logfiles 服务器日志</p>
              <p>访问本网站时，服务器自动记录：IP地址（匿名化）、访问时间、浏览器类型、来源页面。这些数据仅用于技术安全目的，不与个人身份关联。</p>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '8px' }}>
              <p className="font-semibold text-white mb-1">3. Cookies / Cookie</p>
              <p>本网站使用以下 Cookie：</p>
              <ul className="mt-1 space-y-0.5 ml-3">
                <li>• <span className="text-white">auhpi-cookie-consent</span>：存储您的 Cookie 偏好（必要，localStorage）</li>
                <li>• 如您接受所有 Cookie：可能包含匿名访问统计（未来计划中）</li>
              </ul>
            </div>
          </div>
        </Section>

        {/* Zweck */}
        <Section icon={<Eye size={16} />} title="Verwendungszweck / 数据使用目的">
          <p>我们使用您的数据仅用于以下目的：</p>
          <ul className="mt-2 space-y-1 ml-3">
            <li>• 回复您的房产咨询请求</li>
            <li>• 为您匹配合适的房源或法拍房信息</li>
            <li>• 必要时将您的询盘转接给合作中介（征得您同意后）</li>
            <li>• 履行法律义务（Maklergesetz、UGB等）</li>
          </ul>
          <p className="mt-2">我们不会将您的数据出售给第三方，也不用于广告追踪目的。</p>
        </Section>

        {/* Datenweitergabe */}
        <Section icon={<UserCheck size={16} />} title="Datenweitergabe / 数据共享">
          <p>
            原则上，我们不向第三方传输您的个人数据。以下情况除外：
          </p>
          <ul className="mt-2 space-y-1 ml-3">
            <li>• <span className="text-white">合作中介：</span>经您明确同意，在为您安排看房时转发联系方式</li>
            <li>• <span className="text-white">技术服务商：</span>网站托管（Vercel Inc.，美国，标准合同条款保护）</li>
            <li>• <span className="text-white">法律要求：</span>在法院命令或法定义务下披露</li>
          </ul>
          <p className="mt-2">
            Vercel 隐私政策：{' '}
            <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer"
              style={{ color: 'rgba(212,175,55,0.75)' }} className="underline underline-offset-2">
              vercel.com/legal/privacy-policy
            </a>
          </p>
        </Section>

        {/* Speicherdauer */}
        <Section icon={<Trash2 size={16} />} title="Speicherdauer / 数据保留期限">
          <p>我们仅在实现收集目的所必要的期限内保留您的数据：</p>
          <ul className="mt-2 space-y-1 ml-3">
            <li>• 联系表单数据：咨询结束后 <span className="text-white">3年</span>（税务合规要求）</li>
            <li>• 服务器日志：最长 <span className="text-white">30天</span>，之后自动删除</li>
            <li>• Cookie 偏好：浏览器 localStorage，直至您清除浏览器数据</li>
          </ul>
        </Section>

        {/* Rechte */}
        <Section icon={<UserCheck size={16} />} title="Ihre Rechte / 您的权利（DSGVO Art. 15–22）">
          <p>根据 GDPR，您享有以下权利：</p>
          <div className="mt-2 grid sm:grid-cols-2 gap-2">
            {[
              { de: 'Auskunftsrecht', zh: '查阅权 Art. 15' },
              { de: 'Recht auf Berichtigung', zh: '更正权 Art. 16' },
              { de: 'Recht auf Löschung', zh: '删除权 Art. 17' },
              { de: 'Einschränkung der Verarbeitung', zh: '限制处理权 Art. 18' },
              { de: 'Datenübertragbarkeit', zh: '数据可携带权 Art. 20' },
              { de: 'Widerspruchsrecht', zh: '反对权 Art. 21' },
            ].map(r => (
              <div key={r.de} className="flex items-center gap-2 p-2 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#d4af37' }} />
                <div>
                  <p className="text-white text-[11px] font-medium">{r.de}</p>
                  <p className="text-[10px]">{r.zh}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3">
            如需行使上述权利，请联系：{' '}
            <a href="mailto:office@yellowbird-immo.at" style={{ color: 'rgba(212,175,55,0.75)' }}
              className="underline underline-offset-2">
              office@yellowbird-immo.at
            </a>
          </p>
          <p className="mt-1">
            您也有权向奥地利数据保护局（DSB）提出投诉：{' '}
            <a href="https://www.dsb.gv.at" target="_blank" rel="noopener noreferrer"
              style={{ color: 'rgba(212,175,55,0.75)' }} className="underline underline-offset-2">
              www.dsb.gv.at
            </a>
          </p>
        </Section>

        {/* Kontakt */}
        <div className="rounded-2xl p-5 flex items-center gap-4"
          style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)' }}>
          <Mail size={18} style={{ color: '#d4af37', flexShrink: 0 }} />
          <div>
            <p className="text-sm font-medium text-white mb-0.5">Datenschutzanfragen / 数据保护咨询</p>
            <a href="mailto:office@yellowbird-immo.at"
              className="text-sm transition-colors"
              style={{ color: 'rgba(212,175,55,0.8)' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#d4af37')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(212,175,55,0.8)')}>
              office@yellowbird-immo.at
            </a>
          </div>
        </div>

        {/* Footer links */}
        <div className="flex gap-3 pt-2">
          <Link to="/impressum"
            className="text-xs transition-colors"
            style={{ color: 'rgba(212,175,55,0.7)' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#d4af37')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(212,175,55,0.7)')}>
            → Impressum
          </Link>
          <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
          <Link to="/"
            className="text-xs transition-colors"
            style={{ color: 'rgba(255,255,255,0.3)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}>
            → 返回首页
          </Link>
        </div>
      </div>
    </div>
  )
}
