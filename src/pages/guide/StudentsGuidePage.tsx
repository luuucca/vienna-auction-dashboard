import React from 'react'
import { GuideSubLayout, Section } from './GuideSubLayout'

export default function StudentsGuidePage() {
  return (
    <GuideSubLayout
      pageId="students"
      metaTitle="留学生维也纳买房指南 — 学生签 / 红白红卡能买房吗？| 奥匈置业研究所"
      metaDescription="留学生在维也纳能买房吗？学生签、红白红卡 Plus、家庭支援购房三条路径详解。LTV 上限、首付比例、税务影响、未来留奥规划全攻略。"
      hero={{
        kicker: 'Guide · 留学生',
        title: '留学生维也纳买房指南',
        subtitle: '中国留学生在维也纳的三条购房路径：学生签自己买（难）、家庭援助买（最常见）、红白红卡 Plus 自购（最稳）。每条的资格、风险与具体操作。',
        readTimeMin: 7,
      }}
      toc={[
        { id: 'can-i-buy', label: '1. 留学生能买房吗' },
        { id: 'paths',     label: '2. 三条购房路径' },
        { id: 'loans',     label: '3. 学生身份贷款' },
        { id: 'taxes',     label: '4. 税务影响' },
        { id: 'future',    label: '5. 未来留奥规划' },
        { id: 'tips',      label: '6. 给留学生的 5 个建议' },
      ]}
      faqSchema={[
        { question: '留学生在维也纳能买房吗？',
          answer: '可以。学生签持有人可以购房，但要通过 Ausländergrundverkehrsgesetz 审批（维也纳相对宽松）。实际操作中三条常见路径：学生本人买（贷款门槛高，多数全款）、父母汇款由学生持有、红白红卡 Plus 转正后买。' },
        { question: '学生签可以贷款买房吗？',
          answer: '理论上可以，但难度大。银行通常要求 LTV 40-60%，即首付 40-60% + Nebenkosten 10%。如果有家庭担保人（最好是有奥地利收入的亲属），可贷比例可提高到 60-70%。学生本人无收入则几乎无法纯名义贷款。' },
        { question: '父母汇款给留学生买房合规吗？',
          answer: '完全合规。但需要：1) 资金来源说明（境外汇款翻译 + 公证）2) 申报为"赠与" (Schenkung) - 直系亲属赠与免税 3) 学生需有奥地利 SteuerlD 4) 银行账户接收。资金来源不清晰会卡公证。' },
        { question: '红白红卡 Plus 持有人买房有什么优势？',
          answer: '红白红卡 Plus（Rot-Weiß-Rot-Karte Plus）已等同于长期居留者，购房权利接近 EU 公民。LTV 上限 80%、不需要 Ausländergrundverkehrsgesetz 审批、贷款利率与本地公民同等。从学生签升 RWR+ 通常需要工作满 21 个月。' },
        { question: '毕业后回国了，房子怎么办？',
          answer: '完全保留所有权 - 国籍 / 居留状态变化不影响 Grundbuch 登记。可以委托物业管理公司出租（年回报 3-4%）或留待后用。但出租收入需在奥地利申报，税率 25-50%（看总收入）。' },
      ]}
    >
      <Section id="can-i-buy" title="1. 留学生在维也纳真的能买房吗">
        <p>
          答案是<strong className="text-fg-primary">可以，但路径要选对</strong>。
        </p>
        <p>
          奥地利没有"禁止外国人买房"的法律。维也纳的 <em className="not-italic text-gold">Ausländergrundverkehrsgesetz</em>（外国人土地交易法）是全奥地利最宽松的之一 — 大部分区域不需要单独审批，只需要登记。
        </p>
        <p>
          所以法律层面留学生（学生签持有人）<strong className="text-fg-primary">可以买</strong>。但<strong className="text-fg-primary">实际操作有难度</strong>，主要瓶颈在：
        </p>
        <ul>
          <li><strong className="text-fg-primary">资金</strong>：学生本人无收入，贷款几乎不可能</li>
          <li><strong className="text-fg-primary">银行账户</strong>：开户需要 Anmeldung + SteuerlD</li>
          <li><strong className="text-fg-primary">公证流程</strong>：需要德语 / 中德翻译陪同</li>
          <li><strong className="text-fg-primary">资金来源说明</strong>：境外父母汇款要走完整流程</li>
        </ul>
      </Section>

      <Section id="paths" title="2. 三条购房路径">
        <h3 className="text-heading-md text-fg-primary mt-6 mb-2">A. 学生本人全款买（最稳但贵）</h3>
        <p>
          家长把钱赠与孩子，孩子在奥地利账户全款付清。
        </p>
        <ul>
          <li>✓ 流程最简单（无银行审批环节）</li>
          <li>✓ 学生即名义所有人</li>
          <li>✓ 未来出售时 ImmoESt 30% 起算</li>
          <li>✗ 占用大量现金</li>
          <li>✗ 资金来源说明必须做完整 (Bank Compliance)</li>
        </ul>

        <h3 className="text-heading-md text-fg-primary mt-6 mb-2">B. 父母买，孩子使用（更灵活）</h3>
        <p>
          父母作为 Grundbuch 所有人，孩子拥有 <em className="not-italic text-gold">Wohnrecht</em>（居住权）。
        </p>
        <ul>
          <li>✓ 父母保留所有权 / 控制权</li>
          <li>✓ 父母可能享受境外资金更多税务优势</li>
          <li>✓ 适合家庭尚未决定孩子是否留奥</li>
          <li>✗ 父母需要亲自来奥地利签公证（或委托律师）</li>
          <li>✗ 未来转移给孩子需办 Schenkungsvertrag</li>
        </ul>

        <h3 className="text-heading-md text-fg-primary mt-6 mb-2">C. 等红白红卡 Plus 后再买（最理想）</h3>
        <p>
          毕业 → 找到工作 → 红白红卡 → 工作满 21 个月 → 红白红卡 Plus → 与 EU 公民等同购房权。
        </p>
        <ul>
          <li>✓ LTV 80%，首付 20% + Nebenkosten 即可</li>
          <li>✓ 贷款利率与本地公民同等</li>
          <li>✓ 长期居留路径明确</li>
          <li>✗ 需要至少 2-3 年时间</li>
          <li>✗ 房价可能继续涨</li>
        </ul>
      </Section>

      <Section id="loans" title="3. 学生身份贷款">
        <p>
          学生身份直接贷款<strong className="text-fg-primary">几乎不可能</strong>。原因：银行评估贷款主要看奥地利本地稳定收入，学生没有。
        </p>
        <p>
          实际可行的几种"曲线救国"：
        </p>
        <ul>
          <li><strong className="text-fg-primary">担保人 + 共同借款人</strong>：找一位有奥地利稳定工作 + 良好信用的亲属担保。担保人对债务承担连带责任。</li>
          <li><strong className="text-fg-primary">境外资产抵押</strong>：将国内房产 / 存款作为担保（少数私人银行接受）。</li>
          <li><strong className="text-fg-primary">先全款，后抵押</strong>：先全款买，过户完成后再以房产为抵押申请贷款。这种逆操作能绕过 LTV 限制。</li>
          <li><strong className="text-fg-primary">家庭信托结构</strong>：通过香港 / 国内信托公司持有奥地利资产 - 复杂但合法。</li>
        </ul>
      </Section>

      <Section id="taxes" title="4. 税务影响">
        <p>
          学生身份不影响购房本身的税费（Nebenkosten 10% 不变），但影响：
        </p>
        <ul>
          <li><strong className="text-fg-primary">无 ImmoESt 主要居所豁免（自住 2 年 / 持有 10 年规则）</strong>：因为学生签到期可能回国，"主要居所"认定有争议。</li>
          <li><strong className="text-fg-primary">出租收入税</strong>：如果毕业后回国把房子出租，租金收入在奥地利申报，税率 25-50%。</li>
          <li><strong className="text-fg-primary">遗产税</strong>：奥地利无遗产税，但有继承登记费。父母赠与给学生的不动产，直系亲属享 0.5%-2% 的优惠税率。</li>
        </ul>
      </Section>

      <Section id="future" title="5. 未来留奥规划">
        <p>
          学生买房常常是"未来留奥"的押注。建议提前规划：
        </p>
        <ol>
          <li><strong className="text-fg-primary">毕业前 12 个月开始找工作</strong>：奥地利毕业生有 12 个月的 Jobsuche 居留延长（Aufenthaltsbewilligung für Arbeitssuche）。</li>
          <li><strong className="text-fg-primary">找到工作后申请红白红卡</strong>：通常 4-12 周审批。</li>
          <li><strong className="text-fg-primary">工作 21 个月 → 红白红卡 Plus</strong>：购房权利大幅提升。</li>
          <li><strong className="text-fg-primary">居住 5 年 → Daueraufenthalt-EU（长居）</strong>：彻底等同 EU 公民。</li>
          <li><strong className="text-fg-primary">居住 10 年 → 入籍</strong>：奥地利公民 - 全部门槛消失。</li>
        </ol>
      </Section>

      <Section id="tips" title="6. 给留学生的 5 个建议">
        <ol>
          <li><strong className="text-fg-primary">不要急</strong>：维也纳房价不会一夜暴涨，毕业 + RWR+ 后再买条件好得多。</li>
          <li><strong className="text-fg-primary">先 Anmeldung</strong>：买房前至少 6 个月在奥地利完成户籍登记 - 简化所有银行 / 公证流程。</li>
          <li><strong className="text-fg-primary">小户型起手</strong>：第一套买 30-50 ㎡ 单身公寓最稳。€200K-€350K 区间，留学期间自住 + 毕业后出租或留作首付升级。</li>
          <li><strong className="text-fg-primary">选 U-Bahn 沿线</strong>：U1 / U4 沿线对租客和后续转售都有优势。Heiligenstadt（19）、Praterstern（2）、Längenfeldgasse（12）都是热门。</li>
          <li><strong className="text-fg-primary">咨询专业人士</strong>：留学生买房涉及移民 + 税务 + 法律三个维度，单靠经纪人不够。建议联系熟悉中国学生 / 家庭情况的中介团队，至少做一次深度规划。</li>
        </ol>
      </Section>
    </GuideSubLayout>
  )
}
