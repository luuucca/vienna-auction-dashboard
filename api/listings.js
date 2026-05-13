export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')

  const user = process.env.JUSTIMMO_USER
  const pass = process.env.JUSTIMMO_PASS

  if (!user || !pass) {
    return res.status(500).json({ error: 'Missing JUSTIMMO_USER or JUSTIMMO_PASS env vars' })
  }

  const auth = Buffer.from(`${user}:${pass}`).toString('base64')

  try {
    const response = await fetch(
      'https://api.justimmo.at/rest/v1/objekt/list?limit=20',
      { headers: { Authorization: `Basic ${auth}` } }
    )
    const text = await response.text()
    res.setHeader('Content-Type', 'text/xml; charset=utf-8')
    res.status(response.status).send(text)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
}
