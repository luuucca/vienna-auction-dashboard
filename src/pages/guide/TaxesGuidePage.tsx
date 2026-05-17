import React from 'react'
import { GuideSubLayout, Section } from './GuideSubLayout'

export default function TaxesGuidePage() {
  return (
    <GuideSubLayout
      pageId="taxes"
      metaTitle="维也纳买房税费清单 2026 — Nebenkosten 完整明细 | 奥匈置业研究所"
      metaDescription="维也纳买房税费一次性付清完整清单：Grunderwerbsteuer 3.5%、Grundbucheintragung 1.1%、公证 1.5%、Maklerprovision 3% + VAT。年度持有费 + 出售时的 ImmoESt 30% 增值税。"
      hero={{
        kicker: 'Guide · 税费',
        title: '维也纳买房税费完整清单',
        subtitle: '一次性税费 + 年度持有 + 未来出售三个阶段的所有费用项，约房价 10% 是雷打不动的购房附加成本（Nebenkosten）。',
        readTimeMin: 6,
      }}
      toc={[
        { id: 'one-time',  label: '1. 一次性税费 (~10%)' },
        { id: 'annual',    label: '2. 年度持有成本' },
        { id: 'sell',      label: '3. 未来出售时' },
        { id: 'special',   label: '4. 特殊情况税费' },
        { id: 'sample',    label: '5. 实例计算' },
      ]}
      faqSchema={[
        { question: '维也纳买房一共要交多少税费？',
          answer: '维也纳买房 Nebenkosten 约为房价的 10%，分四项：Grunderwerbsteuer 3.5%（土地交易税）、Grundbucheintragung 1.1%（土地登记费）、Notar/Anwalt 1-2%（公证律师费）、Maklerprovision 3% + 20% VAT ≈ 3.6%（买方中介费）。' },
        { question: 'Grunderwerbsteuer 是什么？',
          answer: 'Grunderwerbsteuer 是奥地利的土地交易税，税率 3.5%，以房价为基数。买方在公证后 30 天内通过 FinanzOnline 报税并缴清。' },
        { question: '维也纳买房有买方中介费吗？',
          answer: '有。奥地利法律规定买方中介费率上限 3%（含 20% 增值税即 3.6%）。如果你没有签任何经纪人合同，部分自售房源可以省下这笔费用。' },
        { question: '出售房产要交多少税？',
          answer: 'Immobilien-Ertragsteuer (ImmoESt) 30%，仅针对增值部分。自住超过 2 年 + 持有超过 10 年 / 主要居所豁免可免征 ImmoESt，需咨询税务师。' },
        { question: '外国人买房税费一样吗？',
          answer: '基本一样。Grunderwerbsteuer 3.5% 和 Grundbucheintragung 1.1% 不分国籍。但非 EU 公民可能要额外支付 Ausländergrundverkehrsgesetz 审批费用 (€50-300)。' },
      ]}
    >
      <Section id="one-time" title="1. 一次性税费（约房价 10%）">
        <p>
          这是<strong className="text-fg-primary">除房价外必须准备的现金</strong>。维也纳买房 Nebenkosten 加总约房价的 10%，分四项：
        </p>
        <table className="w-full text-body mt-4 border border-white/[0.06] rounded-xl overflow-hidden">
          <thead>
            <tr className="bg-bg-elev-1">
              <th className="p-3 text-left text-caption text-fg-tertiary uppercase">项目</th>
              <th className="p-3 text-right text-caption text-fg-tertiary uppercase">税率</th>
              <th className="p-3 text-left text-caption text-fg-tertiary uppercase">缴纳时间</th>
            </tr>
          </thead>
          <tbody className="text-fg-secondary">
            <tr className="border-t border-white/[0.06]">
              <td className="p-3"><strong className="text-fg-primary">Grunderwerbsteuer</strong><br/><span className="text-caption">土地交易税</span></td>
              <td className="p-3 text-right text-gold tabular">3.5%</td>
              <td className="p-3 text-caption">公证后 30 天内</td>
            </tr>
            <tr className="border-t border-white/[0.06]">
              <td className="p-3"><strong className="text-fg-primary">Grundbucheintragung</strong><br/><span className="text-caption">土地登记费</span></td>
              <td className="p-3 text-right text-gold tabular">1.1%</td>
              <td className="p-3 text-caption">Grundbuch 登记时</td>
            </tr>
            <tr className="border-t border-white/[0.06]">
              <td className="p-3"><strong className="text-fg-primary">Notar / Anwalt</strong><br/><span className="text-caption">公证 / 律师费（阶梯收费）</span></td>
              <td className="p-3 text-right text-gold tabular">1–2%</td>
              <td className="p-3 text-caption">公证签约时</td>
            </tr>
            <tr className="border-t border-white/[0.06]">
              <td className="p-3"><strong className="text-fg-primary">Maklerprovision</strong><br/><span className="text-caption">买方中介费（3% + 20% VAT）</span></td>
              <td className="p-3 text-right text-gold tabular">3.6%</td>
              <td className="p-3 text-caption">签 Kaufvertrag 时</td>
            </tr>
            <tr className="border-t border-white/[0.06] bg-bg-elev-1">
              <td className="p-3 font-semibold text-fg-primary">合计</td>
              <td className="p-3 text-right text-gold tabular font-semibold">~9.2–10.2%</td>
              <td className="p-3 text-caption">全部在公证后 1-2 个月内付清</td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Section id="annual" title="2. 年度持有成本">
        <p>
          买完房后每年都要付的：
        </p>
        <ul>
          <li><strong className="text-fg-primary">Grundsteuer</strong>（房产税）：维也纳极低，<strong className="text-fg-primary">每年仅 €200-800</strong>，几乎可忽略。</li>
          <li><strong className="text-fg-primary">Betriebskosten</strong>（物业运营费）：€2-4 / m² / 月。80㎡ 公寓约 €160-320/月。包含暖气共用、清洁、电梯、垃圾。</li>
          <li><strong className="text-fg-primary">Hausverwaltung</strong>（物业管理）：通常含在 BK 内。</li>
          <li><strong className="text-fg-primary">Rücklage</strong>（维修基金）：€0.5-1.5 / m² / 月。这是给楼栋未来翻新攒的钱。</li>
          <li><strong className="text-fg-primary">Haushaltsversicherung</strong>（家财险）：€150-400/年，贷款者通常被要求购买。</li>
        </ul>
      </Section>

      <Section id="sell" title="3. 未来出售时">
        <p>
          奥地利对房屋增值征<strong className="text-fg-primary">Immobilien-Ertragsteuer (ImmoESt)</strong> 30%。仅针对增值部分（卖价 - 买价 - 升级成本）。
        </p>
        <p>
          <strong className="text-fg-primary">两个常见豁免</strong>：
        </p>
        <ul>
          <li><strong className="text-fg-primary">主要居所豁免 (Hauptwohnsitzbefreiung)</strong>：自住超过 2 年 / 持有超过 10 年的房产 - 完全免 ImmoESt。</li>
          <li><strong className="text-fg-primary">"自建"豁免 (Herstellerbefreiung)</strong>：自己建造 / 大规模翻新过的房产 - 免 ImmoESt。</li>
        </ul>
        <p>
          投资房（出租 / 度假房）<strong className="text-fg-primary">不</strong>适用主要居所豁免，需老老实实交 30%。但可以扣除翻新成本和持有期间的折旧。
        </p>
      </Section>

      <Section id="special" title="4. 特殊情况税费">
        <h3 className="text-heading-md text-fg-primary mt-6 mb-2">⚠ 外国人审批费</h3>
        <p>
          非 EU 买家在部分区可能需要 <em className="not-italic text-gold">Ausländergrundverkehrsgesetz</em> 审批，行政费 €50-300。维也纳 1-9 区相对宽松，外围区可能更严。
        </p>
        <h3 className="text-heading-md text-fg-primary mt-6 mb-2">⚠ GmbH 公司买房</h3>
        <p>
          通过设立奥地利公司持有房产 — 完全合规但更复杂：
        </p>
        <ul>
          <li>GmbH 注册费：~€500-1000</li>
          <li>注册资本：最低 €10,000</li>
          <li>年度公司维护：会计 + 税申报 ~€1500-3000/年</li>
          <li>但出售时 30% 资本利得 - 可以与其他公司亏损抵消</li>
        </ul>
        <h3 className="text-heading-md text-fg-primary mt-6 mb-2">⚠ Erbschaft & 赠与</h3>
        <p>
          奥地利<strong className="text-fg-primary">没有遗产税</strong>。但有继承登记费 + 可能的 Grunderwerbsteuer 优惠税率（直系亲属 0.5%-2%）。
        </p>
      </Section>

      <Section id="sample" title="5. 实例计算">
        <p>
          假设你在 19 区 Döbling 买一套 <strong className="text-fg-primary">€500,000 公寓</strong>：
        </p>
        <ul>
          <li>Grunderwerbsteuer 3.5%：<strong className="text-fg-primary">€17,500</strong></li>
          <li>Grundbucheintragung 1.1%：<strong className="text-fg-primary">€5,500</strong></li>
          <li>Notar 约 1.5%：<strong className="text-fg-primary">€7,500</strong></li>
          <li>Maklerprovision 3.6%：<strong className="text-fg-primary">€18,000</strong></li>
          <li><strong className="text-gold">合计 Nebenkosten：€48,500</strong></li>
          <li><strong className="text-gold">含房价总预算：€548,500</strong></li>
        </ul>
        <p>
          每月持有成本（80㎡）：BK ~€240 + Rücklage ~€80 = <strong className="text-fg-primary">€320/月</strong>，加上贷款月供（若有）。
        </p>
      </Section>
    </GuideSubLayout>
  )
}
