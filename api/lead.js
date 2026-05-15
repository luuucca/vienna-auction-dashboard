// POST /api/lead — receive contact-form submissions and store in Notion.

const NOTION_API = 'https://api.notion.com/v1'
const LEADS_DB_ID = process.env.NOTION_LEADS_DB_ID || '361419f4-d42d-81ff-b749-de273d5e8f40'

function rt(text) {
  if (!text) return { rich_text: [] }
  // Notion rich_text caps at 2000 chars per text object
  const chunks = []
  let rem = String(text)
  while (rem.length > 0) {
    chunks.push({ text: { content: rem.slice(0, 2000) } })
    rem = rem.slice(2000)
  }
  return { rich_text: chunks }
}

function sanitize(s, max = 500) {
  if (!s) return ''
  return String(s).trim().slice(0, max)
}

function escapeHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// Non-blocking Telegram notification — failures don't break the form submit.
async function notifyTelegram(lead) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  console.log('[telegram] env check', {
    hasToken: !!token,
    tokenLen: token ? token.length : 0,
    hasChatId: !!chatId,
    chatId: chatId || '(missing)',
  })
  if (!token || !chatId) {
    console.warn('[telegram] env vars missing — skipping notification')
    return
  }

  const lines = [
    `🔔 <b>新客户留资</b>`,
    `<b>来源：</b> ${escapeHtml(lead.source)}`,
    `<b>姓名：</b> ${escapeHtml(lead.name)}`,
    lead.contact && `<b>联系方式：</b> ${escapeHtml(lead.contact)}`,
    lead.email   && `<b>邮箱：</b> ${escapeHtml(lead.email)}`,
    lead.address && `<b>地址：</b> ${escapeHtml(lead.address)}`,
    lead.message && `\n<b>留言：</b>\n${escapeHtml(lead.message)}`,
  ].filter(Boolean).join('\n')

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ chat_id: chatId, text: lines, parse_mode: 'HTML', disable_web_page_preview: true }),
    })
    const tgBody = await tgRes.text()
    console.log('[telegram] response', tgRes.status, tgBody.slice(0, 300))
  } catch (e) {
    console.error('[telegram] notify failed:', e.message)
  }
}

export default async function handler(req, res) {
  // CORS — same origin only on prod, but be defensive
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  if (!process.env.NOTION_TOKEN) {
    return res.status(500).json({ error: 'Server misconfigured (no NOTION_TOKEN)' })
  }

  // Accept both JSON and form-urlencoded bodies
  let body = req.body
  if (typeof body === 'string') {
    try { body = JSON.parse(body) } catch {}
  }
  body = body || {}

  const name    = sanitize(body.name, 100)
  const contact = sanitize(body.contact || body.phone, 100)
  const email   = sanitize(body.email, 200)
  const message = sanitize(body.message, 3000)
  const source  = sanitize(body.source, 50) || '其它'
  const propType = sanitize(body.propType, 50)
  const sqm      = sanitize(body.sqm, 50)
  const address  = sanitize(body.address, 200)

  // Anti-spam — bots often fill all fields including the hidden honeypot.
  if (body._honeypot || body.website) {
    // Pretend success so bots don't retry
    return res.status(200).json({ ok: true })
  }

  // Minimal validation: must have name + at least one contact channel
  if (!name || (!contact && !email)) {
    return res.status(400).json({ error: '请填写姓名和联系方式' })
  }

  const validSources = new Set(['首页咨询', '业主委托·出售', '业主委托·出租', '其它'])
  const finalSource = validSources.has(source) ? source : '其它'

  const props = {
    '姓名':     { title: [{ text: { content: name } }] },
    '联系方式': rt(contact),
    '留言':     rt(message),
    '来源':     { select: { name: finalSource } },
    '状态':     { select: { name: '🔴 新留资' } },
  }
  if (email)    props['Email']      = { email }
  if (propType) props['物业类型']   = rt(propType)
  if (sqm)      props['面积']       = rt(sqm)
  if (address)  props['地址']       = rt(address)

  try {
    const r = await fetch(`${NOTION_API}/pages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ parent: { database_id: LEADS_DB_ID }, properties: props }),
    })
    if (!r.ok) {
      const errText = await r.text()
      console.error('Notion error', r.status, errText)
      return res.status(502).json({ error: '提交失败，请稍后重试或直接微信联系' })
    }

    // Await Telegram so the serverless runtime doesn't freeze the fetch
    // mid-flight. ~300ms extra is unnoticeable to the user.
    await notifyTelegram({ name, contact, email, message, source: finalSource, address })

    return res.status(200).json({ ok: true })
  } catch (e) {
    console.error('Lead submit error', e)
    return res.status(500).json({ error: '提交失败，请稍后重试' })
  }
}
