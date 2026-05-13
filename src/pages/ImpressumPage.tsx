import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Building2, Mail, MapPin, Phone, FileText } from 'lucide-react'

export default function ImpressumPage() {
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
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1">Impressum</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.38)' }}>
            法律声明 · Angaben gemäß §5 ECG
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-6">

        {/* Company card */}
        <div className="rounded-2xl p-6 space-y-4"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}>
              <Building2 size={16} style={{ color: '#d4af37' }} />
            </div>
            <h2 className="font-bold text-white">Unternehmensangaben</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Firma</p>
              <p className="text-sm text-white font-medium">Yellowbird Immobilienmakler GmbH</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>奥匈置业研究所</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Unternehmensgegenstand</p>
              <p className="text-sm text-white">Immobilienmakler · 房产经纪</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Adresse</p>
              <div className="flex items-start gap-1.5">
                <MapPin size={12} className="mt-0.5 flex-shrink-0" style={{ color: '#d4af37' }} />
                <p className="text-sm text-white">Schwindgasse 11/3<br />1040 Wien, Austria</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>E-Mail</p>
              <div className="flex items-center gap-1.5">
                <Mail size={12} style={{ color: '#d4af37' }} />
                <a href="mailto:office@yellowbird-immo.at"
                  className="text-sm transition-colors"
                  style={{ color: 'rgba(212,175,55,0.8)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#d4af37')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(212,175,55,0.8)')}>
                  office@yellowbird-immo.at
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Regulatory */}
        <div className="rounded-2xl p-6"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}>
              <FileText size={16} style={{ color: '#d4af37' }} />
            </div>
            <h2 className="font-bold text-white">Berufsrecht & Aufsicht</h2>
          </div>

          <div className="space-y-4 text-sm">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Berufsbezeichnung</p>
                <p className="text-white">Immobilienmakler</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>verliehen in Österreich</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Mitglied der</p>
                <p className="text-white">Wirtschaftskammer Wien</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>Fachgruppe Immobilien</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Berufsrecht</p>
                <p className="text-white">Maklergesetz (MaklerG)</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>
                  <a href="https://www.ris.bka.gv.at" target="_blank" rel="noopener noreferrer"
                    className="underline underline-offset-2" style={{ color: 'rgba(212,175,55,0.7)' }}>
                    www.ris.bka.gv.at
                  </a>
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Aufsichtsbehörde</p>
                <p className="text-white">Magistratisches Bezirksamt</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>Wien 4. Bezirk</p>
              </div>
            </div>
          </div>
        </div>

        {/* Haftungsausschluss */}
        <div className="rounded-2xl p-6"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 className="font-bold text-white mb-4">Haftungsausschluss</h2>
          <div className="space-y-3 text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
            <p>
              <span className="font-semibold text-white">Inhalt der Website:</span>{' '}
              Die Informationen auf dieser Website wurden sorgfältig erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte übernehmen wir jedoch keine Gewähr.
            </p>
            <p>
              <span className="font-semibold text-white">Links zu anderen Websites:</span>{' '}
              Unsere Website enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter verantwortlich.
            </p>
            <p>
              <span className="font-semibold text-white">免责声明（中文）：</span>{' '}
              本网站所有信息仅供参考，不构成法律或投资建议。房产价格及市场数据以实际成交为准。
            </p>
          </div>
        </div>

        {/* Urheberrecht */}
        <div className="rounded-2xl p-6"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 className="font-bold text-white mb-3">Urheberrecht</h2>
          <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf dieser Website unterliegen dem österreichischen Urheberrecht.
            Immobilienfotos: © Unsplash (Demo). Alle Markenzeichen und Logos der Partnerunternehmen sind Eigentum der jeweiligen Inhaber.
          </p>
        </div>

        {/* Links */}
        <div className="flex gap-3 pt-2">
          <Link to="/datenschutz"
            className="text-xs transition-colors"
            style={{ color: 'rgba(212,175,55,0.7)' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#d4af37')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(212,175,55,0.7)')}>
            → 隐私政策 / Datenschutz
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
