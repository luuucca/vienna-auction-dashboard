# 维也纳法拍房空间尽调看板

基于奥地利司法公告 **Ediktsdatei** 的维也纳法院法拍房可视化看板，面向投资者和尽调团队。

## 功能特点

- **地图可视化**：CartoDB 底图 + 自定义起拍价标签标注
- **点位联动**：点击地图跳转资产详情，点击列表定位地图
- **多维筛选**：关键词 / 类别 / 排序（估值、起拍价、折扣比例）
- **资产卡片**：涵盖估值、起拍价、面积、单价、Vadium、风险标签、专家摘要
- **响应式布局**：桌面两栏，移动端单栏

---

## 本地运行

### 环境要求

- Node.js ≥ 18
- npm ≥ 9

### 快速启动

```bash
# 进入项目目录
cd vienna-auction-dashboard

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

浏览器自动打开 `http://localhost:3000`

### 构建生产包

```bash
npm run build
# 产物输出至 dist/
```

---

## 文件结构

```
vienna-auction-dashboard/
├── public/
│   └── data/
│       └── auctions.json         ← 法拍房数据（JSON驱动，手动或脚本更新）
├── src/
│   ├── components/
│   │   ├── Header.tsx            ← 顶部标题栏
│   │   ├── StatsCards.tsx        ← 统计卡片
│   │   ├── FilterBar.tsx         ← 搜索/筛选/排序
│   │   ├── MapView.tsx           ← Leaflet 地图
│   │   ├── AuctionCard.tsx       ← 资产台账卡片
│   │   ├── AuctionList.tsx       ← 资产列表容器
│   │   └── DetailPanel.tsx       ← 选中资产详情面板
│   ├── hooks/
│   │   └── useAuctions.ts        ← 数据加载 Hook
│   ├── types/
│   │   └── auction.ts            ← TypeScript 类型定义
│   ├── utils/
│   │   └── formatters.ts         ← 格式化工具函数
│   ├── App.tsx                   ← 主布局 + 状态管理
│   ├── main.tsx                  ← 应用入口
│   └── index.css                 ← 全局样式 + Leaflet 覆盖
├── scripts/
│   └── update-auctions.py        ← 数据抓取脚本（Playwright）
├── .github/
│   └── workflows/
│       └── update-auctions.yml   ← GitHub Actions 每日自动更新
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

---

## 如何新增 / 编辑 / 更新法拍数据

### 手动编辑

直接修改 `public/data/auctions.json`，每条记录的完整字段说明：

```jsonc
{
  "id": "唯一ID（手动新增时可用日期+序号，如 wien-2026-011）",
  "caseNumber": "案号（如 35 E 51/24v）",
  "auctionDate": "YYYY-MM-DD（拍卖日期）",
  "address": "完整地址（如 Villenweg 46, 1190 Wien）",
  "district": "邮政区码（如 1190）",
  "title": "资产名称（如 Wohnhaus – Altbauvilla）",
  "category": "类别（见下方枚举）",
  "estimatedValue": 5560000,     // 专家估值（欧元）
  "minimumBid": 2780000,          // 起拍价（欧元）
  "area": 327.46,                 // 面积（平米）
  "pricePerSqm": 16982.42,        // 每平米估价（= estimatedValue / area）
  "deposit": 556000,              // Vadium 保证金（欧元）
  "latitude": 48.2524,            // 纬度
  "longitude": 16.3548,           // 经度
  "geocodeSource": "approximate", // official | manual | approximate
  "ownershipType": "产权类型描述",
  "summary": "专家报告摘要（中文）",
  "riskTags": ["已出租", "需复核负担"],  // 风险标签数组
  "detailUrl": "https://edikte.justiz.gv.at/...",
  "pdfUrl": "https://edikte.justiz.gv.at/...",
  "shortReportUrl": ""            // 简版报告 URL，无则留空
}
```

**category 枚举值**（必须与下列之一完全一致）：
- `Eigentumswohnung` — 公寓产权
- `Wohnungseigentumsobjekt` — 区分所有
- `Einfamilienhaus` — 独栋住宅
- `Mehrfamilienhaus` — 多户住宅
- `Mietshaus` — 出租楼
- `gewerbliche Liegenschaft` — 商业物业
- `Sonstiges` — 其他

**geocodeSource 字段**：
- `official` — 通过 Stadt Wien OGD AddressService 精确落点
- `manual` — 人工标注精确坐标
- `approximate` — 区级中心点近似坐标（演示用，正式上线应替换）

---

### 接入精确地址服务

正式上线时，将 `scripts/update-auctions.py` 中的 `geocode_address_official()` 函数替换为真实 API 调用：

```bash
# 官方接口示例
GET https://data.wien.gv.at/ogdwien/rest/ogdaddress?ADDRESS=Villenweg+46&SRSNAME=EPSG:4326
```

---

## 部署到 Vercel

1. 将本项目推送到 GitHub 仓库
2. 在 [vercel.com](https://vercel.com) 导入该仓库
3. Framework Preset 选择 **Vite**
4. Build Command：`npm run build`
5. Output Directory：`dist`
6. 点击 **Deploy**，自动生成线上地址

---

## 接入 GitHub Actions 自动更新

### 配置步骤

1. 将本地仓库推送至 GitHub
2. 确认 `.github/workflows/update-auctions.yml` 已在仓库中
3. 在 GitHub 仓库的 **Settings → Actions → General** 中，启用：
   - `Read and write permissions`
4. 如需触发 Vercel 重新部署，在 **Settings → Secrets** 中添加：
   - `VERCEL_DEPLOY_HOOK` = 你的 Vercel 部署触发 URL

### 运行频率

默认每天 UTC 00:00（北京时间 08:00）运行一次。修改 cron 表达式：

```yaml
# .github/workflows/update-auctions.yml
schedule:
  - cron: '0 0 * * *'  # 每天 UTC 00:00
```

### 手动触发

在 GitHub 仓库的 **Actions** 标签页，选择 "每日更新法拍数据"，点击 **Run workflow**。

---

## 本地运行数据更新脚本

```bash
# 安装依赖
pip install playwright beautifulsoup4
playwright install chromium

# 运行（⚠️ 每日最多一次，遵守 Ediktsdatei 使用条款）
python scripts/update-auctions.py
```

---

## 坐标服务说明

> 当前演示版本使用区级中心点近似坐标（`geocodeSource: "approximate"`）。
>
> 正式上线建议使用 **Stadt Wien OGD AddressService**：
> `https://data.wien.gv.at/ogdwien/rest/ogdaddress`
>
> 精确坐标需在每条记录写入后将 `geocodeSource` 改为 `"official"` 或 `"manual"`。

---

## 合规提醒

- 本项目数据来源为奥地利联邦司法部 Ediktsdatei，使用前请确认当前有效的使用条款
- 自动抓取脚本设置了 10 秒间隔，严禁修改为高频请求
- 本平台仅供投资尽调参考，不构成法律或财务建议
