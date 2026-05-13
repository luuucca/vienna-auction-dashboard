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

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')

  const auth = basicAuth()
  if (!auth) return res.status(500).json({ error: 'Missing credentials' })

  try {
    // Fetch detail for ONE listing (id=15917995) to inspect XML structure
    const r = await fetch('https://api.justimmo.at/rest/v1/objekt/detail?objekt_id=15917995', {
      headers: { Authorization: auth },
    })
    const xml = await r.text()
    res.setHeader('Content-Type', 'text/xml; charset=utf-8')
    res.status(r.status).send(xml)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
}
