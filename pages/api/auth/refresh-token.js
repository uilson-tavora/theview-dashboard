export default async function handler(req, res) {
  const { code } = req.query
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://theview-dashboard.vercel.app'
  const redirect = `${base}/api/auth/refresh-token`

  if (!code) {
    const params = new URLSearchParams({
      client_id:     process.env.GOOGLE_CLIENT_ID,
      redirect_uri:  redirect,
      response_type: 'code',
      scope:         'https://www.googleapis.com/auth/analytics.readonly',
      access_type:   'offline',
      prompt:        'consent',
    })
    return res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id:     process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri:  redirect,
      grant_type:    'authorization_code',
    }),
  })

  const data = await response.json()

  if (data.refresh_token) {
    return res.status(200).json({
      message: '✅ Adicione esse refresh_token nas variáveis de ambiente do Vercel como GOOGLE_REFRESH_TOKEN',
      refresh_token: data.refresh_token,
    })
  }

  return res.status(400).json({ error: 'Falha', data })
}
