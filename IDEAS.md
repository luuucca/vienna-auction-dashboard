# IDEAS — Backlog of Future Features

Captured at the user's request. Not started — to be picked up later.

The strategic intent behind all four: **turn the site from a one-time
property browser into a recurring utility**. Users come for the tools,
stay for the listings.

---

## 1. 贷款计算器 · Mortgage Calculator

A simple interactive widget on its own page (`/tools/mortgage` or
inside `/buying-guide`) and/or embedded on the listing detail page.

### Inputs
- 房价 (purchase price) — prefilled from listing if used inline
- 首付比例 / 首付金额 (down payment % or absolute)
- 贷款年限 (5 / 10 / 15 / 20 / 25 / 30)
- 利率 (default to current AT market — needs a manual update or simple
  feed; ~3.5–4.5% typical mid-2026)
- 还款方式 (annuität vs tilgung)

### Outputs (live, recalc on each input change)
- 月供 (monthly payment)
- 总利息 / 总还款
- 摊销表预览 (first 12 months + last 12 months collapsible)
- 一行解释："您每月需要支付 €X 直到 YYYY 年"

### Extras
- "包含 Nebenkosten" toggle adds: Grunderwerbsteuer 3.5% +
  Grundbucheintragung 1.1% + 公证费 ~1–2% + 中介费 (we waive ours
  for buyers — call that out)
- 对比表：3 个利率情境（低/中/高）并排

### UX
- Numbers reactive on input change (no submit button)
- Tabular nums throughout
- Result card with gold accent on the headline monthly figure
- Can save / share result as URL params (`?price=400000&down=20&years=25&rate=3.8`)

---

## 2. 购房指南 · Buying Guide

A static-feel content page at `/buying-guide` walking a Chinese-speaking
buyer through Austrian real estate end-to-end. Sets us apart from
agencies that just list properties.

### Content sections (rough TOC)
1. **能不能买？** — non-EU buyer rules, district-by-district approval
   (各州 Ausländergrundverkehrsgesetz differences)
2. **预算怎么算** — purchase price + side costs (~10% of price total),
   maintenance reserves, monthly costs cheatsheet
3. **流程时间线** — 看房 → 出价 → 签 Kaufanbot → 公证 → Grundbuch →
   过户，6–12 周典型节奏
4. **关键税费**
   - Grunderwerbsteuer 3.5%
   - Grundbucheintragung 1.1%
   - 公证费 1–2% staffelweise
   - 印花税 / Stempelmarken
   - 持有期间：Grundsteuer, Betriebskosten, Hausverwaltung
   - 出售时：Immobilien-Ertragsteuer (ImmoESt) 30%
5. **贷款基础** — banks that lend to non-residents (Erste, BAWAG PSK,
   Hypo Vorarlberg etc.), LTV typical 60–70% for non-EU, KIM-V rules
   (35% down + 35y max for self-use)
6. **Altbau vs Neubau** — pros/cons, 装修空间，能效证书 (HWB)
7. **常见陷阱** — Sanierungsbedarf, befristete Mietverträge,
   Wohnungseigentum vs Mietshaus, dachgeschoss 屋顶维护
8. **谁帮你** — Makler / Notar / Steuerberater / Bank — 各角色的费用
   和义务

### Format
- Long-read editorial — heavy left rail TOC + reading time estimate
- "下载完整 PDF 版" CTA at bottom (gated by lead form → captures email)
- Each section ends with an inline "想咨询？" mini CTA → /about

---

## 3. 房价走势 · Price Trends

Data viz dashboard at `/market` showing:

### Vienna overall
- 平均每㎡售价 / 租金 — 滚动 12 / 24 / 60 个月
- 成交量
- 我们网站 vs 整体市场 deltas（如果有数据）

### Per district (1–23)
- 区域选择器（地图点击或下拉）
- 该区平均价 + 5 年走势线图
- 与维也纳平均的对比
- 该区近期成交亮点（自家 Notion 数据 + 公开数据混合）

### Data sources
- Statistik Austria 房价指数（公开数据，半年 / 季度发布）
- ImmoUnited / Immobilienpreisspiegel（付费数据，可考虑订阅或抓主要指标）
- 自家 listings 数据库（per-㎡ 均价 by district 实时计算）

### Tech
- Recharts 或 visx 做图（Recharts 简单足够）
- 数据用 build-time ETL 脚本生成 JSON，放 public/data/
- 月度手动更新或写 GitHub Action 自动拉取

### Hook value
- 客户每次想"看看市场怎样了"就来网站
- 单条数据可分享到小红书（生成 OG 图）

---

## 4. 资格 Quiz · "我能在维也纳买房吗？"

Single-page interactive funnel at `/quiz` — 5–8 道题，~90 秒做完，
产出个性化结果 + 自动推一份匹配的报告/CTA 到我们这里。

### Question flow
1. 您的居留状态？
   - 奥地利公民 / EU 公民
   - 奥地利长期居留 (Daueraufenthalt-EU / NL)
   - 红白红卡 / 学生 / 工作签
   - 在中国，目前没有奥地利身份
2. 您计划买房的目的？
   - 自住
   - 出租投资
   - 度假房
   - 长期持有 / 资产配置
3. 您打算买房在维也纳哪个区？(多选，跳过也可)
4. 您的预算？
   - < €300k / 300–500k / 500k–1M / > 1M / 暂未确定
5. 您是否计划在奥地利贷款？
   - 是 (followup: 大约 LTV%)
   - 否
   - 不确定
6. 您是否已经在奥地利有居所 / 注册地址？
7. 您计划多久内出手？
   - 1–3 个月 / 3–6 个月 / 6–12 个月 / 还在了解

### Results
Score-based output with 3 tiers:
- 🟢 **"可以直接进入" (绿色)** — EU 身份 / 奥地利长期居留 / 预算明确
- 🟡 **"需要规划" (黄色)** — 红白红卡持有人 / 部分预算缺口 / 非自住但能合规
- 🔴 **"建议先做铺垫" (红色)** — 无身份 + 跨境买家 + 涉及 9 区差异化州法规

Each tier shows:
- 个性化解读：3–5 句关键说明 + 用户具体回答的影响
- 推荐下一步：相关房源（基于预算和区域）、买房指南章节链接、咨询表单
- "拿走个完整 PDF 报告 + 1 次免费咨询" — 留资 hook

### Tech
- React state machine — no backend needed for the quiz itself
- Result page can include reactive recommendations from `/api/listings`
- Save quiz answers to the lead Notion DB when user fills form,
  so we know context before first contact

### Strategy
- Top funnel: small red book post drives quiz → 90s investment →
  user gets value → we get warm lead with context
- Excellent for repeated traffic — friends/family share

---

## Build priority (suggested)

1. **Quiz** — fastest to build, lowest data needs, biggest hook value
   for top-funnel social traffic
2. **Buying guide** — content-heavy but high SEO value
   (long-tail keywords)
3. **Mortgage calculator** — small but very sticky, embeds well in
   detail pages
4. **Price trends** — most complex (needs data pipeline), but
   highest "come back monthly" value

## Where these live in nav

Consider grouping under a single **「工具」(Tools)** dropdown:
- 贷款计算器
- 资格 Quiz
- 房价走势
- 购房指南

Single new top-level nav item, four child links. Keeps the nav
clean while signaling utility.
