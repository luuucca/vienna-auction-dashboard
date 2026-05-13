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

function pickField(obj, name) {
  const fields = obj?.user_defined_simplefield
  const arr = Array.isArray(fields) ? fields : fields ? [fields] : []
  const found = arr.find(f => f?.['@_feldname'] === name)
  if (!found) return null
  return typeof found === 'object' ? found['#text'] ?? null : found
}

function extractImages(item) {
  const anhaenge = item?.anhaenge?.anhang
  const arr = Array.isArray(anhaenge) ? anhaenge : anhaenge ? [anhaenge] : []
  return arr
    .filter(a => {
      const gruppe = a?.gruppe
      const path = a?.daten?.pfad
      if (!path) return false
      if (!gruppe) return true
      const g = String(gruppe).toUpperCase()
      return g === 'BILD' || g === 'TITELBILD' || g.startsWith('BILD')
    })
    .map(a => String(a.daten.pfad))
}

function getPrice(preise, forRent) {
  if (forRent) {
    const v = preise?.nettokaltmiete || preise?.kaltmiete || preise?.warmmiete
    if (v && typeof v === 'object') return Number(v['#text'] || 0)
    return Number(v || 0)
  }
  const v = preise?.kaufpreis
  if (v && typeof v === 'object') return Number(v['#text'] || 0)
  return Number(v || 0)
}

function priceOnRequest(preise) {
  const v = preise?.kaufpreis
  if (v && typeof v === 'object' && v['@_auf_anfrage'] == 1) return true
  return false
}

function parseLage(lageText) {
  const text = String(lageText || '').replace(/&#13;/g, '').trim()
  const lines = text.split(/\n+/).map(l => l.trim()).filter(Boolean)
  if (lines.length >= 2) return { plzCity: lines[0], street: lines[1] }
  if (lines.length === 1) return { plzCity: lines[0], street: '' }
  return { plzCity: '', street: '' }
}

function normalize(item) {
  const kat = item.objektkategorie || {}
  const geo = item.geo || {}
  const preise = item.preise || {}
  const flaechen = item.flaechen || {}
  const kontakt = item.kontaktperson || {}
  const freitexte = item.freitexte || {}
  const verwaltung = item.verwaltung_techn || {}
  const zustand = item.zustand_angaben || {}
  const images = extractImages(item)

  const vermarkt = kat?.vermarktungsart || {}
  const forRent = vermarkt?.['@_MIETE_PACHT'] == 1
  const price = getPrice(preise, forRent)
  const onRequest = priceOnRequest(preise)

  const objektartObj = kat?.objektart || {}
  const typeKey = Object.keys(objektartObj).find(k => !k.startsWith('@_')) || ''
  const typeName = pickField(kat, 'objektart_name') || typeKey

  const lat = Number(pickField(geo, 'geokoordinaten_breitengrad_exakt') || pickField(geo, 'geokoordinaten_breitengrad') || 0)
  const lng = Number(pickField(geo, 'geokoordinaten_laengengrad_exakt') || pickField(geo, 'geokoordinaten_laengengrad') || 0)
  const bezirk = pickField(geo, 'politischer_bezirk') || ''

  const { plzCity, street } = parseLage(freitexte?.lage)

  return {
    id: String(verwaltung?.objektnr_intern || item.id || ''),
    objektnummer: String(verwaltung?.objektnr_extern || ''),
    title: String(freitexte?.objekttitel || '').trim(),
    teaser: String(freitexte?.dreizeiler || '').trim(),
    type: typeKey,
    typeName: String(typeName),
    forRent,
    price,
    priceOnRequest: onRequest,
    currency: String(preise?.waehrung?.['@_iso_waehrung'] || 'EUR'),
    rooms: Number(flaechen?.anzahl_zimmer || pickField(flaechen, 'anzahl_zimmer') || 0),
    bedrooms: Number(flaechen?.anzahl_schlafzimmer || 0),
    bathrooms: Number(flaechen?.anzahl_badezimmer || 0),
    sqm: Number(flaechen?.wohnflaeche || flaechen?.nutzflaeche || 0),
    plotSqm: Number(flaechen?.grundflaeche || 0),
    balconyTerraceSqm: Number(flaechen?.balkon_terrasse_flaeche || 0),
    floors: Number(geo?.anzahl_etagen || 0),
    buildYear: Number(zustand?.baujahr || 0),
    address: {
      street,
      plz: String(geo?.plz || ''),
      city: String(geo?.ort || ''),
      district: String(bezirk),
      state: String(geo?.bundesland || ''),
      raw: String(freitexte?.lage || '').replace(/&#13;/g, '').trim(),
    },
    location: { lat, lng },
    images,
    coverImage: images[0] || null,
    imageCount: images.length,
    description: String(freitexte?.objektbeschreibung || '').trim(),
    locationText: String(freitexte?.lage || '').trim(),
    featuresText: String(freitexte?.ausstatt_beschr || '').trim(),
    contact: {
      name: [kontakt?.titel, kontakt?.vorname, kontakt?.name].filter(Boolean).join(' ').trim(),
      email: String(kontakt?.email_direkt || ''),
      phone: String(kontakt?.tel_zentrale || kontakt?.tel_durchwahl || ''),
      company: String(kontakt?.firma || ''),
    },
  }
}

async function fetchDetail(id, auth) {
  const r = await fetch(`https://api.justimmo.at/rest/v1/objekt/detail?objekt_id=${id}`, {
    headers: { Authorization: auth },
  })
  if (!r.ok) return null
  const xml = await r.text()
  const data = parser.parse(xml)
  const item = data?.justimmo?.immobilie
  if (!item) return null
  return normalize({ ...item, id })
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600')

  const auth = basicAuth()
  if (!auth) return res.status(500).json({ error: 'Missing credentials' })

  // Single listing detail mode: /api/listings?id=XXX
  const id = req.query?.id
  if (id) {
    const detail = await fetchDetail(id, auth)
    if (!detail) return res.status(404).json({ error: 'Not found' })
    return res.status(200).json(detail)
  }

  try {
    const listRes = await fetch('https://api.justimmo.at/rest/v1/objekt/list?limit=50', {
      headers: { Authorization: auth },
    })
    if (!listRes.ok) {
      const t = await listRes.text()
      return res.status(listRes.status).json({ error: 'Justimmo list error', detail: t })
    }
    const listXml = await listRes.text()
    const listData = parser.parse(listXml)
    const raw = listData?.justimmo?.immobilie
    const arr = Array.isArray(raw) ? raw : raw ? [raw] : []
    const ids = arr.map(i => String(i.id || '')).filter(Boolean)

    const details = await Promise.all(ids.map(id => fetchDetail(id, auth).catch(() => null)))
    const listings = details.filter(Boolean)

    res.status(200).json({ count: listings.length, listings })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
}
