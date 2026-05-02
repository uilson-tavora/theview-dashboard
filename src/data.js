// ── Mock data — substituir por chamadas reais às APIs quando disponível ────────

export const TENANT = {
  clientName:      'The View Bar',
  googleAccountId: '830-593-5209',
  ga4PropertyId:   '425809468',
  metaAccountId:   'act_1359151465123137',
}

export const kpiData = [
  { label: 'Investimento Total', value: 'R$8.240',  delta: '▲ 12% vs. mês anterior', positive: true,  highlight: true },
  { label: 'Alcance',            value: '142.8k',   delta: '▲ 8% vs. mês anterior',  positive: true,  highlight: false },
  { label: 'Reservas Geradas',   value: '387',      delta: '▲ 23% vs. mês anterior', positive: true,  highlight: false },
  { label: 'Custo por Reserva',  value: 'R$21,29',  delta: '▼ 9% melhorou',          positive: true,  highlight: false },
]

export const dailyData = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`,
  meta:   Math.round(140 + Math.sin(i * .4) * 60 + Math.random() * 80),
  google: Math.round(80  + Math.sin(i * .3) * 40 + Math.random() * 50),
}))

export const platformData = [
  { platform: 'Meta Ads',   color: '#1877f2', spend: 'R$5.120', results: 241, cpr: 'R$21,24', roas: '4.8x', pct: 62 },
  { platform: 'Google Ads', color: '#ea4335', spend: 'R$3.120', results: 146, cpr: 'R$21,36', roas: '3.9x', pct: 38 },
]

export const funnelSteps = [
  { label: 'Impressões', value: 142800, fmt: '142.8k', rate: null },
  { label: 'Cliques',    value: 4570,   fmt: '4.570',  rate: 'CTR 3,2%' },
  { label: 'Leads',      value: 241,    fmt: '241',    rate: 'CVR 5,3%' },
  { label: 'Reservas',   value: 150,    fmt: '150',    rate: 'Conf. 62%' },
]

export const ga4Cards = [
  { label: 'Sessões',         value: '18.4k',  delta: '▲ 15%', positive: true  },
  { label: 'Tx. Engajamento', value: '64%',    delta: '▲ 7%',  positive: true  },
  { label: 'Duração Média',   value: '2m48s',  delta: '▼ 3%',  positive: false },
]

export const ga4Pages = [
  { page: '/jantar-romantico', sessions: 4820, engagement: '71%', conversions: 142 },
  { page: '/upstairs-rooftop', sessions: 3940, engagement: '68%', conversions: 98  },
  { page: '/eventos',          sessions: 2210, engagement: '55%', conversions: 47  },
  { page: '/musica-ao-vivo',   sessions: 1890, engagement: '61%', conversions: 31  },
]

export const campaigns = [
  { name: 'Jantar Romântico · Maio',  platform: 'Meta',   objective: 'Mensagens', spend: 'R$2.140', impressions: '58.2k', ctr: '4,1%', results: 102, cpr: 'R$20,98', status: 'Ativo'   },
  { name: 'Upstairs Rooftop · Brand', platform: 'Meta',   objective: 'Alcance',   spend: 'R$1.480', impressions: '42.1k', ctr: '2,8%', results: 74,  cpr: 'R$20,00', status: 'Ativo'   },
  { name: 'Eventos Corporativos',     platform: 'Meta',   objective: 'Leads',     spend: 'R$1.500', impressions: '37.8k', ctr: '3,5%', results: 65,  cpr: 'R$23,07', status: 'Ativo'   },
  { name: 'The View Bar · Busca',     platform: 'Google', objective: 'Reservas',  spend: 'R$1.820', impressions: '28.4k', ctr: '6,2%', results: 89,  cpr: 'R$20,44', status: 'Ativo'   },
  { name: 'Rooftop SP · Display',     platform: 'Google', objective: 'Awareness', spend: 'R$1.300', impressions: '51.9k', ctr: '1,8%', results: 57,  cpr: 'R$22,80', status: 'Pausado' },
]

export const stratMetrics = [
  { label: 'CAC',      value: 'R$21,29', note: 'Custo de Aquisição'   },
  { label: 'ROAS',     value: '4,3x',    note: 'Retorno sobre Gasto'  },
  { label: 'LTV Est.', value: 'R$380',   note: 'Lifetime Value'       },
]
