export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    JUSTIMMO_USER: process.env.JUSTIMMO_USER || 'NOT SET',
    JUSTIMMO_PASS: process.env.JUSTIMMO_PASS ? 'SET' : 'NOT SET',
    VERCEL_ENV: process.env.VERCEL_ENV || 'unknown',
    NODE_ENV: process.env.NODE_ENV || 'unknown',
    allKeys: Object.keys(process.env).filter(k => !k.includes('SECRET') && !k.includes('TOKEN')).slice(0, 30)
  })
}
