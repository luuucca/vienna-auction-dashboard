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
    const r = await fetch('https://api.justimmo.at/rest/v1/objekt/detail?objekt_id=15917995', {
      headers: { Authorization: auth },
    })
    const xml = await r.text()
    const data = parser.parse(xml)
    const item = data?.justimmo?.immobilie

    // Show all top-level keys and their types/preview
    const inspect = (obj, depth = 0) => {
      if (!obj || typeof obj !== 'object') return obj
      const out = {}
      for (const k of Object.keys(obj)) {
        const v = obj[k]
        if (v == null) out[k] = null
        else if (typeof v === 'object' && !Array.isArray(v)) {
          out[k] = depth < 2 ? inspect(v, depth + 1) : '...nested...'
        } else if (Array.isArray(v)) {
          out[k] = `Array(${v.length})`
        } else {
          const s = String(v)
          out[k] = s.length > 100 ? s.slice(0, 100) + '...' : s
        }
      }
      return out
    }

    res.status(200).json({
      topLevelKeys: Object.keys(item),
      structure: inspect(item, 0),
    })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
}
