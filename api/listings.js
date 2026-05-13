export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')

  const user = process.env.JUSTIMMO_USER
  const pass = process.env.JUSTIMMO_PASS

  if (!user || !pass) {
    return res.status(500).json({ error: 'Missing credentials' })
  }

  const auth = Buffer.from(`${user}:${pass}`).toString('base64')

  try {
    const response = await fetch(
      'https://api.justimmo.at/rest/v1/objekt/list?limit=3',
      { headers: { Authorization: `Basic ${auth}` } }
    )
    const text = await response.text()
    res.setHeader('Content-Type', 'text/xml; charset=utf-8')
    res.status(response.status).send(text)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
}
