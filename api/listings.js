import { XMLParser } from 'fast-xml-parser'

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  parseTagValue: true,
  trimValues: true,
})

function basicAuth() {
  const user = process.env.JUSTIMMO_USER
  const pass = process.env.JUSTIMMO_PASS
  if (!user || !pass) return null
  return 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64')
}

function extractImages(item) {
  const anhaenge = item?.anhaenge?.anhang
  const arr = Array.isArray(anhaenge) ? anhaenge : anhaenge ? [anhaenge] : []
  return arr
    .map(a => a?.daten?.pfad || a?.pfad)
    .filter(Boolean)
    .map(String)
}

function normalize(item) {
  const kat = item.objektkategorie || {}
  const geo = item.geo || {}
  const preise = item.preise || {}
  const flaechen = item.flaechen || {}
  const kontakt = item.kontaktperson || {}
  const images = extractImages(item)

  const forRent = kat?.vermarktungsart?.['@_MIETE_PACHT'] === '1' || kat?.vermarktungsart?.['@_MIETE_PACHT'] === 1
  const price = forRent
    ? Number(preise?.nettokaltmiete || preise?.kaltmiete || 0)
    : Number(preise?.kaufpreis || 0)
  const objektartKey = kat?.objektart ? Object.keys(kat.objektart)[0] : ''

  return {
    id: String(item.id || item.objektnummer || ''),
    objektnummer: String(item.objektnummer || ''),
    title: String(item.titel || '').trim(),
    teaser: String(item.dreizeiler || '').trim(),
    type: objektartKey,
    forRent,
    price,
    rooms: Number(flaechen?.anzahl_zimmer || 0),
    sqm: Number(flaechen?.wohnflaeche || flaechen?.nutzflaeche || 0),
    plotSqm: Number(flaechen?.grundflaeche || 0),
    address: {
      street: String(geo?.strasse || '') + (geo?.hausnummer ? ' ' + geo.hausnummer : ''),
      plz: String(geo?.plz || ''),
      city: String(geo?.ort || ''),
    },
    coverImage: images[0] || null,
    imageCount: images.length,
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300')

  const auth = basicAuth()
  if (!auth) return res.status(500).json({ error: 'Missing credentials' })

  try {
    const r = await fetch('https://api.justimmo.at/rest/v1/objekt/list?limit=50', {
      headers: { Authorization: auth },
    })
    if (!r.ok) {
      const t = await r.text()
      return res.status(r.status).json({ error: 'Justimmo error', detail: t })
    }
    const xml = await r.text()
    const data = parser.parse(xml)
    const raw = data?.justimmo?.immobilie
    const arr = Array.isArray(raw) ? raw : raw ? [raw] : []
    const listings = arr.map(normalize)
    res.status(200).json({ count: listings.length, listings })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
}
