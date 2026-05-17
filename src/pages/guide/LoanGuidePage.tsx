import React from 'react'
import { GuideSubLayout, Section } from './GuideSubLayout'

export default function LoanGuidePage() {
  return (
    <GuideSubLayout
      pageId="loan"
      metaTitle="维也纳买房贷款指南 2026 — KIM-V、LTV、外国人贷款全解 | 奥匈置业研究所"
      metaDescription="维也纳买房贷款规则：奥地利公民 LTV 上限 90%，EU 公民 80%，非 EU 通常 60-70%。KIM-V 法规要求自住房至少 35% 首付、最长 35 年期、月供不超过净收入 40%。"
      hero={{
        kicker: 'Guide · 贷款',
        title: '维也纳买房贷款指南',
        subtitle: 'KIM-V 法规、LTV 上限、利率水平、外国人贷款门槛。具体银行选择、利率对比、申请材料清单。',
        readTimeMin: 7,
      }}
      toc={[
        { id: 'kimv',     label: '1. KIM-V 法规' },
        { id: 'ltv',      label: '2. LTV 比例' },
        { id: 'rates',    label: '3. 当前利率' },
        { id: 'banks',    label: '4. 银行选择' },
        { id: 'foreign',  label: '5. 外国人贷款' },
        { id: 'process',  label: '6. 申请流程' },
        { id: 'docs',     label: '7. 材料清单' },
      ]}
      faqSchema={[
        { question: '维也纳买房可以贷款多少？',
          answer: '奥地利公民 LTV 上限 90%、EU 公民 80%、非 EU 通常 60-70%。KIM-V 法规要求自住房至少 35% 首付（含 Nebenkosten 10%，即至少要拿出房价 35% + 10% = 45% 现金）。投资房可贷比例更低。' },
        { question: 'KIM-V 是什么？',
          answer: 'KIM-V 是奥地利金融市场管理局 (FMA) 2022 年起实施的房贷限制条例 (Kreditinstitute-Immobilienfinanzierungsmaßnahmen-Verordnung)。三个硬指标：35% 首付下限、35 年期上限、月供占净收入比例 40% 上限。2025 年部分放宽。' },
        { question: '当前维也纳房贷利率多少？',
          answer: '2026 年 5 月：固定利率 3.2-4.5%（10-25 年）、浮动利率 (EURIBOR+) 4.5-5.5%。利率因银行、LTV、收入稳定性差异较大。建议同时找 3-4 家银行报价对比。' },
        { question: '外国人可以在维也纳贷款吗？',
          answer: '可以。EU 公民和有奥地利长期居留 (NL / Daueraufenthalt-EU) 持有人贷款条件接近本地公民。非 EU 签证持有人 (红白红卡 / 工签等) 可贷，但 LTV 上限通常 60-70%，需要至少 30-40% 首付证明，加上 Nebenkosten 即需现金 40-50% 房价。' },
        { question: '贷款没批下来定金怎么办？',
          answer: '关键是 Kaufanbot 里要加 "Finanzierungsvorbehalt"（贷款保留条款）：如果约定时间内贷款没批下来，买方可以无责退出并退回定金。一定要在 Kaufanbot 阶段写进去。' },
      ]}
    >
      <Section id="kimv" title="1. KIM-V 法规（核心约束）">
        <p>
          <strong className="text-fg-primary">KIM-V</strong>（Kreditinstitute-Immobilienfinanzierungsmaßnahmen-Verordnung）是奥地利金融市场管理局 FMA 2022 年起实施的房贷新规。它<strong className="text-fg-primary">大幅提高了首付门槛</strong>，是当前所有买家必须面对的硬性规则。
        </p>
        <p>三个核心约束（针对<strong className="text-fg-primary">自住房</strong>）：</p>
        <ul>
          <li><strong className="text-fg-primary">首付 ≥ 20%</strong>（自住房）/ 30-35%（投资房）— 不含 Nebenkosten</li>
          <li><strong className="text-fg-primary">贷款期 ≤ 35 年</strong></li>
          <li><strong className="text-fg-primary">月供占净收入比 ≤ 40%</strong>（DSTI 上限）</li>
        </ul>
        <p>
          实际上加上 Nebenkosten 10%，最低需要<strong className="text-fg-primary">现金房价 30%</strong>（自住）/ <strong className="text-fg-primary">40-45%</strong>（投资）。
        </p>
        <p>
          注：KIM-V 在 2025 年部分放宽 — 月供比例提高到 40%（之前 30%）、年期延长到 35 年（之前 30 年）。但首付要求基本不变。
        </p>
      </Section>

      <Section id="ltv" title="2. LTV 比例（按身份分）">
        <table className="w-full text-body mt-4 border border-white/[0.06] rounded-xl overflow-hidden">
          <thead>
            <tr className="bg-bg-elev-1">
              <th className="p-3 text-left text-caption text-fg-tertiary uppercase">身份</th>
              <th className="p-3 text-right text-caption text-fg-tertiary uppercase">LTV 上限</th>
              <th className="p-3 text-right text-caption text-fg-tertiary uppercase">最低首付</th>
            </tr>
          </thead>
          <tbody className="text-fg-secondary">
            <tr className="border-t border-white/[0.06]"><td className="p-3">奥地利公民</td><td className="p-3 text-right text-gold tabular">90%</td><td className="p-3 text-right tabular">10%</td></tr>
            <tr className="border-t border-white/[0.06]"><td className="p-3">EU 公民</td><td className="p-3 text-right text-gold tabular">80%</td><td className="p-3 text-right tabular">20%</td></tr>
            <tr className="border-t border-white/[0.06]"><td className="p-3">奥地利长期居留</td><td className="p-3 text-right text-gold tabular">80%</td><td className="p-3 text-right tabular">20%</td></tr>
            <tr className="border-t border-white/[0.06]"><td className="p-3">红白红卡 / 工签</td><td className="p-3 text-right text-gold tabular">60–70%</td><td className="p-3 text-right tabular">30–40%</td></tr>
            <tr className="border-t border-white/[0.06]"><td className="p-3">学生签</td><td className="p-3 text-right text-gold tabular">40–60%</td><td className="p-3 text-right tabular">40–60%</td></tr>
            <tr className="border-t border-white/[0.06]"><td className="p-3">无奥地利身份</td><td className="p-3 text-right text-gold tabular">通常 50% 以下</td><td className="p-3 text-right tabular">≥ 50%</td></tr>
          </tbody>
        </table>
      </Section>

      <Section id="rates" title="3. 当前利率水平 (2026 年 5 月)">
        <ul>
          <li><strong className="text-fg-primary">固定利率 (Fixzins)</strong>：3.2-4.5%，期限 10-25 年</li>
          <li><strong className="text-fg-primary">浮动利率 (Variabler Zinssatz)</strong>：EURIBOR 3M + 0.8-1.5% ≈ 4.5-5.5% 当前</li>
          <li><strong className="text-fg-primary">混合 (Splitting)</strong>：50% 固定 + 50% 浮动</li>
        </ul>
        <p>
          ECB 仍处于降息周期。2026 年下半年可能进一步降息 0.25-0.50%。如果不急可以再观望。
        </p>
      </Section>

      <Section id="banks" title="4. 银行选择">
        <p>维也纳主要房贷银行（按市场份额）：</p>
        <ul>
          <li><strong className="text-fg-primary">Bank Austria (UniCredit)</strong>：大型，外国人友好</li>
          <li><strong className="text-fg-primary">Erste Bank / Sparkasse</strong>：最大本地银行</li>
          <li><strong className="text-fg-primary">Raiffeisen Bank</strong>：保守但稳定，利率有时最优</li>
          <li><strong className="text-fg-primary">Bawag</strong>：现代化、流程快</li>
          <li><strong className="text-fg-primary">Hypo Vorarlberg</strong>：豪宅 + 复杂结构</li>
          <li><strong className="text-fg-primary">Volksbank</strong>：客户服务好，灵活</li>
        </ul>
        <p>
          <strong className="text-fg-primary">建议</strong>：同时向 3-4 家银行 + 1 个独立 Kreditmakler（房贷经纪人）询价。利率差可达 0.5-1.0%，30 年累计可省 €30,000+。
        </p>
      </Section>

      <Section id="foreign" title="5. 外国人贷款（非 EU 重点）">
        <p>
          非 EU 签证持有人贷款门槛较高，但<strong className="text-fg-primary">不是不可能</strong>。关键是：
        </p>
        <ol>
          <li><strong className="text-fg-primary">稳定的奥地利收入</strong>：至少 12 个月本地工资记录。学生签 / 自由职业较难。</li>
          <li><strong className="text-fg-primary">首付来源证明</strong>：要能解释钱怎么来的（境外汇入需翻译 + 公证的资金来源说明）。</li>
          <li><strong className="text-fg-primary">担保人 / 共同借款人</strong>：奥地利 EU 居民担保会大幅降低门槛。</li>
          <li><strong className="text-fg-primary">备用第三方资料</strong>：境外资产证明、税务记录、其他银行存款。</li>
        </ol>
        <p>
          实际操作中，<strong className="text-fg-primary">非 EU 全款 + 后续做 Pfandrecht 抵押贷款</strong>也是常见路径 — 先全款买，过户完成后再申请抵押贷款，把房子作为抵押物。这种逆向操作能绕过 LTV 限制。
        </p>
      </Section>

      <Section id="process" title="6. 申请流程">
        <ol>
          <li><strong className="text-fg-primary">财务评估</strong>（1-2 周）：自评收入 / 资产 / 月供能力。</li>
          <li><strong className="text-fg-primary">银行预审</strong>（1-2 周）：拿"Finanzierungszusage Vorbehalt"（贷款条件意向书）— 用于 Kaufanbot 保护条款。</li>
          <li><strong className="text-fg-primary">看房 → Kaufanbot</strong>：报价时附"Finanzierungsvorbehalt"。</li>
          <li><strong className="text-fg-primary">正式申请</strong>（2-4 周）：签 Kaufvertrag 后提交银行，包括 Kaufvertrag、房屋估价、个人收入证明。</li>
          <li><strong className="text-fg-primary">银行评估</strong>（2-3 周）：银行委托独立评估师 (Schätzgutachten) 看房估价。</li>
          <li><strong className="text-fg-primary">贷款合同</strong>：签 Pfandurkunde（抵押契约）+ Kreditvertrag。</li>
          <li><strong className="text-fg-primary">放款</strong>：直接打到 Treuhand → 自动转给卖方。</li>
        </ol>
      </Section>

      <Section id="docs" title="7. 材料清单">
        <p>申请贷款必备文件：</p>
        <ul>
          <li>护照 / 身份证</li>
          <li>居留卡 (Aufenthaltstitel)</li>
          <li>Meldezettel（Anmeldung 证明）</li>
          <li>SteuerlD（税号）</li>
          <li>最近 3 个月工资单 (Gehaltszettel)</li>
          <li>最近 12 个月银行流水 (Kontoauszüge)</li>
          <li>劳动合同 (Arbeitsvertrag)</li>
          <li>个人净资产报表 (Vermögensaufstellung)</li>
          <li>SCHUFA / KSV1870 报告（个人信用记录）</li>
          <li>已有债务清单（其他贷款 / 信用卡）</li>
          <li>Kaufanbot 副本（房子信息）</li>
        </ul>
      </Section>
    </GuideSubLayout>
  )
}
