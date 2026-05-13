export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache')
  res.status(200).json({
    timestamp: new Date().toISOString(),
    JUSTIMMO_USER: process.env.JUSTIMMO_USER || 'NOT SET',
    JUSTIMMO_PASS: process.env.JUSTIMMO_PASS ? 'SET' : 'NOT SET',
    total_env_count: Object.keys(process.env).length,
  })
}
