# Project: vienna-auction-dashboard

- **Live URL: https://aoxiong.at** (also `www.aoxiong.at`)
- **Site name**: 奥匈置业研究所
- GitHub: `luuucca/vienna-auction-dashboard`

Vienna real estate website for Chinese clients. Dark theme + gold accent
(`#d4af37`) minimalist luxury aesthetic. The user is an Austrian-Chinese
real estate intermediary in Vienna.

## ⚠️ LANGUAGE RULE — NEVER VIOLATE

- **Always reply in Simplified Chinese (中文).**
- **NEVER use Korean (한국어 / Hangul).** If you draft any text and notice
  Hangul characters slipped in, rewrite the sentence in Chinese before
  sending. The user has flagged this multiple times.
- English technical terms (API, Vercel, etc.) inline are fine.
- German place names (Wien, Döbling, Belvedere) inline are fine.

## Tech stack

- React + Vite + Tailwind + Framer Motion + react-leaflet
- Notion as CMS (DB id `35f419f4-d42d-8009-8961-c86cdc5087bb`)
- Vercel serverless API (`api/listings.js`) → Notion REST
- Vercel Git auto-deploy on push to `main`
- OSM/Overpass + OSRM for maps & POIs

## Key behaviors

- The Notion integration is already authorized. Use the REST API
  directly (`https://api.notion.com/v1/`), no MCP/Connect flow needed.
- `api/listings.js` paginates the Notion query — don't break that.
- `Description` rich_text in Notion uses small-red-book style:
  emoji headers (📍 🏠 ✨ 🚇 💰), `**bold**`, `·` bullets, blank-line
  paragraphs. The API converts `\n\n`→`<p>`, `\n`→`<br>`, `**x**`→
  `<strong>x</strong>` for display.
- For new broker-site imports, follow `~/.claude/skills/import-listings/`.

## Style for replies

- Terse, action-first. Show diffs/commands, not preambles.
- Skip "great question!" fillers and "this might not be perfect"
  disclaimers.
- The user values speed.

## Already done (don't redo)

- ✅ Listings page with filters, sort, pagination (10/20/50/100 per page)
- ✅ Detail page hero gallery, description rendering, map with POIs
  (🚇 subway + 🛒 supermarket) and OSRM walking routes
- ✅ Auction page (`edikte.justiz.gv.at` search)
- ✅ ~114 active listings (Karl 74, yellowbird-immo, hand-entered)
- ✅ All descriptions translated to Chinese via DeepL Free API
- ✅ Notion API pagination fix (had been silently dropping >100)

## Tooling secrets

Stored in `~/.claude/projects/C--Users-ASUS/memory/user_profile.md`
(not in this repo — GitHub push-protection blocks tokens). Use:

- `process.env.NOTION_TOKEN`
- `process.env.NOTION_DATABASE_ID`
- `process.env.DEEPL_KEY`

For ad-hoc one-off scripts in `scripts/`, the user is OK with reading
the values from the memory file at runtime, but **never commit them**.
