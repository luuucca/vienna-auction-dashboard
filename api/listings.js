export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  const all = Object.keys(process.env).sort()
  const justimmo = all.filter(k => k.toUpperCase().includes('JUSTIMMO'))
  res.status(200).json({
    timestamp: new Date().toISOString(),
    JUSTIMMO_USER_value: process.env.JUSTIMMO_USER,
    JUSTIMMO_PASS_exists: !!process.env.JUSTIMMO_PASS,
    justimmo_keys_found: justimmo,
    total: all.length,
    allKeys: all,
  })
}
