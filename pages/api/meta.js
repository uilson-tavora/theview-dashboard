export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    const { period = '30' } = req.query
    const token = process.env.META_ACCESS_TOKEN
    const accountId = process.env.META_ACCOUNT_ID // act_1359151465123137

    const since = getDateAgo(parseInt(period))
    const until = getToday()

    // Buscar campanhas
    const campaignsRes = await fetch(
      `https://graph.facebook.com/v19.0/${accountId}/campaigns?` +
      new URLSearchParams({
        access_token: token,
        fields: 'name,status,objective',
        limit: 20,
      })
    )
    const campaignsData = await campaignsRes.json()
    if (campaignsData.error) throw new Error(campaignsData.error.message)

    // Buscar insights (métricas)
    const insightsRes = await fetch(
      `https://graph.facebook.com/v19.0/${accountId}/insights?` +
      new URLSearchParams({
        access_token: token,
        fields: 'campaign_name,spend,reach,impressions,clicks,actions,ctr,cost_per_action_type',
        time_range: JSON.stringify({ since, until }),
        level: 'campaign',
        limit: 20,
      })
    )
    const insightsData = await insightsRes.json()
    if (insightsData.error) throw new Error(insightsData.error.message)

    const insights = insightsData.data || []

    // Agregar totais
    const totals = {
      spend:       insights.reduce((s, i) => s + parseFloat(i.spend || 0), 0),
      reach:       insights.reduce((s, i) => s + parseInt(i.reach || 0), 0),
      impressions: insights.reduce((s, i) => s + parseInt(i.impressions || 0), 0),
      clicks:      insights.reduce((s, i) => s + parseInt(i.clicks || 0), 0),
      results:     insights.reduce((s, i) => {
        const actions = i.actions || []
        const conv = actions.find(a => ['link_click','lead','purchase','complete_registration'].includes(a.action_type))
        return s + parseInt(conv?.value || 0)
      }, 0),
    }
    totals.cpr = totals.results > 0 ? totals.spend / totals.results : 0
    totals.ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0

    // Daily spend
    const dailyRes = await fetch(
      `https://graph.facebook.com/v19.0/${accountId}/insights?` +
      new URLSearchParams({
        access_token: token,
        fields: 'spend,date_start',
        time_range: JSON.stringify({ since, until }),
        time_increment: 1,
        limit: 90,
      })
    )
    const dailyData = await dailyRes.json()
    const daily = (dailyData.data || []).map(d => ({
      day:  d.date_start,
      meta: parseFloat(d.spend || 0),
    }))

    // Formatar campanhas
    const campaigns = insights.map(i => {
      const actions = i.actions || []
      const conv = actions.find(a => ['link_click','lead','purchase','complete_registration'].includes(a.action_type))
      const results = parseInt(conv?.value || 0)
      const spend = parseFloat(i.spend || 0)
      return {
        name:        i.campaign_name,
        platform:    'Meta',
        spend,
        impressions: parseInt(i.impressions || 0),
        clicks:      parseInt(i.clicks || 0),
        ctr:         parseFloat(i.ctr || 0),
        results,
        cpr:         results > 0 ? spend / results : 0,
        status:      'Ativo',
      }
    })

    return res.status(200).json({ campaigns, totals, daily })
  } catch (err) {
    console.error('[Meta API]', err)
    return res.status(500).json({ error: err.message })
  }
}

function getDateAgo(days) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().split('T')[0]
}

function getToday() {
  return new Date().toISOString().split('T')[0]
}
