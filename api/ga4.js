// api/ga4.js — Vercel Serverless Function
// Google Analytics Data API v1

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://theview-dashboard.vercel.app')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    const { period = '30' } = req.query
    const token = await getAccessToken()

    const response = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${process.env.GA4_PROPERTY_ID}:runReport`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateRanges: [{ startDate: `${period}daysAgo`, endDate: 'today' }],
          dimensions: [{ name: 'pagePath' }],
          metrics: [
            { name: 'sessions' },
            { name: 'engagedSessions' },
            { name: 'engagementRate' },
            { name: 'averageSessionDuration' },
            { name: 'conversions' },
          ],
          orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
          limit: 10,
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('GA4 API error:', data)
      return res.status(response.status).json({ error: data.error?.message || 'GA4 error' })
    }

    // Formatar resposta
    const rows = (data.rows || []).map(row => ({
      page:            row.dimensionValues[0].value,
      sessions:        parseInt(row.metricValues[0].value),
      engagedSessions: parseInt(row.metricValues[1].value),
      engagementRate:  parseFloat(row.metricValues[2].value),
      avgDuration:     parseFloat(row.metricValues[3].value),
      conversions:     parseInt(row.metricValues[4].value),
    }))

    const totals = {
      sessions:       rows.reduce((s, r) => s + r.sessions, 0),
      engagementRate: rows.length ? rows.reduce((s, r) => s + r.engagementRate, 0) / rows.length : 0,
      conversions:    rows.reduce((s, r) => s + r.conversions, 0),
    }

    return res.status(200).json({ rows, totals })
  } catch (err) {
    console.error('GA4 handler error:', err)
    return res.status(500).json({ error: err.message })
  }
}

async function getAccessToken() {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      grant_type:    'refresh_token',
    }),
  })
  const data = await response.json()
  if (!data.access_token) throw new Error('Failed to get access token: ' + JSON.stringify(data))
  return data.access_token
}
