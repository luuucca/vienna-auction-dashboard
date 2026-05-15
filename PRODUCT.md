# PRODUCT.md — 奥匈置业研究所

> Living document. Edit anytime; the design tools will pick up the change next run.

## 1. What this is

A boutique Vienna real-estate brokerage website serving **Mandarin-speaking
clients** end-to-end. Two functions sit side-by-side:

1. **Live listings** — 114+ active properties (sale and rent) curated from
   partner agencies (PS-Immo, Yellowbird, etc.), all rewritten in Chinese
   with proper hierarchy and quality photography.
2. **Foreclosure dashboard (法拍房检索)** — a queryable feed of Austrian
   court-auctioned properties pulled from `edikte.justiz.gv.at`, with
   Chinese-language guidance on the bidding process.

The site is the digital extension of the founder's Xiaohongshu (小红书)
following — a way to convert curious followers into qualified leads
without forcing them to DM on a Chinese social platform.

## 2. Who uses it

A single audience: **Chinese-speaking individuals connected to Vienna**.
Within that, four overlapping personas:

- **The first-time buyer family** (35–50). Lives in Wien or thinking of
  relocating. Wants a 2-bedroom in 19, 22, 23. Mostly self-use, some
  inheritance planning. Reads everything in Chinese. Needs hand-holding.
- **The investor** (40–60). Owns property in China. Looking for cash-flow
  rentals or distressed bargains. Comfortable with numbers, allergic to
  fluff. Will jump to foreclosure listings first.
- **The Xiaohongshu follower** (any age). Found the brand on social
  media. Browsing, semi-curious, not ready to buy. Will convert if the
  site feels professional and the messaging clicks.
- **The owner** (any age). Has property in Vienna, wants to sell/rent.
  Lands on `/list-property`. Needs to trust the broker with a six-figure
  decision — fast.

All personas read Chinese fluently, may not read German, treat English
as decorative. Most are on mobile-first iPhones.

## 3. Brand voice

**Modern, refined, expert** — adjacent to a wealth-management firm, not
a discount aggregator. Translate that into tone:

- **Quiet authority.** Statements of fact, not exclamations. Never
  `🔥`, never "limited time!", never ALL CAPS pressure.
- **Numbers over adjectives.** "1990 年建造，居住面积 78㎡，建筑能效 B 级"
  beats "豪华精装、地段绝佳".
- **Bilingual fluency** where useful: keep proper nouns (Wien, Belvedere,
  Donaustadt) in the original; everything else in clean Mandarin.
- **Editorial pacing.** Generous paragraph breaks, calm hierarchy, the
  feeling of reading a curator's note rather than scrolling a feed.

What we sound like: 《单读》, 一条, Apple China retail copy, Aesop product
descriptions.

What we DO NOT sound like: 链家/贝壳类 portal CTA bombing, Xiaohongshu
小作文 with 12 emoji per paragraph, German Immobilien jargon untranslated,
salesy "为您量身打造尊享" filler.

## 4. Key things that must come across

In rough priority order (informs hero copy, repeated touchpoints):

1. **中文一条龙服务** — every step in Chinese: viewing → negotiation →
   contract → notary → land registry → tax filing. With a real human, not
   a translator app.
2. **法拍房专长** — Austrian foreclosure is opaque to non-German
   speakers. We translate the listings, explain bidding deposits, escort
   buyers through the Gerichtskommissär process. Few competitors do this.
3. **购房流程指南** — buying property in Austria differs from China
   (no 房产证, mandatory notary, Grunderwerbsteuer, foreign-buyer
   rules). The site should educate first, sell second.
4. **真实房源** — every listing on the site is currently for sale/rent.
   No "已售房源" filler, no fake teasers. Updated continuously from
   Notion.

## 5. Strategic principles (non-negotiable)

- **Mobile-first.** 70%+ of traffic comes from Xiaohongshu, which means
  iPhone Safari. Test every change at 390×844 first.
- **Speed > polish at first paint.** Apple-quality means images load
  instantly, not after a swirl spinner. Lazy-load aggressively below
  the fold, hard-load hero.
- **No CTA pop-ups, no chat widgets, no exit-intent modals.** Trust is
  the brand; aggressive lead-cap UI breaks it.
- **One primary CTA per page.** Crisp choices, never "提交 / 立即咨询 /
  扫码联系" stacked together.
- **Chinese first, German second, English last** in microcopy and
  fallbacks.

## 6. Anti-patterns (instant kill on sight)

- Stock-photo "smiling agent shaking hands"
- Generic shadcn purple/violet anything
- Bouncing/wobbling motion (cute → cheap)
- Gradient buttons with rainbow borders
- Excessive emoji in headers (one max, semantic, never decorative)
- Generic Lucide icon walls with no information density
- "Why choose us" sections with 4 identical cards
- Hero with full-bleed video autoplay
- Cookie banners that nag

## 7. Out of scope

- User accounts / favorites (lead capture is enough)
- Direct online booking (every appointment goes through us first)
- English / German UI translations (Chinese-only by design)
- Crypto / fintech / loan-comparison features
- AI chat agent on-page (use Telegram-based handoff instead)

## 8. Success metric

Single number: **monthly qualified leads via `/api/lead`**. Everything
else — page views, bounce rate, time on site — is a proxy for that.

A "qualified lead" is one with name + working contact + a specific
intent (区域 / 预算 / 时间窗口).
