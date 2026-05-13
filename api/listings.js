import { XMLParser } from 'fast-xml-parser'

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300')

  const user = process.env.JUSTIMMO_USER
  const pass = process.env.JUSTIMMO_PASS

  if (!user || !pass) {
    return res.status(500).json({ error: 'Missing credentials' })
  }

  const auth = Buffer.from(`${user}:${pass}`).toString('base64')

  try {
    const response = await fetch(
      'https://api.justimmo.at/rest/v1/objekt/list?limit=50',
      { headers: { Authorization: `Basic ${auth}` } }
    )

    if (!response.ok) {
      const errText = await response.text()
      return res.status(response.status).json({ error: 'Justimmo API error', detail: errText })
    }

    const xml = await response.text()
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      parseTagValue: true,
      trimValues: true,
    })
    const data = parser.parse(xml)

    const immobilieRaw = data?.justimmo?.immobilie
    const arr = Array.isArray(immobilieRaw) ? immobilieRaw : immobilieRaw ? [immobilieRaw] : []

    const listings = arr.map(item => {
      const kat = item.objektkategorie || {}
      const geo = item.geo || {}
      const preise = item.preise || {}
      const flaechen = item.flaechen || {}
      const anhaenge = item.anhaenge?.anhang
      const anhangArr = Array.isArray(anhaenge) ? anhaenge : anhaenge ? [anhaenge] : []
      const bilder = anhangArr
        .filter(a => a?.gruppe === 'BILD' || a?.['@_gruppe'] === 'BILD' || a?.daten?.pfad)
        .map(a => a?.daten?.pfad || a?.pfad)
        .filter(Boolean)

      const forRent = kat?.vermarktungsart?.['@_MIETE_PACHT'] === '1'
      const price = forRent
        ? Number(preise?.nettokaltmiete || preise?.kaltmiete || 0)
        : Number(preise?.kaufpreis || 0)

      return {
        id: String(item.id || item.objektnummer || ''),
        objektnummer: String(item.objektnummer || ''),
        title: String(item.titel || '').trim(),
        teaser: String(item.dreizeiler || '').trim(),
        description: String(item.objektbeschreibung || '').trim(),
        type: kat?.objektart ? Object.keys(kat.objektart)[0] : '',
        forRent,
        price,
        rooms: Number(flaechen?.anzahl_zimmer || 0),
        sqm: Number(flaechen?.wohnflaeche || flaechen?.nutzflaeche || 0),
        plotSqm: Number(flaechen?.grundflaeche || 0),
        address: {
          street: String(geo?.strasse || '') + (geo?.hausnummer ? ' ' + geo.hausnummer : ''),
          plz: String(geo?.plz || ''),
          city: String(geo?.ort || ''),
          country: String(geo?.land?.['@_iso_3166-1'] || geo?.land || 'AT'),
        },
        images: bilder,
        coverImage: bilder[0] || null,
      }
    })

    res.status(200).json({ count: listings.length, listings })
  } catch (err) {
    res.status(500).json({ error: String(err), stack: err?.stack })
  }
}
