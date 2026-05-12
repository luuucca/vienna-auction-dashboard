#!/usr/bin/env python3
"""
update-auctions.py
==================
从奥地利司法公告网站 Ediktsdatei 抓取维也纳法拍房数据，增量更新 auctions.json。

官方搜索页面：
  https://edikte.justiz.gv.at/edikte/ex/exedi3.nsf/suche!OpenForm&subf=

使用方式：
  pip install playwright beautifulsoup4
  playwright install chromium
  python scripts/update-auctions.py

⚠️  合规提醒（正式上线前必读）：
  1. 请先阅读 Ediktsdatei 的使用条款（Nutzungsbedingungen）和数据保护政策。
  2. 严禁高频请求（建议每次抓取间隔 ≥ 10 秒，每日最多运行一次）。
  3. 本脚本仅供法律合规的尽调研究使用，不得用于商业爬取或转卖数据。
  4. 如有疑问，建议联系 Bundesministerium für Justiz 确认 API 或数据许可条款。
"""

import json
import re
import time
import hashlib
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional

# 依赖：pip install playwright beautifulsoup4
try:
    from playwright.sync_api import sync_playwright, Page
    from bs4 import BeautifulSoup
except ImportError:
    raise SystemExit(
        "缺少依赖，请运行：pip install playwright beautifulsoup4 && playwright install chromium"
    )

# ── 配置 ──────────────────────────────────────────────────────────────────────

BASE_URL = "https://edikte.justiz.gv.at/edikte/ex/exedi3.nsf/suche!OpenForm&subf="
OUTPUT_PATH = Path(__file__).parent.parent / "public" / "data" / "auctions.json"

# Ediktsdatei 网站上 Bundesland Wien 对应的下拉值（需在浏览器中实际确认）
BUNDESLAND_WIEN_VALUE = "Wien"

# 抓取"自发布日期"（默认：90天前，可通过命令行参数覆盖）
DAYS_BACK = 90

# 请求间隔（秒）
REQUEST_DELAY = 10.0

# ── 地址解析工具（正式上线时替换为 Stadt Wien OGD AddressService）────────────

def geocode_address_official(address: str) -> tuple[Optional[float], Optional[float]]:
    """
    正式上线时使用此函数通过 Stadt Wien OGD AddressService 获取精确坐标。

    API 文档：https://data.wien.gv.at/
    示例请求：
      GET https://data.wien.gv.at/ogdwien/rest/ogdaddress?ADDRESS=Villenweg+46&SRSNAME=EPSG:4326
    响应格式：GeoJSON FeatureCollection
    坐标提取：features[0].geometry.coordinates → [lng, lat]

    当前为 stub，返回 None 以触发区级近似坐标回退。
    """
    # TODO: 替换为真实 HTTP 请求
    # import urllib.request
    # enc = urllib.parse.quote(address)
    # url = f"https://data.wien.gv.at/ogdwien/rest/ogdaddress?ADDRESS={enc}&SRSNAME=EPSG:4326"
    # with urllib.request.urlopen(url) as r:
    #     data = json.loads(r.read())
    # if data.get("features"):
    #     lng, lat = data["features"][0]["geometry"]["coordinates"]
    #     return lat, lng
    return None, None


# 区级中心点近似坐标（仅用于 geocodeSource='approximate' 的演示回退）
DISTRICT_COORDS: dict[str, tuple[float, float]] = {
    "1010": (48.2082, 16.3738),
    "1020": (48.2192, 16.3917),
    "1030": (48.1985, 16.3924),
    "1040": (48.1940, 16.3714),
    "1050": (48.1930, 16.3580),
    "1060": (48.1980, 16.3512),
    "1070": (48.2022, 16.3528),
    "1080": (48.2110, 16.3490),
    "1090": (48.2221, 16.3603),
    "1100": (48.1740, 16.3858),
    "1110": (48.1756, 16.4208),
    "1120": (48.1835, 16.3285),
    "1130": (48.1875, 16.3052),
    "1140": (48.1983, 16.2940),
    "1150": (48.1984, 16.3295),
    "1160": (48.2120, 16.3201),
    "1170": (48.2245, 16.3120),
    "1180": (48.2298, 16.3412),
    "1190": (48.2524, 16.3548),
    "1200": (48.2330, 16.3790),
    "1210": (48.2630, 16.3951),
    "1220": (48.2251, 16.4408),
    "1230": (48.1505, 16.3189),
}


def get_coords(address: str, district: str) -> tuple[float, float, str]:
    """
    坐标获取策略（三级回退）：
    1. 官方地址服务（精确）
    2. 区级中心点近似坐标
    3. 维也纳市中心坐标
    """
    lat, lng = geocode_address_official(address)
    if lat is not None and lng is not None:
        return lat, lng, "official"

    # 区级近似回退
    fallback = DISTRICT_COORDS.get(district)
    if fallback:
        return fallback[0], fallback[1], "approximate"

    return 48.2082, 16.3738, "approximate"


# ── 数据抓取 ─────────────────────────────────────────────────────────────────

def parse_district(address: str) -> str:
    """从奥地利地址提取邮政编码（如 1190）。"""
    m = re.search(r"\b(1[0-2]\d0)\b", address)
    return m.group(1) if m else ""


def parse_currency(text: str) -> Optional[float]:
    """将 '1.234.567,89 EUR' 等格式解析为浮点数。"""
    cleaned = re.sub(r"[^\d,.]", "", text.replace(".", "").replace(",", "."))
    try:
        return float(cleaned)
    except ValueError:
        return None


def make_id(case_number: str, address: str) -> str:
    """根据案号+地址生成稳定唯一 ID。"""
    raw = f"{case_number}::{address}".lower().strip()
    return "wien-" + hashlib.md5(raw.encode()).hexdigest()[:12]


def scrape_wien_auctions(page: Page, since_date: str) -> list[dict]:
    """
    在 Ediktsdatei 搜索页面选择 Wien + 指定日期，抓取搜索结果。

    ⚠️  注意：Ediktsdatei 使用旧式 Notes/Domino 表单，页面结构可能随时变更。
        如遇到抓取失败，请先手动打开浏览器检查当前表单字段名称。
    """
    print(f"[scrape] 打开搜索页面：{BASE_URL}")
    page.goto(BASE_URL, wait_until="networkidle", timeout=30_000)
    time.sleep(2)

    # ── 填写搜索表单 ──────────────────────────────────────────────────────────
    # 注意：以下字段名为根据历史快照推断，正式使用前需在浏览器检查器中确认

    # 选择 Bundesland = Wien
    try:
        page.select_option('select[name="Bundesland"]', label=BUNDESLAND_WIEN_VALUE)
    except Exception:
        print("[warn] 未找到 Bundesland 下拉框，跳过")

    # 设置发布日期
    try:
        page.fill('input[name="Datum"]', since_date)
    except Exception:
        print("[warn] 未找到日期字段")

    # 只搜索 Liegenschaften（不动产）
    try:
        page.select_option('select[name="Kategorie"]', label="Liegenschaft")
    except Exception:
        print("[warn] 未找到 Kategorie 下拉框")

    time.sleep(REQUEST_DELAY)

    # 提交
    page.click('input[type="submit"]')
    page.wait_for_load_state("networkidle", timeout=30_000)
    time.sleep(2)

    # ── 解析搜索结果 ──────────────────────────────────────────────────────────
    html = page.content()
    soup = BeautifulSoup(html, "html.parser")

    results: list[dict] = []

    # Domino 搜索结果通常是一个表格
    table = soup.find("table", class_="result") or soup.find("table")
    if not table:
        print("[warn] 未找到结果表格，页面可能已变更结构")
        return results

    rows = table.find_all("tr")[1:]  # 跳过表头
    print(f"[scrape] 找到 {len(rows)} 条结果行")

    for row in rows:
        cells = row.find_all("td")
        if len(cells) < 4:
            continue

        try:
            # 字段位置需根据实际表格列顺序调整
            case_number = cells[0].get_text(strip=True)
            address = cells[1].get_text(strip=True)
            title = cells[2].get_text(strip=True)
            category_raw = cells[3].get_text(strip=True)
            estimated_raw = cells[4].get_text(strip=True) if len(cells) > 4 else ""
            bid_raw = cells[5].get_text(strip=True) if len(cells) > 5 else ""
            deposit_raw = cells[6].get_text(strip=True) if len(cells) > 6 else ""
            date_raw = cells[7].get_text(strip=True) if len(cells) > 7 else ""

            # 详情页链接
            link_tag = cells[0].find("a") or row.find("a")
            detail_url = ""
            if link_tag and link_tag.get("href"):
                href = link_tag["href"]
                detail_url = href if href.startswith("http") else "https://edikte.justiz.gv.at" + href

            district = parse_district(address)
            estimated = parse_currency(estimated_raw) or 0.0
            min_bid = parse_currency(bid_raw) or 0.0
            deposit = parse_currency(deposit_raw) or 0.0

            lat, lng, geo_source = get_coords(address, district)

            record: dict = {
                "id": make_id(case_number, address),
                "caseNumber": case_number,
                "auctionDate": date_raw,  # TODO: 转换为 YYYY-MM-DD
                "address": address,
                "district": district,
                "title": title,
                "category": category_raw,
                "estimatedValue": estimated,
                "minimumBid": min_bid,
                "area": 0.0,        # 需从详情页抓取
                "pricePerSqm": 0.0,  # 需从详情页计算
                "deposit": deposit,
                "latitude": lat,
                "longitude": lng,
                "geocodeSource": geo_source,
                "ownershipType": "",
                "summary": "",
                "riskTags": [],
                "detailUrl": detail_url,
                "pdfUrl": "",
                "shortReportUrl": "",
            }
            results.append(record)

        except Exception as e:
            print(f"[warn] 解析行失败：{e}")
            continue

    return results


# ── 增量更新逻辑 ─────────────────────────────────────────────────────────────

def load_existing() -> list[dict]:
    if OUTPUT_PATH.exists():
        with open(OUTPUT_PATH, encoding="utf-8") as f:
            return json.load(f)
    return []


def upsert(existing: list[dict], new_records: list[dict]) -> tuple[list[dict], int, int]:
    """
    增量合并：
    - 匹配键：caseNumber + address（大小写不敏感）
    - 已存在：更新可变字段（estimatedValue, minimumBid, auctionDate 等）
    - 不存在：新增
    返回 (merged, updated_count, added_count)
    """
    index = {
        (r["caseNumber"].lower(), r["address"].lower()): i
        for i, r in enumerate(existing)
    }
    updated, added = 0, 0
    merged = list(existing)

    for rec in new_records:
        key = (rec["caseNumber"].lower(), rec["address"].lower())
        if key in index:
            i = index[key]
            # 保留人工填写的字段，只更新抓取字段
            for field in ("estimatedValue", "minimumBid", "deposit", "auctionDate", "detailUrl"):
                if rec[field]:
                    merged[i][field] = rec[field]
            updated += 1
        else:
            merged.append(rec)
            index[key] = len(merged) - 1
            added += 1

    return merged, updated, added


def save(data: list[dict]) -> None:
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"[save] 已写入 {OUTPUT_PATH} ({len(data)} 条记录)")


# ── 入口 ──────────────────────────────────────────────────────────────────────

def main() -> None:
    since = (datetime.now() - timedelta(days=DAYS_BACK)).strftime("%d.%m.%Y")
    print(f"[main] 抓取范围：自 {since} 起，Bundesland = Wien")
    print("[main] ⚠️  遵守 Ediktsdatei 使用条款，每日最多运行一次")

    existing = load_existing()
    print(f"[main] 已有记录：{len(existing)} 条")

    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        page = browser.new_page(
            user_agent=(
                "Mozilla/5.0 (compatible; ViennaAuctionBot/1.0; "
                "+https://github.com/your-org/vienna-auction-dashboard)"
            )
        )
        try:
            new_records = scrape_wien_auctions(page, since)
        finally:
            browser.close()

    print(f"[main] 抓取到 {len(new_records)} 条新数据")

    merged, updated, added = upsert(existing, new_records)
    print(f"[main] 更新：{updated} 条，新增：{added} 条，总计：{len(merged)} 条")

    save(merged)


if __name__ == "__main__":
    main()
