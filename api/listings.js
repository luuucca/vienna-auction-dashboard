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

function pickUserField(geo, name) {
  const fields = geo?.user_defined_simplefield
  const arr = Array.isArray(fields) ? fields : fields ? [fields] : []
  const found = arr.find(f => f?.['@_feldname'] === name)
  return found?.['#text'] ?? (typeof found === 'object' ? null : found)
}

function extractImages(item) {
  const anhaenge = item?.anhaenge?.anhang
  const arr = Array.isArray(anhaenge) ? anhaenge : anhaenge ? [anhaenge] : []
  return arr
    .map(a => {
      const path = a?.daten?.pfad || a?.pfad
      const group = a?.gruppe || a?.['@_gruppe']
      return path && (!group || String(group).toUpperCase().includes('BILD')) ? String(path) : null
    })
    .filter(Boolean)
}

function normalize(item) {
  const kat = item.objektkategorie || {}
  const geo = item.geo || {}
  const preise = item.preise || {}
  const flaechen = item.flaechen || {}
  const kontakt = item.kontaktperson || {}
  const freitexte = item.freitexte || {}
  const images = extractImages(item)

  const vermarkt = kat?.vermarktungsart || {}
  const forRent = vermarkt?.['@_MIETE_PACHT'] == 1
  const price = forRent
    ? Number(preise?.nettokaltmiete || preise?.kaltmiete || preise?.warmmiete || 0)
    : Number(preise?.kaufpreis || 0)

  const objektartObj = kat?.objektart || {}
  const typeKey = Object.keys(objektartObj).find(k => !k.startsWith('@_')) || ''

  const lat = Number(pickUserField(geo, 'geokoordinaten_breitengrad_exakt') || pickUserField(geo, 'geokoordinaten_breitengrad') || 0)
  const lng = Number(pickUserField(geo, 'geokoordinaten_laengengrad_exakt') || pickUserField(geo, 'geokoordinaten_laengengrad') || 0)
  const bezirk = pickUserField(geo, 'politischer_bezirk') || ''

  return {
    id: String(item.id || ''),
    objektnummer: String(item.objektnummer || ''),
    title: String(item.titel || '').trim(),
    teaser: String(item.dreizeiler || '').trim(),
    type: typeKey,
    typeName: pickUserField(kat, 'objektart_name') || '',
    forRent,
    price,
    currency: String(preise?.['@_waehrung'] || 'EUR'),
    rooms: Number(flaechen?.anzahl_zimmer || 0),
    bedrooms: Number(flaechen?.anzahl_schlafzimmer || 0),
    bathrooms: Number(flaechen?.anzahl_badezimmer || 0),
    sqm: Number(flaechen?.wohnflaeche || flaechen?.nutzflaeche || 0),
    plotSqm: Number(flaechen?.grundflaeche || 0),
    floors: Number(geo?.anzahl_etagen || 0),
    address: {
      street: String(geo?.strasse || ''),
      houseNumber: String(geo?.hausnummer || ''),
      plz: String(geo?.plz || ''),
      city: String(geo?.ort || ''),
      district: String(bezirk),
      state: String(geo?.bundesland || ''),
    },
    location: { lat, lng },
    images,
    coverImage: images[0] || null,
    description: String(freitexte?.objektbeschreibung || item?.objektbeschreibung || '').trim(),
    locationText: String(freitexte?.lage || item?.lage || '').trim(),
    contact: {
      name: [kontakt?.vorname, kontakt?.nachname].filter(Boolean).join(' ').trim(),
      email: String(kontakt?.email_direkt || kontakt?.email_zentrale || ''),
      phone: String(kontakt?.tel_durchwahl || kontakt?.tel_zentrale || kontakt?.tel_handy || ''),
    },
  }
}

async function fetchListingDetail(id, auth) {
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

    const details = await Promise.all(ids.map(id => fetchListingDetail(id, auth).catch(() => null)))
    const listings = details.filter(Boolean)

    res.status(200).json({ count: listings.length, listings })
  } catch (err) {
    res.status(500).json({ error: String(err), stack: err?.stack })
  }
}
