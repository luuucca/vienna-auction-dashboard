import React from 'react'
import { GuideSubLayout, Section } from './GuideSubLayout'

export default function ProcessGuidePage() {
  return (
    <GuideSubLayout
      pageId="process"
      metaTitle="维也纳买房流程详解 2026 — 从看房到过户全步骤 | 奥匈置业研究所"
      metaDescription="维也纳买房完整流程：看房 → Kaufanbot 报价 → 公证签约 → 付款 → Grundbuch 土地登记 → 交房。每一步具体做什么、需要多久、关键文件清单。"
      hero={{
        kicker: 'Guide · 流程',
        title: '维也纳买房流程详解',
        subtitle: '从首次看房到拿到钥匙，6–12 周完整时间线、每一步关键动作、必备文件清单、常见卡点处理。',
        readTimeMin: 8,
      }}
      toc={[
        { id: 'overview',   label: '1. 流程总览' },
        { id: 'viewing',    label: '2. 看房 (1–4 周)' },
        { id: 'offer',      label: '3. Kaufanbot 买方报价' },
        { id: 'contract',   label: '4. 公证签约 (2–3 周)' },
        { id: 'payment',    label: '5. 付款 + Treuhand' },
        { id: 'grundbuch',  label: '6. Grundbuch 土地登记' },
        { id: 'handover',   label: '7. 交房与户籍登记' },
        { id: 'checklist',  label: '8. 完整文件清单' },
      ]}
      faqSchema={[
        { question: '维也纳买房全流程要多久？',
          answer: '典型节奏 6-12 周。最快情况（全款 + 公寓 + 卖方手续齐全）可在 6 周完成；涉及贷款审批、外国人审批、Altbau 调查的情况通常 10-12 周。' },
        { question: 'Kaufanbot 买方报价是什么？',
          answer: 'Kaufanbot 是奥地利购房的"意向报价书"，以书面形式提交，包含价格、付款方式、希望成交日期。通常需要支付 3% 左右的定金，卖方接受后即进入签约阶段。' },
        { question: 'Grundbuch 土地登记需要多久？',
          answer: 'Grundbuch（土地登记）通常 4-8 周完成。公证后律师 / 公证处提交申请，注册法院（Grundbuchsgericht）处理。土地登记完成才算法律意义上的所有权转移。' },
        { question: '维也纳买房一定要请律师吗？',
          answer: '不一定要请律师，但一定要找公证人（Notar）。律师 / 公证人的费用占房价的 1-2%。复杂情况（多人共有、家族信托、外国身份特殊审批）强烈建议律师。' },
        { question: '买房定金能退吗？',
          answer: '取决于 Kaufanbot 的具体条款。一般情况下若买方违约，定金被卖方没收；若卖方反悔，需双倍返还。建议在 Kaufanbot 里加入"贷款失败可退"等保护条款。' },
      ]}
    >
      <Section id="overview" title="1. 流程总览">
        <p>
          维也纳买房（Wien Immobilienkauf）的全流程涉及 <strong className="text-fg-primary">5 个法律节点</strong> 和 <strong className="text-fg-primary">3 方机构</strong>（卖方 / 公证或律师 / 土地登记法院）。
          整个过程从开始看房到拿到钥匙，典型用时 <strong className="text-fg-primary">6–12 周</strong>。
        </p>
        <p>
          关键时间分布大致是：
        </p>
        <ul>
          <li>看房筛选：<strong className="text-fg-primary">1–4 周</strong></li>
          <li>Kaufanbot 报价 + 卖方接受：<strong className="text-fg-primary">数天</strong></li>
          <li>公证起草 Kaufvertrag + 双方签约：<strong className="text-fg-primary">2–3 周</strong></li>
          <li>买方付款到 Treuhand（信托账户）+ Grundbuch 登记：<strong className="text-fg-primary">4–8 周</strong></li>
          <li>交房 + Anmeldung 户籍登记：<strong className="text-fg-primary">即日</strong></li>
        </ul>
        <p>
          下面逐节展开每一步具体要做什么。
        </p>
      </Section>

      <Section id="viewing" title="2. 看房 (1–4 周)">
        <p>
          这一步看似简单，但 70% 的买家会在看房阶段就走偏 — 看了 20 套都不满意，或者只看了 3 套就草率决策。建议做一次<em className="not-italic text-gold">资格测试</em>明确自己能买什么后再约看房。
        </p>
        <p>
          看房节奏建议：
        </p>
        <ul>
          <li><strong className="text-fg-primary">列优先级</strong>：先定区（1-23 区中的 3-5 个），再定预算上限，最后定面积 / 房型。</li>
          <li><strong className="text-fg-primary">每周看 3-5 套</strong>：再多大脑会记混。</li>
          <li><strong className="text-fg-primary">现场必拍</strong>：层高、窗户朝向、噪音、电梯、地下储物室、自行车房。</li>
          <li><strong className="text-fg-primary">必问问题</strong>：Baujahr（建造年份）、HWB 能源等级、Betriebskosten（月度运营费）、Reparaturrücklage（维修基金）、有无 Anwartschaft（待办登记）。</li>
        </ul>
        <p>
          看到目标房源后，<strong className="text-fg-primary">最迟 48 小时内</strong>要决定是否提交 Kaufanbot。维也纳热门房源经常 3-5 天就成交。
        </p>
      </Section>

      <Section id="offer" title="3. Kaufanbot 买方报价">
        <p>
          Kaufanbot 是<strong className="text-fg-primary">书面报价书</strong>，奥地利购房法律意义上的"出价"动作。一般通过经纪人提交给卖方。
        </p>
        <p>
          Kaufanbot 通常包含：
        </p>
        <ul>
          <li>报价金额（可与挂牌价不同 — 议价空间通常 0-8%）</li>
          <li>付款方式（全款 / 贷款）</li>
          <li>希望签约和过户日期</li>
          <li>定金条款（通常房价 3% 左右，签 Kaufanbot 时打入 Treuhand）</li>
          <li><strong className="text-fg-primary">保护条款</strong>：如"贷款审批未通过可无责退出"</li>
        </ul>
        <p>
          卖方接受后，双方进入 Kaufvertrag（正式合同）起草阶段。<strong className="text-fg-primary">注意</strong>：Kaufanbot 一旦被接受，就具有法律约束力。撕毁要赔违约金。
        </p>
      </Section>

      <Section id="contract" title="4. 公证签约 (2–3 周)">
        <p>
          签约由<strong className="text-fg-primary">公证人 (Notar)</strong>或<strong className="text-fg-primary">律师 (Rechtsanwalt)</strong>主持。两者权力等同，区别在收费方式和工作风格。
        </p>
        <p>
          流程：
        </p>
        <ol>
          <li>公证 / 律师起草 Kaufvertrag 草稿 → 双方过目 → 修改 → 定稿</li>
          <li>预约公证签约 → 双方本人 / 委托律师 + 翻译（如非德语）到场</li>
          <li>当场宣读、签字、公证</li>
          <li>买方付公证费（约房价 1-2%）</li>
        </ol>
        <p>
          签约后 Kaufvertrag 即生效，但<strong className="text-fg-primary">房屋所有权仍未转移</strong> — 必须等 Grundbuch 登记完成才算。
        </p>
      </Section>

      <Section id="payment" title="5. 付款 + Treuhand">
        <p>
          奥地利购房 <em className="not-italic text-gold">几乎没有"现金交易"</em>。买方款项必须打入<strong className="text-fg-primary">Treuhand（信托账户）</strong>—— 通常由公证人或律师作为信托人持有。
        </p>
        <p>
          典型时序：
        </p>
        <ul>
          <li>签约时打 3% 定金</li>
          <li>签约后 4-6 周打剩余尾款（贷款者由银行直接打到 Treuhand）</li>
          <li>Treuhand 持有资金直到 Grundbuch 登记完成 + 卖方交房 → 释放给卖方</li>
        </ul>
        <p>
          Treuhand 制度保护双方：卖方不会"收钱不交房"，买方不会"交钱后房子还属于别人"。
        </p>
      </Section>

      <Section id="grundbuch" title="6. Grundbuch 土地登记">
        <p>
          <strong className="text-fg-primary">Grundbuch（土地登记）</strong>是奥地利的官方房产数据库。所有权转移必须通过 Grundbuch 完成，没有登记 = 没有所有权。
        </p>
        <p>
          流程：
        </p>
        <ol>
          <li>公证 / 律师准备 Eintragungsgesuch（登记申请）</li>
          <li>提交到 Grundbuchsgericht（区注册法院）</li>
          <li>缴纳 1.1% 土地登记费</li>
          <li>法院审核 → 登记 → 颁发 Grundbuchauszug（地册副本）</li>
        </ol>
        <p>
          整个 Grundbuch 流程通常 <strong className="text-fg-primary">4-8 周</strong>。登记完成的当天，你就是法律意义上的房主。
        </p>
      </Section>

      <Section id="handover" title="7. 交房与户籍登记">
        <p>
          Grundbuch 登记完成后：
        </p>
        <ul>
          <li><strong className="text-fg-primary">交房 (Schlüsselübergabe)</strong>：卖方交钥匙，双方签 Übergabeprotokoll（交房记录），核对水电气表数。</li>
          <li><strong className="text-fg-primary">Anmeldung 户籍登记</strong>：自住者 14 天内到 Magistratisches Bezirksamt 办理（带护照 / 居留卡、Mietvertrag 或 Grundbuchauszug、Meldezettel 表格）。</li>
          <li><strong className="text-fg-primary">水电气过户</strong>：联系 Wien Energie / Wiener Netze，通常 1-2 周完成。</li>
          <li><strong className="text-fg-primary">保险</strong>：买 Haushaltsversicherung（家财险）— 部分银行强制要求。</li>
        </ul>
      </Section>

      <Section id="checklist" title="8. 完整文件清单">
        <p>买房前要准备好的文件：</p>
        <ul>
          <li>护照 / 身份证</li>
          <li>居留卡 / 红白红卡（如有）</li>
          <li>Meldezettel（已 Anmeldung 者）</li>
          <li>过去 3 个月银行流水 / 资金证明</li>
          <li>就业证明 / 收入证明（贷款者）</li>
          <li>SteuerlD（税号 — 通常 Anmeldung 后由 BMF 邮寄）</li>
        </ul>
        <p>买房中要拿到的文件：</p>
        <ul>
          <li>Kaufanbot 已签字副本</li>
          <li>Kaufvertrag 正式合同</li>
          <li>Grundbuchauszug（地册副本）</li>
          <li>Übergabeprotokoll（交房记录）</li>
          <li>水电气表数 + 过户记录</li>
        </ul>
      </Section>
    </GuideSubLayout>
  )
}
