import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, ChevronRight, ArrowRight } from 'lucide-react'
import { ButtonLink } from '../components/ui/Button'

/**
 * Long-form editorial guide to buying property in Austria as a
 * Chinese-speaking client. Sticky left TOC + scrollable body.
 *
 * Content is intentionally calm and informational — not a sales page.
 * The CTA at the end is a single contact link, no aggressive lead pop.
 */

const TOC = [
  { id: 'eligibility',  label: '1. 能不能买？' },
  { id: 'budget',       label: '2. 预算怎么算' },
  { id: 'timeline',     label: '3. 流程时间线' },
  { id: 'taxes',        label: '4. 关键税费' },
  { id: 'loan',         label: '5. 贷款基础' },
  { id: 'altbau',       label: '6. Altbau vs Neubau' },
  { id: 'pitfalls',     label: '7. 常见陷阱' },
  { id: 'roles',        label: '8. 各方角色' },
]

export default function BuyingGuidePage() {
  const [activeId, setActiveId] = useState<string>(TOC[0].id)

  // ── Per-page SEO: title, description, FAQPage schema ──
  // Targets the high-intent query 维也纳买房 specifically. Google reads
  // dynamic document.title and parses on-page JSON-LD on JS-rendered
  // pages, but a server-side prerender would be safer long-term.
  useEffect(() => {
    const origTitle = document.title
    document.title = '维也纳买房完整指南 2026 — 流程、税费、贷款 | 奥匈置业研究所'

    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
      if (!el) { el = document.createElement('meta'); el.name = name; document.head.appendChild(el) }
      el.content = content
    }
    setMeta('description', '维也纳买房完整指南：购房流程、税费明细、贷款规则、Altbau 与 Neubau 选择、常见陷阱。华人买家中文一站式参考，覆盖维也纳全 23 区。')

    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: '中国人能在维也纳买房吗？',
          acceptedAnswer: { '@type': 'Answer', text: '可以。EU 公民和奥地利长居身份持有人自由购房；非 EU 签证持有人（红白红卡、工作签、学生签）大部分情况可购房，部分区域需要 MA 35 移民局审批；纯境外买家也可购房，但流程更复杂，常通过设立奥地利 GmbH 持有。' } },
        { '@type': 'Question', name: '维也纳买房一共要花多少税费？',
          acceptedAnswer: { '@type': 'Answer', text: '维也纳买房的 Nebenkosten 约为房价的 10%：土地交易税 Grunderwerbsteuer 3.5%、土地登记费 Grundbucheintragung 1.1%、公证/律师费 1-2%、买方中介费 3% + 20% VAT ≈ 3.6%。除房价外必须准备这 10% 现金。' } },
        { '@type': 'Question', name: '维也纳买房流程要多久？',
          acceptedAnswer: { '@type': 'Answer', text: '典型节奏 6-12 周：看房 1-4 周 → Kaufanbot 报价数天 → 公证签约 2-3 周 → 付款 + Grundbuch 登记 4-8 周 → 交房 + Anmeldung 户籍登记。' } },
        { '@type': 'Question', name: '在维也纳买房可以贷款吗？',
          acceptedAnswer: { '@type': 'Answer', text: '可以。奥地利银行向非居民贷款门槛较高：奥地利公民 LTV 上限 90%，EU 公民 80%，非 EU 通常 60-70%。KIM-V 法规要求自住房至少 35% 首付、最长 35 年期、月供不超过净收入 40%。' } },
        { '@type': 'Question', name: '维也纳买房 Altbau 和 Neubau 怎么选？',
          acceptedAnswer: { '@type': 'Answer', text: 'Altbau（1945 年前老建筑）有租金管制，自住者获益于地段和层高，但出租收益受限；Neubau 无租金管制，回报率高但通常远离市中心。投资者一般倾向 Neubau，自住者倾向 Altbau。' } },
      ],
    }
    let faqEl = document.getElementById('buying-guide-faq-schema') as HTMLScriptElement | null
    if (!faqEl) {
      faqEl = document.createElement('script')
      faqEl.type = 'application/ld+json'
      faqEl.id = 'buying-guide-faq-schema'
      document.head.appendChild(faqEl)
    }
    faqEl.text = JSON.stringify(faqSchema)

    return () => {
      document.title = origTitle
      faqEl?.remove()
    }
  }, [])

  // Track which section is currently in view
  useEffect(() => {
    const sections = TOC.map(t => document.getElementById(t.id)).filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting)
        if (visible.length > 0) {
          // Pick the topmost visible section
          const top = visible.reduce((a, b) => (a.boundingClientRect.top < b.boundingClientRect.top ? a : b))
          setActiveId(top.target.id)
        }
      },
      { rootMargin: '-30% 0px -60% 0px' }
    )
    sections.forEach(s => io.observe(s))
    return () => io.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-bg-base text-fg-primary pt-16">

      {/* Hero */}
      <header className="px-4 sm:px-6 lg:px-10 pt-14 pb-10 border-b border-white/[0.06]">
        <div className="max-w-content mx-auto">
          <p className="text-overline text-gold/80 uppercase mb-3">Guide · 完整指南</p>
          <h1 className="font-serif text-display-lg sm:text-display-xl lg:text-display-2xl text-fg-primary mb-4 tracking-tight">
            维也纳买房完整指南
          </h1>
          <p className="text-body-lg text-fg-secondary max-w-prose mb-5">
            华人买家在维也纳买房的完整流程、税费、贷款规则、Altbau 与 Neubau 选择、常见陷阱与各方角色 — 一文读懂。覆盖奥地利购房的所有关键节点。
          </p>
          <p className="inline-flex items-center gap-1.5 text-caption text-fg-tertiary">
            <Clock size={12} strokeWidth={1.5} />
            阅读约 12 分钟
          </p>
        </div>
      </header>

      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-10 py-12 lg:py-16 grid lg:grid-cols-4 gap-10 lg:gap-16">

        {/* Sticky TOC */}
        <aside className="lg:col-span-1">
          <div className="lg:sticky lg:top-24">
            <p className="text-overline text-fg-tertiary uppercase mb-4 hidden lg:block">目录</p>
            <nav className="flex lg:flex-col gap-x-3 gap-y-1 overflow-x-auto pb-2 lg:pb-0 lg:overflow-visible">
              {TOC.map(t => (
                <a
                  key={t.id}
                  href={`#${t.id}`}
                  className={[
                    'flex-shrink-0 text-caption py-1.5 transition-colors duration-base ease-standard',
                    'lg:border-l-2 lg:pl-4',
                    activeId === t.id
                      ? 'text-gold lg:border-gold'
                      : 'text-fg-tertiary hover:text-fg-secondary lg:border-transparent',
                  ].join(' ')}
                >
                  {t.label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <article className="lg:col-span-3 max-w-prose">

          <Section id="eligibility" title="1. 能不能买？">
            <p>
              在<strong className="text-fg-primary">维也纳买房</strong>之前，第一个要确认的就是身份是否符合购房资格。
              奥地利对外国买家购置房产有一定限制 — 具体规则由<strong className="text-fg-primary">各州（Bundesland）</strong>制定，
              称为 <em className="not-italic text-gold">Ausländergrundverkehrsgesetz</em>。维也纳的规则在全奥地利属于最宽松：
            </p>
            <ul>
              <li><strong className="text-fg-primary">EU 公民、奥地利长期居留 (NL / Daueraufenthalt-EU) 持有人</strong>：自由购房，与本地公民同等待遇。</li>
              <li><strong className="text-fg-primary">非 EU 签证持有人（红白红卡 / 工作签 / 学生签）</strong>：可购房，但部分区域需要 MA 35 / 移民局审批。</li>
              <li><strong className="text-fg-primary">无奥地利身份的纯境外买家</strong>：可购买，但需要更复杂的审批 + 公证授权 + 在奥银行账户。建议先建立居留身份再购房。</li>
            </ul>
            <p>
              <strong className="text-fg-primary">商业实体购买</strong>（用奥地利公司持有房产）是无身份买家的常见路径，
              但涉及 GmbH 设立、税务安排，建议提前 6 个月规划。
            </p>
          </Section>

          <Section id="budget" title="2. 预算怎么算">
            <p>
              维也纳买房的预算公式很简单：<strong className="text-fg-primary">房价 × 1.1</strong>。多出来的 10% 是
              Nebenkosten（税费 + 公证 + 登记），是除了房价之外必须准备的现金。维也纳房价（2026 年中位数）：
            </p>
            <ul>
              <li>1-9 区（市中心）：€7,000-12,000 / m²</li>
              <li>10-17 区（核心居住区）：€4,500-7,500 / m²</li>
              <li>18-19 区（高端 Döbling / Währing）：€6,000-10,000 / m²</li>
              <li>20-23 区（外围）：€3,500-5,500 / m²</li>
            </ul>
            <p>
              <strong className="text-fg-primary">关键预算公式</strong>：房价 × 1.1 = 实际总成本。
              那 10% 是 Nebenkosten（税 + 公证 + 登记），是除了房价之外必须准备的现金。
            </p>
            <p>
              月度持有成本（除房贷外）：
            </p>
            <ul>
              <li>Betriebskosten（运营费）：€2-4 / m² / 月</li>
              <li>Hausverwaltung（物业管理）：包含在 BK 内</li>
              <li>Rücklage（维修基金）：通常 €0.5-1.5 / m² / 月</li>
              <li>Grundsteuer（房产税）：年度数百欧元，几乎可忽略</li>
            </ul>
          </Section>

          <Section id="timeline" title="3. 流程时间线">
            <p>从看房到拿到钥匙，维也纳买房典型节奏 <strong className="text-fg-primary">6–12 周</strong>：</p>
            <ol>
              <li><strong className="text-fg-primary">看房（1-4 周）</strong>：联系经纪人 → 预约 → 实地看房 → 缩短候选名单。</li>
              <li><strong className="text-fg-primary">Kaufanbot 买方报价（几天）</strong>：以书面方式提交报价，通常会附 ~3% 定金条件。</li>
              <li><strong className="text-fg-primary">公证签约（2-3 周）</strong>：律师 / 公证准备 Kaufvertrag，双方公证签约。</li>
              <li><strong className="text-fg-primary">支付 + Grundbuch 登记（4-8 周）</strong>：买方付款到信托账户 → 律师办理土地登记 → 房屋归属完成。</li>
              <li><strong className="text-fg-primary">交房 → Anmeldung</strong>：取钥匙、办理户籍登记。</li>
            </ol>
          </Section>

          <Section id="taxes" title="4. 关键税费">
            <p>维也纳买房一次性支付的税费汇总（合计约房价 10%）：</p>
            <ul>
              <li><strong className="text-fg-primary">Grunderwerbsteuer（土地交易税）3.5%</strong>：基于房价。</li>
              <li><strong className="text-fg-primary">Grundbucheintragung（登记费）1.1%</strong>：登记到土地册的费用。</li>
              <li><strong className="text-fg-primary">Notar / Anwaltskosten（公证 / 律师）1-2%</strong>：阶梯收费。</li>
              <li><strong className="text-fg-primary">Maklerprovision（买方中介费）3% + 20% VAT ≈ 3.6%</strong>：奥地利法律规定的买方中介费率。</li>
            </ul>
            <p>持有期间：</p>
            <ul>
              <li><strong className="text-fg-primary">Grundsteuer（年度房产税）</strong>：年度几百欧，可忽略不计。</li>
            </ul>
            <p>未来出售时：</p>
            <ul>
              <li><strong className="text-fg-primary">Immobilien-Ertragsteuer (ImmoESt) 30%</strong>：仅针对增值部分。
                自住超过 2 年 / 持有超过 10 年的情况有免税豁免，需咨询税务师。
              </li>
            </ul>
          </Section>

          <Section id="loan" title="5. 贷款基础">
            <p>
              奥地利银行可向非居民贷款，但门槛较高：
            </p>
            <ul>
              <li><strong className="text-fg-primary">LTV（贷款/房价比）</strong>：奥地利公民 90%，EU 公民 80%，非 EU 通常 60-70%。</li>
              <li><strong className="text-fg-primary">KIM-V 限制</strong>：自住房 35% 首付 + 最长 35 年期 + 月供 ≤ 40% 净收入。</li>
              <li><strong className="text-fg-primary">利率</strong>：2026 年中位 3.5-4.5%（固定利率），变动利率约 4.5-5%。</li>
              <li><strong className="text-fg-primary">常用银行</strong>：Erste Bank、BAWAG PSK、Bank Austria UniCredit、Hypo Vorarlberg。</li>
            </ul>
            <p>
              用我们的<Link to="/mortgage" className="text-gold hover:underline underline-offset-4">贷款计算器</Link>可以快速算出您的月供与总成本。
            </p>
          </Section>

          <Section id="altbau" title="6. Altbau vs Neubau">
            <p><strong className="text-fg-primary">Altbau（1945 年前老建筑）</strong>：</p>
            <ul>
              <li>✅ 高层高（3-4m）、大窗户、装饰墙、好地段</li>
              <li>✅ 装修空间大，可以按自己审美改造</li>
              <li>❌ 能效较差（HWB 通常 D-F），冬天暖气贵</li>
              <li>❌ 需要更多维护，配套可能要更新（电路、管道）</li>
            </ul>
            <p><strong className="text-fg-primary">Neubau（新建 / 全翻新）</strong>：</p>
            <ul>
              <li>✅ 能效高（HWB A-C），运营成本低</li>
              <li>✅ 装修现代，即买即住</li>
              <li>❌ 单价更高，地段往往不如核心 Altbau</li>
              <li>❌ 大部分在 20-23 区外围，市中心稀少</li>
            </ul>
          </Section>

          <Section id="pitfalls" title="7. 常见陷阱">
            <ul>
              <li>
                <strong className="text-fg-primary">Sanierungsbedarf（待翻新）</strong>：标价便宜的房子可能需要 €50-150k 的翻新成本。
                看房时一定要看 Energieausweis（能效证书）。
              </li>
              <li>
                <strong className="text-fg-primary">Befristete Mietverträge（限期租约）</strong>：买入有租客的房子？需查清合同到期日，否则你 1-3 年内无法自住。
              </li>
              <li>
                <strong className="text-fg-primary">Wohnungseigentum vs Mietshaus</strong>：前者是独立产权（标准），后者是大楼整体（需谨慎，涉及多方利益）。
              </li>
              <li>
                <strong className="text-fg-primary">Dachgeschoss（顶楼公寓）</strong>：要重点看屋顶维护记录、是否漏水历史，以及夏天隔热情况。
              </li>
              <li>
                <strong className="text-fg-primary">Rücklage 不足</strong>：维修基金余额低于 €50/m² 的房子要警惕，可能即将分摊大修费用。
              </li>
            </ul>
          </Section>

          <Section id="roles" title="8. 各方角色">
            <ul>
              <li><strong className="text-fg-primary">Makler（房产经纪）</strong>：我们 — 帮您找房、谈判、协调。买方中介费按奥地利法定标准 3% + 20% VAT。</li>
              <li><strong className="text-fg-primary">Notar / Anwalt（公证 / 律师）</strong>：起草合同、办理过户、土地登记。我们合作的 MONOLAW 提供中文支持。</li>
              <li><strong className="text-fg-primary">Banker（银行）</strong>：发放贷款。建议提前 1-2 周联系 1-2 家银行做预审。</li>
              <li><strong className="text-fg-primary">Steuerberater（税务师）</strong>：处理 ImmoESt、租赁收入申报。我们可推荐华语友好的税务师。</li>
              <li><strong className="text-fg-primary">Hausverwaltung（物业管理）</strong>：处理房屋日常维护、Betriebskosten 结算。买入时会自动转给您。</li>
            </ul>
          </Section>

          {/* ── Deep-dive sub-guides ──────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-16 mb-4"
          >
            <h2 className="font-serif text-heading-xl sm:text-display-lg text-fg-primary mb-2 tracking-tight">
              深度专题
            </h2>
            <p className="text-body text-fg-secondary mb-7">
              想就某个主题挖更深？下面 5 个专题各自展开维也纳买房的关键议题。
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { to: '/buying-guide/process',     title: '买房流程详解',      desc: '从看房到过户的完整 8 步时间线' },
                { to: '/buying-guide/taxes',       title: '税费完整清单',      desc: 'Nebenkosten 10% 明细 + 实例计算' },
                { to: '/buying-guide/loan',        title: '贷款指南',          desc: 'KIM-V、LTV、外国人贷款全解' },
                { to: '/buying-guide/doebling-19', title: '19 区 Döbling 专题', desc: '高端区域 6 个街区对比' },
                { to: '/buying-guide/students',    title: '留学生买房',        desc: '学生签 / 红白红卡 Plus 路径' },
              ].map(card => (
                <Link
                  key={card.to}
                  to={card.to}
                  className="block p-5 rounded-xl bg-bg-elev-1 border border-white/[0.06] hover:border-gold-line transition-[border-color,transform] duration-base ease-standard hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-heading-md text-fg-primary">{card.title}</h3>
                    <ChevronRight size={16} strokeWidth={1.5} className="text-gold flex-shrink-0" />
                  </div>
                  <p className="text-caption text-fg-tertiary">{card.desc}</p>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* End CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-12 p-7 sm:p-8 rounded-2xl bg-gold-tint border border-gold-line"
          >
            <h3 className="text-heading-lg text-fg-primary mb-2">读完了，下一步？</h3>
            <p className="text-body text-fg-secondary mb-5">
              如果有具体问题或想知道自己的条件能买什么，可以做一次 90 秒的<Link to="/quiz" className="text-gold hover:underline underline-offset-4">资格测试</Link>，
              或直接联系我们。
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <ButtonLink to="/quiz" variant="primary" size="md" trailingIcon={<ArrowRight size={14} strokeWidth={1.75} />}>
                做一次资格测试
              </ButtonLink>
              <ButtonLink to="/about" variant="ghost" size="md">
                联系我们
              </ButtonLink>
            </div>
          </motion.div>

        </article>
      </div>
    </div>
  )
}

// ─── Section component — handles anchor + spacing + typography ──────────────
function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="mb-16 scroll-mt-24"
    >
      <h2 className="font-serif text-heading-xl sm:text-display-lg text-fg-primary mb-5 tracking-tight">
        {title}
      </h2>
      <div className="prose-content space-y-4 text-body-lg text-fg-secondary leading-relaxed">
        {children}
      </div>
    </motion.section>
  )
}
