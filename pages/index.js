import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const G = {
  bg:'#090909', bg2:'#111', bg3:'#161616', bg4:'#1c1c1c',
  border:'#222', gold:'#b39761', goldL:'#d4bc8a', goldD:'#7a6640',
  orange:'#e07a3a', meta:'#1877f2', google:'#ea4335',
  green:'#4a9e6a', red:'#b04040', muted:'#555', text:'#ddd',
}

const MOCK = {
  kpis: [
    { label:'Investimento Total', value:'R$8.240',  delta:'▲ 12% vs. mês anterior', positive:true,  highlight:true  },
    { label:'Alcance',            value:'142.8k',   delta:'▲ 8% vs. mês anterior',  positive:true,  highlight:false },
    { label:'Reservas Geradas',   value:'387',      delta:'▲ 23% vs. mês anterior', positive:true,  highlight:false },
    { label:'Custo por Reserva',  value:'R$21,29',  delta:'▼ 9% melhorou',          positive:true,  highlight:false },
  ],
  daily: Array.from({length:30},(_,i)=>({
    day:`${i+1}`,
    meta:   Math.round(140+Math.sin(i*.4)*60+Math.random()*80),
    google: Math.round(80 +Math.sin(i*.3)*40+Math.random()*50),
  })),
  platform: [
    { platform:'Meta Ads',   color:'#1877f2', spend:'R$5.120', results:241, cpr:'R$21,24', roas:'4.8x', pct:62 },
    { platform:'Google Ads', color:'#ea4335', spend:'R$3.120', results:146, cpr:'R$21,36', roas:'3.9x', pct:38 },
  ],
  funnel: [
    { label:'Impressões', value:142800, fmt:'142.8k', rate:null    },
    { label:'Cliques',    value:4570,   fmt:'4.570',  rate:'CTR 3,2%' },
    { label:'Leads',      value:241,    fmt:'241',    rate:'CVR 5,3%' },
    { label:'Reservas',   value:150,    fmt:'150',    rate:'Conf. 62%'},
  ],
  campaigns: [
    { name:'Jantar Romântico · Maio',  platform:'Meta',   objective:'Mensagens', spend:'R$2.140', impressions:'58.2k', ctr:'4,1%', results:102, cpr:'R$20,98', status:'Ativo'   },
    { name:'Upstairs Rooftop · Brand', platform:'Meta',   objective:'Alcance',   spend:'R$1.480', impressions:'42.1k', ctr:'2,8%', results:74,  cpr:'R$20,00', status:'Ativo'   },
    { name:'Eventos Corporativos',     platform:'Meta',   objective:'Leads',     spend:'R$1.500', impressions:'37.8k', ctr:'3,5%', results:65,  cpr:'R$23,07', status:'Ativo'   },
    { name:'The View Bar · Busca',     platform:'Google', objective:'Reservas',  spend:'R$1.820', impressions:'28.4k', ctr:'6,2%', results:89,  cpr:'R$20,44', status:'Ativo'   },
    { name:'Rooftop SP · Display',     platform:'Google', objective:'Awareness', spend:'R$1.300', impressions:'51.9k', ctr:'1,8%', results:57,  cpr:'R$22,80', status:'Pausado' },
  ],
  strat: [
    { label:'CAC',      value:'R$21,29', note:'Custo de Aquisição'  },
    { label:'ROAS',     value:'4,3x',    note:'Retorno sobre Gasto' },
    { label:'LTV Est.', value:'R$380',   note:'Lifetime Value'      },
  ],
}

const tourSteps = [
  { t:'Bem-vindo ao The View Dashboard',  b:'Este painel centraliza Meta Ads, Google Ads e GA4 em tempo real.' },
  { t:'Cards de Performance',             b:'KPIs principais comparados com o período anterior.' },
  { t:'Filtros de Período',               b:'Use 7D, 30D ou 90D. Todos os gráficos atualizam.' },
  { t:'Funil de Conversão',               b:'Impressões → Cliques → Leads → Reservas com taxa entre cada etapa.' },
  { t:'Campanhas Ativas',                 b:'Tabela completa Meta + Google com métricas de performance.' },
]

function useGA4(period) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/ga4?period=${period}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [period])

  return { data, loading }
}

const Pill = ({ v, type }) => {
  const c = type==='up' ? G.green : type==='dn' ? G.red : G.gold
  return <span style={{ fontSize:10, padding:'2px 7px', borderRadius:2, background:`${c}22`, color:c }}>{v}</span>
}

const StatusPill = ({ s }) => {
  if (s==='Ativo')   return <Pill v="Ativo"      type="up"   />
  if (s==='Pausado') return <Pill v="Pausado"    type="dn"   />
  return                    <Pill v="Em análise" type="warn" />
}

const PlatDot = ({ p }) => (
  <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:11 }}>
    <span style={{ width:7, height:7, borderRadius:'50%', background:p==='Meta'?G.meta:G.google, display:'inline-block' }} />{p}
  </span>
)

const TH = ({ children, right }) => (
  <th style={{ fontSize:9, letterSpacing:1.2, textTransform:'uppercase', color:G.muted, padding:'0 0 10px', fontWeight:400, borderBottom:`1px solid ${G.border}`, textAlign:right?'right':'left' }}>{children}</th>
)

const TD = ({ children, right, muted, gold }) => (
  <td style={{ padding:'9px 0', borderBottom:`1px solid ${G.border}22`, textAlign:right?'right':'left', color:muted?G.muted:gold?G.goldL:G.text }}>{children}</td>
)

const Panel = ({ children, style }) => (
  <div style={{ background:G.bg2, border:`1px solid ${G.border}`, borderRadius:3, padding:18, overflow:'hidden', ...style }}>{children}</div>
)

const PanelHeader = ({ title, badge, badgeColor }) => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
    <span style={{ fontSize:10, letterSpacing:1.5, textTransform:'uppercase', color:G.muted }}>{title}</span>
    <span style={{ fontSize:9, padding:'3px 8px', borderRadius:2, background:badgeColor?`${badgeColor}18`:'rgba(179,151,97,.1)', color:badgeColor||G.gold, border:`1px solid ${badgeColor?`${badgeColor}33`:'rgba(179,151,97,.2)'}` }}>{badge}</span>
  </div>
)

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:G.bg2, border:`1px solid ${G.border}`, borderRadius:4, padding:'10px 14px' }}>
      <p style={{ color:G.gold, fontSize:11, marginBottom:6 }}>DIA {label}</p>
      {payload.map(p => <p key={p.dataKey} style={{ color:p.fill, fontSize:12 }}>{p.dataKey==='meta'?'Meta':'Google'}: R${p.value}</p>)}
    </div>
  )
}

export default function Home() {
  const [period, setPeriod] = useState('30')
  const [nav, setNav]       = useState('overview')
  const [tourStep, setTourStep] = useState(0)
  const [tourDone, setTourDone] = useState(false)
  const [pulse, setPulse]   = useState(true)

  const { data: ga4, loading: ga4Loading } = useGA4(period)

  useEffect(() => {
    const t = setInterval(() => setPulse(p => !p), 1200)
    return () => clearInterval(t)
  }, [])

  const periodMap = { '7':'7D', '30':'30D', '90':'90D' }
  const navLabels = { overview:'Visão Geral', meta:'Meta Ads', google:'Google Ads', analytics:'Analytics', funnel:'Funil' }

  const ga4Pages = ga4?.rows || []
  const ga4Totals = ga4?.totals || { sessions:0, engagementRate:0, conversions:0 }

  const FunnelChart = () => (
    <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
      {MOCK.funnel.map((s,i) => {
        const pct = (s.value/MOCK.funnel[0].value)*100
        const op  = 0.15+(i/(MOCK.funnel.length-1))*0.85
        return (
          <div key={s.label}>
            {s.rate && <div style={{ fontSize:9, color:G.muted, paddingLeft:80, marginBottom:3 }}>↓ {s.rate}</div>}
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ fontSize:10, color:G.muted, width:72, textAlign:'right', flexShrink:0 }}>{s.label}</div>
              <div style={{ flex:1, height:26, background:G.bg4, borderRadius:2, overflow:'hidden' }}>
                <div style={{ width:`${Math.max(pct,3)}%`, height:'100%', background:`rgba(179,151,97,${op})`, display:'flex', alignItems:'center', paddingLeft:10, fontSize:10, color:i>=2?G.bg:G.gold, borderRadius:2, whiteSpace:'nowrap' }}>
                  {s.fmt}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )

  return (
    <div style={{ background:G.bg, minHeight:'100vh', fontFamily:"'DM Sans',sans-serif", color:G.text }}>

      {/* TOUR */}
      {!tourDone && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.78)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:G.bg2, border:`1px solid ${G.gold}`, borderRadius:5, padding:30, maxWidth:400, width:'90%' }}>
            <div style={{ fontSize:9, color:G.gold, letterSpacing:2, textTransform:'uppercase', marginBottom:10 }}>Tour · Passo {tourStep+1} de {tourSteps.length}</div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:21, color:G.text, marginBottom:10, fontWeight:300 }}>{tourSteps[tourStep].t}</div>
            <div style={{ fontSize:13, color:G.muted, lineHeight:1.7, marginBottom:22 }}>{tourSteps[tourStep].b}</div>
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
              <button onClick={()=>setTourDone(true)} style={{ padding:'7px 14px', background:'transparent', border:`1px solid ${G.border}`, color:G.muted, borderRadius:3, cursor:'pointer', fontSize:11 }}>Pular</button>
              <button onClick={()=>tourStep<tourSteps.length-1?setTourStep(s=>s+1):setTourDone(true)} style={{ padding:'7px 18px', background:'rgba(179,151,97,.15)', border:`1px solid ${G.gold}`, color:G.gold, borderRadius:3, cursor:'pointer', fontSize:11 }}>
                {tourStep<tourSteps.length-1?'Próximo →':'Começar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 24px', background:G.bg2, borderBottom:`1px solid ${G.border}` }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:36, height:36, borderRadius:'50%', border:`1.5px solid ${G.gold}`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Cormorant Garamond',serif", fontSize:13, color:G.gold }}>TV</div>
          <div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, color:G.gold, letterSpacing:4, fontWeight:300 }}>THE <span style={{ color:G.text }}>VIEW</span></div>
            <div style={{ fontSize:9, color:G.muted, letterSpacing:2, textTransform:'uppercase', marginTop:2 }}>Rooftop Bar · São Paulo</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:G.orange }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:G.orange, opacity:pulse?1:.2, transition:'opacity .4s' }} />Ao vivo
          </div>
          <div style={{ fontSize:11, color:G.muted, letterSpacing:1 }}>MAIO 2026</div>
        </div>
      </header>

      {/* NAV */}
      <nav style={{ display:'flex', padding:'0 24px', background:G.bg2, borderBottom:`1px solid ${G.border}` }}>
        {Object.entries(navLabels).map(([id, label]) => (
          <button key={id} onClick={()=>setNav(id)} style={{
            padding:'11px 18px', fontSize:10, letterSpacing:1.5, textTransform:'uppercase',
            color:nav===id?G.gold:G.muted, border:'none',
            borderBottom:`2px solid ${nav===id?G.gold:'transparent'}`,
            background:'transparent', cursor:'pointer',
          }}>{label}</button>
        ))}
      </nav>

      {/* MAIN */}
      <main style={{ padding:'20px 24px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:300, letterSpacing:2 }}>{navLabels[nav]}</div>
          <div style={{ display:'flex', gap:4 }}>
            {[['7','7D'],['30','30D'],['90','90D']].map(([v,l]) => (
              <button key={v} onClick={()=>setPeriod(v)} style={{
                padding:'5px 13px', fontSize:10, letterSpacing:1, textTransform:'uppercase',
                border:`1px solid ${period===v?G.gold:G.border}`,
                background:period===v?'rgba(179,151,97,.1)':'transparent',
                color:period===v?G.gold:G.muted, cursor:'pointer', borderRadius:2,
              }}>{l}</button>
            ))}
          </div>
        </div>

        {/* ── OVERVIEW ── */}
        {nav==='overview' && (<>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:16 }}>
            {MOCK.kpis.map(k => (
              <div key={k.label} style={{ background:G.bg2, border:`1px solid ${G.border}`, borderRadius:3, padding:'16px 18px', borderTop:`2px solid ${k.highlight?G.orange:G.goldD}` }}>
                <div style={{ fontSize:9, letterSpacing:1.5, textTransform:'uppercase', color:G.muted, marginBottom:8 }}>{k.label}</div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, fontWeight:300, color:k.highlight?G.orange:G.gold }}>{k.value}</div>
                <div style={{ fontSize:10, color:k.positive?G.green:G.red, marginTop:6 }}>{k.delta}</div>
              </div>
            ))}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
            <Panel>
              <PanelHeader title="Investimento Diário" badge="30 dias" />
              <ResponsiveContainer width="100%" height={110}>
                <BarChart data={MOCK.daily} barSize={5} barGap={1}>
                  <XAxis dataKey="day" tick={{ fill:'#444', fontSize:9 }} tickLine={false} axisLine={false} interval={4} />
                  <YAxis hide /><Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="meta"   fill={G.meta}   radius={[2,2,0,0]} />
                  <Bar dataKey="google" fill={G.google} radius={[2,2,0,0]} />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display:'flex', gap:14, marginTop:8 }}>
                {[{c:G.meta,l:'Meta Ads'},{c:G.google,l:'Google Ads'}].map(x=>(
                  <span key={x.l} style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, color:G.muted }}>
                    <span style={{ width:8, height:8, background:x.c, borderRadius:1, display:'inline-block' }} />{x.l}
                  </span>
                ))}
              </div>
            </Panel>
            <Panel>
              <PanelHeader title="Distribuição por Plataforma" badge="Investimento" />
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                <thead><tr><TH>Plataforma</TH><TH right>Gasto</TH><TH right>Reservas</TH><TH right>CPR</TH><TH right>ROAS</TH></tr></thead>
                <tbody>{MOCK.platform.map(r=>(
                  <tr key={r.platform}>
                    <TD><span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:11 }}><span style={{ width:7, height:7, borderRadius:'50%', background:r.color, display:'inline-block' }} />{r.platform}</span></TD>
                    <TD right>{r.spend}</TD><TD right>{r.results}</TD><TD right>{r.cpr}</TD>
                    <TD right><Pill v={r.roas} type="up" /></TD>
                  </tr>
                ))}</tbody>
              </table>
              <div style={{ display:'flex', alignItems:'center', gap:18, marginTop:14 }}>
                <PieChart width={68} height={68}>
                  <Pie data={MOCK.platform.map(p=>({name:p.platform,value:p.pct,color:p.color}))} cx={30} cy={30} innerRadius={20} outerRadius={32} dataKey="value" strokeWidth={0}>
                    {MOCK.platform.map((e,i)=><Cell key={i} fill={e.color} />)}
                  </Pie>
                </PieChart>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {MOCK.platform.map(d=>(
                    <div key={d.platform} style={{ display:'flex', alignItems:'center', gap:6, fontSize:10, color:G.muted }}>
                      <span style={{ width:8, height:8, background:d.color, borderRadius:1, display:'inline-block' }} />{d.platform}: {d.pct}%
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:10, marginBottom:10 }}>
            <Panel>
              <PanelHeader title="Funil de Conversão" badge="Meta Ads" />
              <FunnelChart />
            </Panel>
            <Panel>
              <PanelHeader title="Comportamento no Site · GA4" badge={`Property 425809468`} />
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:14 }}>
                {[
                  { l:'Sessões',         v: ga4Loading ? '…' : ga4Totals.sessions > 1000 ? `${(ga4Totals.sessions/1000).toFixed(1)}k` : String(ga4Totals.sessions) },
                  { l:'Tx. Engajamento', v: ga4Loading ? '…' : `${(ga4Totals.engagementRate*100).toFixed(0)}%` },
                  { l:'Conversões',      v: ga4Loading ? '…' : String(ga4Totals.conversions) },
                ].map(m=>(
                  <div key={m.l} style={{ background:G.bg3, border:`1px solid ${G.border}`, borderRadius:3, padding:11 }}>
                    <div style={{ fontSize:9, color:G.muted, letterSpacing:1, textTransform:'uppercase', marginBottom:5 }}>{m.l}</div>
                    <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, color:G.gold, fontWeight:300 }}>{m.v}</div>
                    {ga4Loading && <div style={{ fontSize:9, color:G.muted, marginTop:3 }}>Carregando dados reais…</div>}
                  </div>
                ))}
              </div>
              <div style={{ fontSize:10, color:G.muted, letterSpacing:1.5, textTransform:'uppercase', marginBottom:10 }}>Páginas mais acessadas</div>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                <thead><tr><TH>Página</TH><TH right>Sessões</TH><TH right>Engaj.</TH><TH right>Conv.</TH></tr></thead>
                <tbody>
                  {ga4Loading
                    ? <tr><td colSpan={4} style={{ padding:'12px 0', color:G.muted, fontSize:11 }}>Carregando dados reais do GA4…</td></tr>
                    : ga4Pages.slice(0,5).map((p,i)=>(
                      <tr key={i}>
                        <TD gold>{p.page}</TD>
                        <TD right>{p.sessions.toLocaleString('pt-BR')}</TD>
                        <TD right>{(p.engagementRate*100).toFixed(0)}%</TD>
                        <TD right><Pill v={String(p.conversions)} type="up" /></TD>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </Panel>
          </div>

          <Panel>
            <PanelHeader title="Campanhas Ativas" badge="Meta + Google · 830-593-5209" />
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
              <thead><tr><TH>Campanha</TH><TH>Plat.</TH><TH right>Objetivo</TH><TH right>Gasto</TH><TH right>Impr.</TH><TH right>CTR</TH><TH right>Result.</TH><TH right>CPR</TH><TH right>Status</TH></tr></thead>
              <tbody>{MOCK.campaigns.map((c,i)=>(
                <tr key={i}>
                  <TD>{c.name}</TD><TD><PlatDot p={c.platform} /></TD>
                  <TD right muted>{c.objective}</TD><TD right>{c.spend}</TD>
                  <TD right muted>{c.impressions}</TD><TD right>{c.ctr}</TD>
                  <TD right>{c.results}</TD><TD right>{c.cpr}</TD>
                  <TD right><StatusPill s={c.status} /></TD>
                </tr>
              ))}</tbody>
            </table>
          </Panel>
        </>)}

        {/* ── META ADS ── */}
        {nav==='meta' && (<>
          <div style={{ fontSize:10, color:G.muted, marginBottom:14, paddingBottom:10, borderBottom:`1px solid ${G.border}` }}>Meta Ads · act_1359151465123137 · Porter Metrics</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:16 }}>
            {[{l:'Gasto Total',v:'R$5.120'},{l:'Alcance',v:'98.4k'},{l:'Resultados',v:'241'},{l:'CPR',v:'R$21,24'}].map(m=>(
              <div key={m.l} style={{ background:G.bg2, border:`1px solid ${G.border}`, borderRadius:3, padding:'16px 18px', borderTop:`2px solid ${G.meta}` }}>
                <div style={{ fontSize:9, letterSpacing:1.5, textTransform:'uppercase', color:G.muted, marginBottom:8 }}>{m.l}</div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, fontWeight:300, color:G.meta }}>{m.v}</div>
              </div>
            ))}
          </div>
          <Panel>
            <PanelHeader title="Campanhas Meta Ads" badge="Facebook · Instagram" badgeColor={G.meta} />
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
              <thead><tr><TH>Campanha</TH><TH right>Objetivo</TH><TH right>Gasto</TH><TH right>Impr.</TH><TH right>CTR</TH><TH right>Result.</TH><TH right>CPR</TH><TH right>Status</TH></tr></thead>
              <tbody>{MOCK.campaigns.filter(c=>c.platform==='Meta').map((c,i)=>(
                <tr key={i}><TD>{c.name}</TD><TD right muted>{c.objective}</TD><TD right>{c.spend}</TD><TD right muted>{c.impressions}</TD><TD right>{c.ctr}</TD><TD right>{c.results}</TD><TD right>{c.cpr}</TD><TD right><StatusPill s={c.status} /></TD></tr>
              ))}</tbody>
            </table>
          </Panel>
        </>)}

        {/* ── GOOGLE ADS ── */}
        {nav==='google' && (<>
          <div style={{ fontSize:10, color:G.muted, marginBottom:14, paddingBottom:10, borderBottom:`1px solid ${G.border}` }}>Google Ads · 830-593-5209</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:16 }}>
            {[{l:'Gasto Total',v:'R$3.120'},{l:'Impressões',v:'80.3k'},{l:'Resultados',v:'146'},{l:'CPR',v:'R$21,36'}].map(m=>(
              <div key={m.l} style={{ background:G.bg2, border:`1px solid ${G.border}`, borderRadius:3, padding:'16px 18px', borderTop:`2px solid ${G.google}` }}>
                <div style={{ fontSize:9, letterSpacing:1.5, textTransform:'uppercase', color:G.muted, marginBottom:8 }}>{m.l}</div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, fontWeight:300, color:G.google }}>{m.v}</div>
              </div>
            ))}
          </div>
          <Panel>
            <PanelHeader title="Campanhas Google Ads" badge="Search · Display" badgeColor={G.google} />
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
              <thead><tr><TH>Campanha</TH><TH right>Objetivo</TH><TH right>Gasto</TH><TH right>Impr.</TH><TH right>CTR</TH><TH right>Result.</TH><TH right>CPR</TH><TH right>Status</TH></tr></thead>
              <tbody>{MOCK.campaigns.filter(c=>c.platform==='Google').map((c,i)=>(
                <tr key={i}><TD>{c.name}</TD><TD right muted>{c.objective}</TD><TD right>{c.spend}</TD><TD right muted>{c.impressions}</TD><TD right>{c.ctr}</TD><TD right>{c.results}</TD><TD right>{c.cpr}</TD><TD right><StatusPill s={c.status} /></TD></tr>
              ))}</tbody>
            </table>
          </Panel>
        </>)}

        {/* ── ANALYTICS ── */}
        {nav==='analytics' && (<>
          <div style={{ fontSize:10, color:G.muted, marginBottom:14, paddingBottom:10, borderBottom:`1px solid ${G.border}` }}>Google Analytics 4 · Property ID: 425809468 · theviewbar.com.br</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:16 }}>
            {[
              { l:'Sessões',         v: ga4Loading ? '…' : ga4Totals.sessions > 1000 ? `${(ga4Totals.sessions/1000).toFixed(1)}k` : String(ga4Totals.sessions) },
              { l:'Tx. Engajamento', v: ga4Loading ? '…' : `${(ga4Totals.engagementRate*100).toFixed(0)}%` },
              { l:'Conversões',      v: ga4Loading ? '…' : String(ga4Totals.conversions) },
              { l:'Páginas Vistas',  v: ga4Loading ? '…' : String(ga4Pages.length) },
            ].map(m=>(
              <div key={m.l} style={{ background:G.bg2, border:`1px solid ${G.border}`, borderRadius:3, padding:'16px 18px', borderTop:`2px solid ${G.goldD}` }}>
                <div style={{ fontSize:9, letterSpacing:1.5, textTransform:'uppercase', color:G.muted, marginBottom:8 }}>{m.l}</div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, fontWeight:300, color:G.gold }}>{m.v}</div>
              </div>
            ))}
          </div>
          <Panel>
            <PanelHeader title="Páginas mais acessadas" badge="GA4 · Dados Reais" />
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
              <thead><tr><TH>Página</TH><TH right>Sessões</TH><TH right>Engajamento</TH><TH right>Conversões</TH><TH right>Tx. Conv.</TH></tr></thead>
              <tbody>
                {ga4Loading
                  ? <tr><td colSpan={5} style={{ padding:'12px 0', color:G.muted, fontSize:11 }}>Carregando dados reais do GA4…</td></tr>
                  : ga4Pages.map((p,i)=>(
                    <tr key={i}>
                      <TD gold>{p.page}</TD>
                      <TD right>{p.sessions.toLocaleString('pt-BR')}</TD>
                      <TD right>{(p.engagementRate*100).toFixed(0)}%</TD>
                      <TD right><Pill v={String(p.conversions)} type="up" /></TD>
                      <TD right muted>{p.sessions>0?((p.conversions/p.sessions)*100).toFixed(1)+'%':'—'}</TD>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </Panel>
        </>)}

        {/* ── FUNNEL ── */}
        {nav==='funnel' && (
          <Panel>
            <PanelHeader title="Funil Completo de Conversão" badge="Meta + GA4" />
            <div style={{ maxWidth:520, margin:'0 auto' }}>
              <FunnelChart />
              <div style={{ marginTop:24, padding:18, background:G.bg3, borderRadius:3, border:`1px solid ${G.border}` }}>
                <div style={{ fontSize:10, color:G.muted, letterSpacing:1.5, textTransform:'uppercase', marginBottom:14 }}>Métricas Estratégicas</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
                  {MOCK.strat.map(m=>(
                    <div key={m.label} style={{ textAlign:'center' }}>
                      <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, color:G.gold, fontWeight:300 }}>{m.value}</div>
                      <div style={{ fontSize:11, color:G.text, marginTop:2 }}>{m.label}</div>
                      <div style={{ fontSize:9, color:G.muted, marginTop:2 }}>{m.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Panel>
        )}
      </main>

      <footer style={{ padding:'12px 24px', borderTop:`1px solid ${G.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', background:G.bg2, marginTop:6 }}>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:13, color:G.goldD, letterSpacing:2 }}>THE VIEW · Dashboard</div>
        <div style={{ display:'flex', gap:18, alignItems:'center' }}>
          <span style={{ fontSize:10, color:G.muted }}>GA4: 425809468 · Dados reais</span>
          <span style={{ fontSize:10, color:G.goldD, border:`1px solid ${G.border}`, padding:'2px 8px', borderRadius:2 }}>v2.0.0</span>
        </div>
      </footer>
    </div>
  )
}
