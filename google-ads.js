// api/google-ads.js — Vercel Serverless Function
// Google Ads API v17

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://theview-dashboard.vercel.app')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    const { period = '30' } = req.query
    const token = await getAccessToken()
    const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID // 8305935209

    const startDate = getStartDate(parseInt(period))
    const endDate   = getTodayDate()

    const query = `
      SELECT
        campaign.name,
        campaign.status,
        campaign.advertising_channel_type,
        metrics.cost_micros,
        metrics.impressions,
        metrics.clicks,
        metrics.conversions,
        metrics.ctr,
        metrics.cost_per_conversion,
        segments.date
      FROM campaign
      WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
        AND campaign.status != 'REMOVED'
      ORDER BY metrics.cost_micros DESC
    `

    const response = await fetch(
      `https://googleads.googleapis.com/v17/customers/${customerId}/googleAds:searchStream`,
      {
        method: 'POST',
        headers: {
          'Authorization':       `Bearer ${token}`,
          'developer-token':     process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
          'login-customer-id':   customerId,
          'Content-Type':        'application/json',
        },
        body: JSON.stringify({ query }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('Google Ads API error:', data)
      return res.status(response.status).json({ error: data[0]?.error?.message || 'Google Ads error' })
    }

    // Agregar por campanha
    const campaignMap = {}
    for (const batch of data) {
      for (const result of (batch.results || [])) {
        const name = result.campaign.name
        if (!campaignMap[name]) {
          campaignMap[name] = {
            name,
            status:      result.campaign.status,
            platform:    'google',
            objective:   result.campaign.advertisingChannelType,
            spend:       0,
            impressions: 0,
            clicks:      0,
            results:     0,
            ctr:         0,
            cpr:         0,
          }
        }
        campaignMap[name].spend       += (result.metrics.costMicros || 0) / 1_000_000
        campaignMap[name].impressions += result.metrics.impressions || 0
        campaignMap[name].clicks      += result.metrics.clicks      || 0
        campaignMap[name].results     += result.metrics.conversions || 0
      }
    }

    const campaigns = Object.values(campaignMap).map(c => ({
      ...c,
      ctr: c.impressions > 0 ? (c.clicks / c.impressions) * 100 : 0,
      cpr: c.results > 0     ? c.spend / c.results              : 0,
    }))

    const totals = {
      spend:       campaigns.reduce((s, c) => s + c.spend, 0),
      impressions: campaigns.reduce((s, c) => s + c.impressions, 0),
      clicks:      campaigns.reduce((s, c) => s + c.clicks, 0),
      results:     campaigns.reduce((s, c) => s + c.results, 0),
    }

    // Daily spend para o gráfico de barras
    const dailyMap = {}
    for (const batch of data) {
      for (const result of (batch.results || [])) {
        const date = result.segments?.date
        if (!date) continue
        if (!dailyMap[date]) dailyMap[date] = { day: date, google: 0 }
        dailyMap[date].google += (result.metrics.costMicros || 0) / 1_000_000
      }
    }
    const daily = Object.values(dailyMap).sort((a, b) => a.day.localeCompare(b.day))

    return res.status(200).json({ campaigns, totals, daily })
  } catch (err) {
    console.error('Google Ads handler error:', err)
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

function getStartDate(days) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().split('T')[0]
}

function getTodayDate() {
  return new Date().toISOString().split('T')[0]
}
