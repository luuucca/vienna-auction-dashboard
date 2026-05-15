# DESIGN.md — Visual & Interaction System

> Living document. Reference target: modern + refined, calibrated like
> Apple's site or Aesop's storytelling pages — quiet luxury, generous
> negative space, almost no decoration, every element earning its place.

## 1. Foundations

### 1.1 Aesthetic register

**Editorial dark mode with a single gold accent.** Inspirations: Apple
dark UI, Linear's landing page, Mubi, Aesop.com (dark mode), MoMA store.
NOT: Material You vibrancy, glassmorphism dashboards, neumorphism, retro
brutalism.

### 1.2 Spacing scale (px, 4-based)

```
0 · 2 · 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80 · 96 · 128 · 160
```

Default rhythm:
- Inline element padding: 8 / 12 / 16
- Card padding: 24 / 32
- Section vertical padding (mobile / desktop): 64 / 96 / 128
- Maximum content width: **1100px** (`max-w-[1100px]`) — narrower than
  shadcn's 1200, gives the editorial feel.

### 1.3 Radius scale

```
none · 4 · 8 · 12 · 16 · 24 · full
```

Defaults: inputs/buttons `8`, cards `16`, hero blocks `24`. **Never use
`rounded-3xl` on small components** — it looks toy-like at small sizes.

## 2. Color system

Dark first. All values in hex; Tailwind classes shown where common.

### 2.1 Surface ladder

```
--bg-base    : #0c0c0c   (page background — slightly warmer than pure black)
--bg-elev-1  : #131313   (cards, nav background)
--bg-elev-2  : #1a1a1a   (hover surfaces)
--bg-elev-3  : #242424   (input fields)
--bg-overlay : rgba(255,255,255,0.04)  (subtle dividers on dark surfaces)
```

NOT `#000`. Pure black on OLED looks oily; #0c0c0c reads as
"intentional".

### 2.2 Foreground / type

```
--fg-primary   : #ededed     (body text — never #fff)
--fg-secondary : #a0a0a0     (meta, captions)
--fg-tertiary  : #6a6a6a     (placeholders, "less important")
--fg-disabled  : #4a4a4a
```

Pure white (`#fff`) is reserved for **hero display type only** —
everything else uses `#ededed`. This single rule already separates the
site from 80% of dark-mode designs.

### 2.3 Accent — Editorial Gold

```
--gold-primary : #d4af37     (interactive, links, primary CTA)
--gold-hover   : #c9a431     (slightly desaturated on hover)
--gold-tint    : rgba(212,175,55,0.08)   (very faint backgrounds)
--gold-line    : rgba(212,175,55,0.25)   (1px accents, focus rings)
```

**Gold appears no more than 3× per viewport.** Constraint forces every
gold pixel to mean something. If a section already has a gold heading
underline, the CTA button there must not also be gold-on-gold —
demote it to a ghost variant.

### 2.4 Semantic

```
--success : #4ade80   (very rarely used — confirmation only)
--danger  : #f87171   (error banners only)
--info    : #60a5fa   (links to external resources)
```

Avoid color-coding categories. The site has one color system: dark +
gold. Adding teal/coral district badges breaks the register.

## 3. Typography

### 3.1 Family

- **Display / hero**: Playfair Display (already loaded). Use sparingly —
  only for major H1s and brand moments. Otherwise it shouts.
- **Body / UI**: Inter (already loaded). Variable weights 300–700.
- **Numeric tabular**: Inter with `font-variant-numeric: tabular-nums`
  for prices, sizes, room counts. Critical for table alignment.
- **CJK**: Defer to system stack (`PingFang SC` on Apple, `Microsoft
  YaHei` fallback) — do not force a webfont; Chinese webfonts are 10MB+.

### 3.2 Scale

```
display-xl  : 48 / 60 / 72   weight 600   tracking -0.02em   (hero only)
display-lg  : 36 / 44 / 52   weight 600   tracking -0.02em
heading-xl  : 28 / 32        weight 600   tracking -0.015em
heading-lg  : 22 / 24        weight 600
heading-md  : 18 / 20        weight 600
body-lg     : 16 / 17        weight 400   line-height 1.6
body        : 14 / 15        weight 400   line-height 1.65
caption     : 12 / 13        weight 500   tracking 0.01em
overline    : 10 / 11        weight 600   tracking 0.22em   uppercase
```

`/` separates mobile/desktop sizes.

### 3.3 Type rules

- **Hero copy never wraps to a 5th line.** Tighten wording until it
  fits 1–3 lines at all breakpoints.
- **Numerals are always tabular** inside cards, tables, comparison
  rows. Use `tabular-nums` Tailwind utility.
- **Chinese commas are full-width (`，` not `,`)**, English uses
  half-width. Quotation marks: 「」 in Chinese, "" in English.
- **No italic Chinese text** ever — it doesn't render correctly and
  looks like a broken font. Use weight contrast instead.
- **Line length** stays in the 60–80 character range on desktop. Cap
  prose containers at ~680px (`max-w-prose`).

## 4. Layout & grid

- 12-column grid, 24px gutter, 1100px max width.
- Mobile single column with 20–24px padding on each side.
- **Asymmetric layouts preferred over centered.** A hero with image on
  the right and copy on the left, weighted 5:7, reads more editorial
  than a centered hero with a giant image below.
- **Section dividers**: 1px line, color `rgba(255,255,255,0.06)`,
  margin 96px above / 96px below. Never use horizontal `<hr>`.

## 5. Components

### 5.1 Buttons

Three variants — three is enough.

**Primary** (`bg-[#d4af37] text-[#0c0c0c]`)
- Gold fill, dark text. Used for the single main action per page.
- Padding 12 / 24, radius 8.
- Hover: bg → `#c9a431`, no scale change.
- Active: `scale(0.98)`, transition 80ms.
- Disabled: `opacity-50 cursor-not-allowed`, never grey-shifted.

**Ghost** (`border border-white/12 text-[#ededed]`)
- Used for secondary actions ("查看全部 →", "返回").
- Hover: `border-white/24`, no fill change. No scale.

**Text-only** (`text-[#d4af37]`)
- Inline link style. Underline on hover, `underline-offset-4`.
- Never wrapped in a button-like container.

**Forbidden**: gradient buttons, "glow" hover, shadow on idle state,
border with internal padding ring, all-uppercase labels on Chinese.

### 5.2 Cards (listing card archetype)

```
border: 1px solid rgba(255,255,255,0.06)
background: linear-gradient(180deg, #131313 0%, #0f0f0f 100%)
radius: 16
padding: image 0 / body 20
shadow: NONE on idle
hover: border-color → rgba(212,175,55,0.35), translateY(-2px) 200ms ease-out
image aspect: 4:3 (landscape) — never square
image treatment: object-cover, never object-contain inside cards
```

Important: cards do NOT use scale-up-on-hover. That trick is everywhere
on shadcn templates and feels cheap. We use a 2px lift and a
border-color shift instead — subtle, expensive-looking.

### 5.3 Forms

- Input height: 44px (touch target).
- Background `#1a1a1a`, border `1px solid #2a2a2a`.
- Focus: border `#d4af37`, no outer ring shadow.
- Labels above the input, weight 500, size caption, color
  `--fg-secondary`. Inline labels (next-to-input) are banned.
- Error state: red `#f87171` border + helper text below in same red,
  italic Latin script (Chinese stays non-italic).
- Required marker: `*` in gold, never red.

### 5.4 Navigation

- Sticky on scroll, height 64px → compacts to 56px after 24px scroll.
- Background transitions from transparent → `rgba(12,12,12,0.78)` +
  `backdrop-filter: blur(12px)` once scrolled.
- Active route gets a 1px gold underline 4px below text, no fill.
- Mobile menu: full-screen overlay (not a hamburger drawer). Animate
  in `200ms ease-out`. Close button top-right, never bottom.

### 5.5 Maps

- Use CartoDB Dark tiles (already configured) — match the site palette.
- Pin: gold circle 12px with a thin gold ring on hover. Never the
  default Leaflet teardrop.
- POI emoji markers (subway / supermarket) sit inside a 32px disc, dark
  background `rgba(12,12,12,0.78)`, 1px white/10 border. Emoji weight
  stays neutral — do not enlarge for "fun".
- Route lines: solid `#d4af37`, 3px, no dash on roads. Dashed only for
  "approximate walking" overlays.

## 6. Motion

### 6.1 Timing & easing

```
fast    : 120ms  cubic-bezier(0.4, 0, 0.2, 1)   (instant feedback — tap states)
base    : 200ms  cubic-bezier(0.22, 1, 0.36, 1) (hover, color, opacity)
slow    : 320ms  cubic-bezier(0.22, 1, 0.36, 1) (page transitions, modal in)
emphasis: 480ms  cubic-bezier(0.16, 1, 0.3, 1)  (hero reveal — once per page)
```

Standard easing curve site-wide: **`cubic-bezier(0.22, 1, 0.36, 1)`**
(custom ease-out). Never use plain `ease`, `ease-in`, or framer's default
spring.

### 6.2 Patterns

- **Page enter**: stagger sections 80ms apart, each fading + 12px
  translate-up. Use IntersectionObserver, not pure mount.
- **Hover scale**: `scale(1.01)` max for images, `scale(0.98)` for tap.
  No `scale(1.05)` or higher — every "wow" hover at small scale screams
  AI default.
- **Carousel / gallery**: slide-in from 24px, opacity 0 → 1,
  duration 280ms. No spring overshoot.
- **Loaders**: never spinners. Use a 1px gold progress bar at the top of
  the viewport for navigation, a 24px circular indicator only for
  long-running background tasks.

### 6.3 Banned animations

- Bounce (`ease-out-back` with overshoot)
- Wiggle / shake / hop
- Rainbow gradient sweeps
- Border-glow pulses
- Anything that loops forever besides the discrete map pin pulse

## 7. Photography & imagery

- **Listing photos**: minimum 1920×1080, always 16:10 or 16:9.
  Auto-crop landscape, never letterbox. Never apply filters.
- **Avoid stock photography** entirely. If we need an editorial image
  for a section header, use a screenshot of Vienna we own or skip the
  image and lean on typography.
- **Logo treatment**: leave the WeChat / 小红书 logos at their official
  colors, isolated on the dark surface with `opacity: 0.6` and `:hover`
  back to `1`. Don't desaturate.

## 8. Iconography

- **Lucide React** is the single icon library. No mixed icon sets.
- Stroke 1.5 by default (Lucide default is 2 — too heavy at small
  sizes), 1.75 on hero icons.
- Icons inherit current text color. NEVER hard-code icon color except
  for the gold accent.
- Icon + text gap is always **8px**, never 4 or 12.
- A button can have either an icon OR a chevron, never both flanking.

## 9. Accessibility minimums

- All interactive elements have a visible focus ring: `2px` solid
  `#d4af37`, `outline-offset: 2px`. Don't `outline: none` without
  replacement.
- Color contrast: every text-on-background combination passes
  WCAG AA (4.5:1 minimum for normal text). Spot check: light gray
  `#a0a0a0` on `#0c0c0c` is 7.9:1 ✓.
- Tap targets: 44×44 minimum (especially form fields and map pins).
- Reduced motion: honor `prefers-reduced-motion`. All non-essential
  motion disabled when set.
- Form errors announced to screen readers via `aria-live="polite"`.

## 10. Voice & microcopy

- **Buttons say what they do.** `查看房源`, `提交咨询`, `联系我们`.
  Never `点这里`, `了解更多`, `更多 →`.
- **Empty states** acknowledge: `还没有合适的房源` not `暂无数据`.
- **Confirmations** are quiet: a small gold check icon + one line of
  copy. No "🎉 太好啦！" enthusiasm.
- **Numbers** always with thousand separators (`€499,000`, never
  `€499000`). EUR symbol leads, space optional.
- **No "我们" overload.** Replace "我们提供专业的中文服务" with "中文
  接洽，从看房到过户" — concrete > self-referential.

## 11. What "done" looks like

For any component, ask:
1. Could this same component appear on a Y Combinator demo-day site? If
   yes → not refined enough.
2. Is every animation < 320ms (except hero reveal)? If no → trim.
3. Are there more than 3 gold pixels above the fold? If yes → demote
   one.
4. Does the heading wrap to 4+ lines on mobile? If yes → tighten copy.
5. If you removed the most decorative element, would the page lose
   meaning? If no → remove it.

When in doubt, **remove**.
