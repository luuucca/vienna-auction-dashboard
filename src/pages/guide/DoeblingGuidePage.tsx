import React from 'react'
import { GuideSubLayout, Section } from './GuideSubLayout'

export default function DoeblingGuidePage() {
  return (
    <GuideSubLayout
      pageId="doebling-19"
      metaTitle="维也纳 19 区 Döbling 买房指南 — 高端区域房价、街区、学校全解 | 奥匈置业研究所"
      metaDescription="维也纳 19 区 Döbling 是最受华人买家关注的高端区。本指南详解 Grinzing / Nussdorf / Sievering / Heiligenstadt 等街区差异、平均房价 €9,500/m²、国际学校、地铁交通、葡萄园别墅特色。"
      hero={{
        kicker: 'Guide · 19 区',
        title: '维也纳 19 区 Döbling 买房指南',
        subtitle: '维也纳最受华人买家关注的高端区域。Grinzing 葡萄园别墅、Heiligenstadt U-Bahn 起点、Sievering 私立学校带、Kahlenberg 景观豪宅 — 6 个街区，6 种买家偏好。',
        readTimeMin: 8,
      }}
      toc={[
        { id: 'overview',     label: '1. 区域概览' },
        { id: 'neighborhoods', label: '2. 6 个街区对比' },
        { id: 'prices',       label: '3. 房价水平' },
        { id: 'schools',      label: '4. 学校与教育' },
        { id: 'transport',    label: '5. 交通与基础设施' },
        { id: 'who',          label: '6. 谁适合买这里' },
      ]}
      faqSchema={[
        { question: '维也纳 19 区 Döbling 房价多少？',
          answer: '2026 年 Döbling 平均售价约 €9,500/m²，区间 €6,200–€16,000/m²。Grinzing、Cobenzl、Kahlenberg 等葡萄园别墅区可达 €12,000-€20,000/m²，Heiligenstadt 公寓约 €7,000-€9,500/m²。' },
        { question: '为什么华人买家偏爱 Döbling？',
          answer: 'Döbling 拥有维也纳最佳的"低密度 + 国际学校 + 葡萄园景观"组合：Vienna International School、Lycée Français 等顶尖国际学校；U4 终点站 Heiligenstadt 直达市中心；Wienerwald 维也纳森林边缘；房价相对 1 区便宜 30-40% 但环境更优。' },
        { question: 'Grinzing 跟 Heiligenstadt 哪个更好？',
          answer: 'Grinzing 是经典葡萄园别墅区，独栋豪宅为主，安静、私密、需要开车；Heiligenstadt 是 U4 终点 + Schnellbahn 枢纽，公寓为主，交通便利、生活配套全。预算 €1M+ 选 Grinzing，€500K-1M 选 Heiligenstadt。' },
        { question: 'Döbling 适合投资还是自住？',
          answer: 'Döbling 主要是自住区。租金回报率 2.5-3.5%（低于市平均 4-4.5%），因为房价基数高。但租客质量高（外交官、跨国公司高管），出租稳定。投资角度更偏长期保值 + 增值。' },
      ]}
    >
      <Section id="overview" title="1. 区域概览">
        <p>
          <strong className="text-fg-primary">19. Bezirk Döbling</strong> 位于维也纳西北部，是维也纳<strong className="text-fg-primary">最大的住宅区</strong>（面积 25 km²），人口约 75,000。地理上从城市边缘的多瑙运河延伸到 Wienerwald 维也纳森林，包含葡萄园丘陵、河岸平原和山顶景观区。
        </p>
        <p>
          华人买家眼中的 Döbling = "维也纳的香山 + 海淀"：
        </p>
        <ul>
          <li><strong className="text-fg-primary">低密度</strong>：人口密度仅 3,000/km²（vs 1 区 13,000/km²）</li>
          <li><strong className="text-fg-primary">国际教育聚集</strong>：Vienna International School、Lycée Français、AISV 都在或靠近 19 区</li>
          <li><strong className="text-fg-primary">葡萄园景观</strong>：Heuriger 酒馆文化、Wienerwald 步道、独栋别墅</li>
          <li><strong className="text-fg-primary">保值性强</strong>：房价 5 年涨幅约 28%（与维也纳平均一致），但波动小</li>
        </ul>
      </Section>

      <Section id="neighborhoods" title="2. 6 个街区对比">
        <h3 className="text-heading-md text-fg-primary mt-6 mb-2">Heiligenstadt</h3>
        <p>
          U4 地铁终点 + Schnellbahn 枢纽，<strong className="text-fg-primary">交通最便利</strong>。公寓为主，€7,000-9,500/m²。适合首次买家、年轻家庭。
        </p>
        <h3 className="text-heading-md text-fg-primary mt-6 mb-2">Nussdorf</h3>
        <p>
          紧邻多瑙运河，<strong className="text-fg-primary">水景公寓 + 老式别墅</strong>混合。€8,500-12,000/m²。适合喜欢河岸 + 葡萄园双重生活。
        </p>
        <h3 className="text-heading-md text-fg-primary mt-6 mb-2">Grinzing</h3>
        <p>
          经典葡萄园别墅区，<strong className="text-fg-primary">维也纳最知名的 Heuriger 集中地</strong>。独栋别墅 €1.2M-€8M。Beethoven 故居所在。需要开车，但环境无可替代。
        </p>
        <h3 className="text-heading-md text-fg-primary mt-6 mb-2">Sievering</h3>
        <p>
          国际学校带，<strong className="text-fg-primary">华人家庭最集中的子区</strong>。Vienna International School 步行可达。独栋 €1M-€5M，连排别墅 €700K-1.5M。
        </p>
        <h3 className="text-heading-md text-fg-primary mt-6 mb-2">Oberdöbling</h3>
        <p>
          19 区核心商业带，<strong className="text-fg-primary">老 Altbau 大公寓</strong>为主。€8,000-11,000/m²。生活配套最齐全。
        </p>
        <h3 className="text-heading-md text-fg-primary mt-6 mb-2">Cobenzl & Kahlenberg</h3>
        <p>
          海拔最高的山顶区域，<strong className="text-fg-primary">维也纳最贵的景观豪宅</strong>。€15,000-25,000/m²。私密、寂静、风景独好，但日常通勤不便。
        </p>
      </Section>

      <Section id="prices" title="3. 房价水平 (2026)">
        <table className="w-full text-body mt-4 border border-white/[0.06] rounded-xl overflow-hidden">
          <thead>
            <tr className="bg-bg-elev-1">
              <th className="p-3 text-left text-caption text-fg-tertiary uppercase">街区</th>
              <th className="p-3 text-right text-caption text-fg-tertiary uppercase">公寓 €/m²</th>
              <th className="p-3 text-right text-caption text-fg-tertiary uppercase">独栋别墅</th>
            </tr>
          </thead>
          <tbody className="text-fg-secondary">
            <tr className="border-t border-white/[0.06]"><td className="p-3">Heiligenstadt</td><td className="p-3 text-right tabular">€7,000-9,500</td><td className="p-3 text-right tabular">少见</td></tr>
            <tr className="border-t border-white/[0.06]"><td className="p-3">Nussdorf</td><td className="p-3 text-right tabular">€8,500-12,000</td><td className="p-3 text-right tabular">€900K-2.5M</td></tr>
            <tr className="border-t border-white/[0.06]"><td className="p-3">Oberdöbling</td><td className="p-3 text-right tabular">€8,000-11,000</td><td className="p-3 text-right tabular">€1M-3M</td></tr>
            <tr className="border-t border-white/[0.06]"><td className="p-3">Sievering</td><td className="p-3 text-right tabular">€9,000-13,000</td><td className="p-3 text-right tabular">€1M-5M</td></tr>
            <tr className="border-t border-white/[0.06]"><td className="p-3">Grinzing</td><td className="p-3 text-right tabular">€10,000-14,000</td><td className="p-3 text-right tabular">€1.2M-8M</td></tr>
            <tr className="border-t border-white/[0.06]"><td className="p-3">Cobenzl / Kahlenberg</td><td className="p-3 text-right tabular">少见</td><td className="p-3 text-right tabular">€2M-15M</td></tr>
          </tbody>
        </table>
        <p className="mt-4 text-caption text-fg-tertiary">
          数据来源：ImmoUnited Marktbericht 2025/26、Statistik Austria HPI Q4 2025、Der Standard 季度报告综合。
        </p>
      </Section>

      <Section id="schools" title="4. 学校与教育">
        <p>
          Döbling 是<strong className="text-fg-primary">维也纳教育资源最密集的区</strong>。国际学校（华人买家最关心）：
        </p>
        <ul>
          <li><strong className="text-fg-primary">Vienna International School (VIS)</strong>：Sievering，IB 课程，€18,000-€26,000/年</li>
          <li><strong className="text-fg-primary">Lycée Français de Vienne</strong>：Grinzing，法语课程</li>
          <li><strong className="text-fg-primary">American International School Vienna (AISV)</strong>：紧邻 19 区</li>
          <li><strong className="text-fg-primary">Sir Karl Popper Schule</strong>：天才儿童公立高中</li>
        </ul>
        <p>
          公立学校（Volksschule + Gymnasium）质量普遍高于维也纳其他区。Bezirksranking 教育指数维也纳 23 区中排第 1-2 名。
        </p>
      </Section>

      <Section id="transport" title="5. 交通与基础设施">
        <ul>
          <li><strong className="text-fg-primary">U4 地铁</strong>：终点站 Heiligenstadt → 12 分钟到 1 区市中心</li>
          <li><strong className="text-fg-primary">Schnellbahn S40</strong>：Heiligenstadt → Floridsdorf 北部联系</li>
          <li><strong className="text-fg-primary">38 路有轨电车</strong>：Schottentor → Grinzing</li>
          <li><strong className="text-fg-primary">D 路有轨电车</strong>：Wien Hauptbahnhof → Nussdorf</li>
          <li><strong className="text-fg-primary">39A 公交</strong>：Sievering → Heiligenstadt</li>
        </ul>
        <p>
          山区街区（Cobenzl / Kahlenberg）几乎没有公共交通 - 必须有车。Grinzing 公交频率较低（每 15-20 分钟）。Heiligenstadt 完全靠地铁，无需买车。
        </p>
      </Section>

      <Section id="who" title="6. 谁适合买 Döbling">
        <p>
          <strong className="text-fg-primary">✓ 适合</strong>：
        </p>
        <ul>
          <li>有孩子的家庭（特别是要送国际学校）</li>
          <li>预算 €600K+，看重生活环境而非交通便利</li>
          <li>外交官、跨国公司高管、医生律师等高净值职业</li>
          <li>计划长期持有 10+ 年 / 资产保值</li>
        </ul>
        <p>
          <strong className="text-fg-primary">✗ 不太适合</strong>：
        </p>
        <ul>
          <li>预算 &lt;€400K（19 区性价比不高，建议 14/16/17 区）</li>
          <li>纯投资追求高租金回报（19 区租金率低）</li>
          <li>夜生活爱好者（这区 9 点后基本就安静了）</li>
          <li>不开车的人，且想住山区</li>
        </ul>
      </Section>
    </GuideSubLayout>
  )
}
