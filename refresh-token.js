// api/auth/refresh-token.js
// Roda UMA VEZ para gerar o refresh_token via OAuth

export default async function handler(req, res) {
  const { code } = req.query

  if (!code) {
    const params = new URLSearchParams({
      client_id:     process.env.GOOGLE_CLIENT_ID,
      redirect_uri:  `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/refresh-token`,
      response_type: 'code',
      scope: [
        'https://www.googleapis.com/auth/analytics.readonly',
        'https://www.googleapis.com/auth/adwords',
      ].join(' '),
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
      redirect_uri:  `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/refresh-token`,
      grant_type:    'authorization_code',
    }),
  })

  const data = await response.json()

  if (data.refresh_token) {
    return res.status(200).json({
      message:       '✅ Copie o refresh_token e adicione nas variáveis de ambiente do Vercel',
      refresh_token: data.refresh_token,
    })
  }

  return res.status(400).json({ error: 'Falha ao obter refresh_token', data })
}
