const NOTION_API = 'https://api.notion.com/v1'
const NOTION_VERSION = '2022-06-28'

function notionHeaders() {
  return {
    Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json',
  }
}

function getText(prop) {
  if (!prop) return ''
  if (prop.title) return prop.title.map(t => t.plain_text).join('')
  if (prop.rich_text) return prop.rich_text.map(t => t.plain_text).join('')
  return ''
}
function getNumber(prop) {
  if (!prop) return 0
  return Number(prop.number || 0)
}
function getSelect(prop) {
  return prop?.select?.name || ''
}
function getCheckbox(prop) {
  return !!prop?.checkbox
}
function getFiles(prop) {
  if (!prop?.files) return []
  return prop.files.map(f => f.file?.url || f.external?.url).filter(Boolean)
}

function normalize(page) {
  const p = page.properties || {}
  const photos = getFiles(p.Photos)
  return {
    id: page.id,
    title: getText(p['名称']) || getText(p.Name) || '未命名房源',
    status: getSelect(p.Status) || 'Active',
    type: getSelect(p.Type) || 'Apartment',
    typeName: getSelect(p.Type) || 'Apartment',
    mode: getSelect(p.Mode) || 'Sale',
    forRent: getSelect(p.Mode) === 'Rent',
    price: getNumber(p.Price),
    priceOnRequest: getNumber(p.Price) === 0,
    currency: 'EUR',
    district: getNumber(p.District),
    districtName: getText(p.DistrictName),
    street: getText(p.Street),
    plz: getText(p.PLZ),
    sqm: getNumber(p.Sqm),
    rooms: getNumber(p.Rooms),
    buildYear: getNumber(p.BuildYear),
    location: {
      lat: getNumber(p.Lat),
      lng: getNumber(p.Lng),
    },
    description: getText(p.Description),
    photos,
    coverImage: photos[0] || null,
    imageCount: photos.length,
    featured: getCheckbox(p.Featured),
    address: {
      street: getText(p.Street),
      plz: getText(p.PLZ),
      city: 'Wien',
      district: getNumber(p.District) ? `Wien ${getNumber(p.District)}., ${getText(p.DistrictName)}` : '',
      state: 'Wien',
      raw: '',
    },
    // Compatibility with old fields
    images: photos,
    objektnummer: '',
    teaser: '',
    plotSqm: 0,
    balconyTerraceSqm: 0,
    bedrooms: 0,
    bathrooms: 0,
    floors: 0,
    locationText: '',
    featuresText: '',
    contact: {
      name: '奥匈置业研究所',
      email: 'L.ZHANG@VALERTO.IMMO',
      phone: '+43 670 5566666',
      company: 'Valerto GmbH',
    },
  }
}

async function fetchNotionDatabase() {
  const dbId = process.env.NOTION_DATABASE_ID
  if (!dbId) throw new Error('Missing NOTION_DATABASE_ID')
  const r = await fetch(`${NOTION_API}/databases/${dbId}/query`, {
    method: 'POST',
    headers: notionHeaders(),
    body: JSON.stringify({
      filter: {
        property: 'Status',
        select: { does_not_equal: 'Draft' },
      },
      page_size: 100,
    }),
  })
  if (!r.ok) {
    const t = await r.text()
    throw new Error(`Notion query error ${r.status}: ${t}`)
  }
  return r.json()
}

async function fetchNotionPage(id) {
  const r = await fetch(`${NOTION_API}/pages/${id}`, { headers: notionHeaders() })
  if (!r.ok) return null
  return r.json()
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=120')

  if (!process.env.NOTION_TOKEN || !process.env.NOTION_DATABASE_ID) {
    return res.status(500).json({ error: 'Missing Notion credentials' })
  }

  const id = req.query?.id
  if (id) {
    const page = await fetchNotionPage(id)
    if (!page) return res.status(404).json({ error: 'Not found' })
    return res.status(200).json(normalize(page))
  }

  try {
    const data = await fetchNotionDatabase()
    const listings = (data.results || []).map(normalize)
    res.status(200).json({ count: listings.length, listings })
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) })
  }
}
