export default function handler(req, res) {
  const user = process.env.JUSTIMMO_USER
  const pass = process.env.JUSTIMMO_PASS
  res.status(200).json({
    ok: true,
    user: user ? `${user.slice(0, 4)}****` : 'NOT SET',
    pass: pass ? '****SET****' : 'NOT SET',
  })
}
