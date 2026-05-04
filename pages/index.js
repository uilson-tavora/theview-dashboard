import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const G = {
  bg:'#090909', bg2:'#111', bg3:'#161616', bg4:'#1c1c1c',
  border:'#222', gold:'#b39761', goldL:'#d4bc8a', goldD:'#7a6640',
  orange:'#e07a3a', meta:'#1877f2', google:'#ea4335',
  green:'#4a9e6a', red:'#b04040', muted:'#555', text:'#ddd',
}

const tourSteps = [
  { t:'Bem-vindo ao The View Dashboard', b:'Dados reais de Meta Ads e GA4 em tempo real.' },
  { t:'Cards de Performance',            b:'KPIs calculados com dados reais das APIs.' },
  { t:'Filtros de Período',              b:'7D, 30D ou 90D — todos os dados atualizam.' },
  { t:'Meta Ads',                        b:'Campanhas reais da conta act_1359151465123137.' },
  { t:'Google Analytics 4',             b:'Sessões e páginas reais do theviewbar.com.br.' },
]

function useAPI(url, period) {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)
  useEffect(() => {
    setLoading(true); setData(null); setError(null)
    fetch(`${url}?period=${period}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [url, period])
  return { data, loading, error }
}

const fmt = (n, prefix='R$') => n != null ? `${prefix}${n.toLocaleString('pt-BR', {minimumFractionDigits:2,maximumFractionDigits:2})}` : '—'
const fmtK = n => n > 1000 ? `${(n/1000).toFixed(1)}k` : String(n||0)

const Pill  = ({ v, type }) => { const c=type==='up'?G.green:type==='dn'?G.red:G.gold; return <span style={{fontSize:10,padding:'2px 7px',borderRadius:2,background:`${c}22`,color:c}}>{v}</span> }
const SPill = ({ s }) => { const n=s?.toUpperCase(); return n==='ACTIVE'||n==='ATIVO'?<Pill v="Ativo" type="up"/>:n==='PAUSED'||n==='PAUSADO'?<Pill v="Pausado" type="dn"/>:<Pill v="Ativo" type="up"/> }
const PDot  = ({ p }) => <span style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:11}}><span style={{width:7,height:7,borderRadius:'50%',background:p==='Meta'?G.meta:G.google,display:'inline-block'}}/>{p}</span>
const TH    = ({ children, right }) => <th style={{fontSize:9,letterSpacing:1.2,textTransform:'uppercase',color:G.muted,padding:'0 0 10px',fontWeight:400,borderBottom:`1px solid ${G.border}`,textAlign:right?'right':'left'}}>{children}</th>
const TD    = ({ children, right, muted, gold }) => <td style={{padding:'9px 0',borderBottom:`1px solid ${G.border}22`,textAlign:right?'right':'left',color:muted?G.muted:gold?G.goldL:G.text}}>{children}</td>
const Panel = ({ children, style }) => <div style={{background:G.bg2,border:`1px solid ${G.border}`,borderRadius:3,padding:18,overflow:'hidden',...style}}>{children}</div>
const PHdr  = ({ title, badge, bc }) => (
  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
    <span style={{fontSize:10,letterSpacing:1.5,textTransform:'uppercase',color:G.muted}}>{title}</span>
    <span style={{fontSize:9,padding:'3px 8px',borderRadius:2,background:bc?`${bc}18`:'rgba(179,151,97,.1)',color:bc||G.gold,border:`1px solid ${bc?`${bc}33`:'rgba(179,151,97,.2)'}`}}>{badge}</span>
  </div>
)
const CTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return <div style={{background:G.bg2,border:`1px solid ${G.border}`,borderRadius:4,padding:'10px 14px'}}>
    <p style={{color:G.gold,fontSize:11,marginBottom:6}}>{label}</p>
    {payload.map(p=><p key={p.dataKey} style={{color:p.fill,fontSize:12}}>{p.dataKey==='meta'?'Meta':'Google'}: R${p.value?.toFixed(0)}</p>)}
  </div>
}
const Spin = () => <div style={{color:G.muted,fontSize:12,padding:'16px 0',textAlign:'center'}}>Carregando dados reais…</div>

export default function Home() {
  const [period, setPeriod]     = useState('30')
  const [nav, setNav]           = useState('overview')
  const [tourStep, setTourStep] = useState(0)
  const [tourDone, setTourDone] = useState(false)
  const [pulse, setPulse]       = useState(true)

  const { data: meta,  loading: metaL  } = useAPI('/api/meta', period)
  const { data: ga4,   loading: ga4L   } = useAPI('/api/ga4',  period)

  useEffect(() => { const t=setInterval(()=>setPulse(p=>!p),1200); return ()=>clearInterval(t) }, [])

  // ── Aggregations ────────────────────────────────────────────────────────────
  const metaTotals = meta?.totals   || {}
  const ga4Totals  = ga4?.totals    || {}
  const ga4Pages   = ga4?.rows      || []
  const campaigns  = meta?.campaigns || []

  const totalSpend   = (metaTotals.spend   || 0)
  const totalReach   = (metaTotals.reach   || 0)
  const totalResults = (metaTotals.results || 0)
  const avgCPR       = totalResults > 0 ? totalSpend / totalResults : 0
  const roas         = totalSpend > 0 ? (totalResults * 150) / totalSpend : 0

  // Daily chart — merge meta daily
  const dailyMeta   = meta?.daily || []
  const dailyChart  = dailyMeta.map(d => ({ day: d.day?.slice(5), meta: d.meta, google: 0 }))

  // Funnel
  const funnelSteps = [
    { label:'Impressões', value: metaTotals.impressions||0, fmt: fmtK(metaTotals.impressions||0), rate: null },
    { label:'Cliques',    value: metaTotals.clicks||0,      fmt: fmtK(metaTotals.clicks||0),      rate: metaTotals.impressions ? `CTR ${((metaTotals.clicks/metaTotals.impressions)*100).toFixed(1)}%` : null },
    { label:'Resultados', value: metaTotals.results||0,     fmt: String(metaTotals.results||0),   rate: metaTotals.clicks ? `CVR ${((metaTotals.results/metaTotals.clicks)*100).toFixed(1)}%` : null },
    { label:'Reservas',   value: ga4Totals.conversions||0,  fmt: String(ga4Totals.conversions||0), rate: null },
  ]

  const navLabels = { overview:'Visão Geral', meta:'Meta Ads', google:'Google Ads', analytics:'Analytics', funnel:'Funil' }

  const FunnelChart = () => (
    <div style={{display:'flex',flexDirection:'column',gap:5}}>
      {funnelSteps.map((s,i) => {
        const pct = funnelSteps[0].value > 0 ? (s.value/funnelSteps[0].value)*100 : 0
        const op  = 0.15+(i/(funnelSteps.length-1))*0.85
        return (
          <div key={s.label}>
            {s.rate && <div style={{fontSize:9,color:G.muted,paddingLeft:80,marginBottom:3}}>↓ {s.rate}</div>}
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{fontSize:10,color:G.muted,width:72,textAlign:'right',flexShrink:0}}>{s.label}</div>
              <div style={{flex:1,height:26,background:G.bg4,borderRadius:2,overflow:'hidden'}}>
                <div style={{width:`${Math.max(pct,3)}%`,height:'100%',background:`rgba(179,151,97,${op})`,display:'flex',alignItems:'center',paddingLeft:10,fontSize:10,color:i>=2?G.bg:G.gold,borderRadius:2,whiteSpace:'nowrap'}}>
                  {metaL ? '…' : s.fmt}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )

  return (
    <div style={{background:G.bg,minHeight:'100vh',fontFamily:"'DM Sans',sans-serif",color:G.text}}>

      {/* TOUR */}
      {!tourDone && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.78)',zIndex:999,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:G.bg2,border:`1px solid ${G.gold}`,borderRadius:5,padding:30,maxWidth:400,width:'90%'}}>
            <div style={{fontSize:9,color:G.gold,letterSpacing:2,textTransform:'uppercase',marginBottom:10}}>Tour · Passo {tourStep+1} de {tourSteps.length}</div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:21,color:G.text,marginBottom:10,fontWeight:300}}>{tourSteps[tourStep].t}</div>
            <div style={{fontSize:13,color:G.muted,lineHeight:1.7,marginBottom:22}}>{tourSteps[tourStep].b}</div>
            <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
              <button onClick={()=>setTourDone(true)} style={{padding:'7px 14px',background:'transparent',border:`1px solid ${G.border}`,color:G.muted,borderRadius:3,cursor:'pointer',fontSize:11}}>Pular</button>
              <button onClick={()=>tourStep<tourSteps.length-1?setTourStep(s=>s+1):setTourDone(true)} style={{padding:'7px 18px',background:'rgba(179,151,97,.15)',border:`1px solid ${G.gold}`,color:G.gold,borderRadius:3,cursor:'pointer',fontSize:11}}>
                {tourStep<tourSteps.length-1?'Próximo →':'Começar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 24px',background:G.bg2,borderBottom:`1px solid ${G.border}`}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:36,height:36,borderRadius:'50%',border:`1.5px solid ${G.gold}`,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Cormorant Garamond',serif",fontSize:13,color:G.gold}}>TV</div>
          <div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:G.gold,letterSpacing:4,fontWeight:300}}>THE <span style={{color:G.text}}>VIEW</span></div>
            <div style={{fontSize:9,color:G.muted,letterSpacing:2,textTransform:'uppercase',marginTop:2}}>Rooftop Bar · São Paulo</div>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:20}}>
          <div style={{display:'flex',alignItems:'center',gap:6,fontSize:11,color:G.orange}}>
            <div style={{width:7,height:7,borderRadius:'50%',background:G.orange,opacity:pulse?1:.2,transition:'opacity .4s'}}/>Ao vivo
          </div>
          <div style={{fontSize:11,color:G.muted,letterSpacing:1}}>{new Date().toLocaleDateString('pt-BR',{month:'long',year:'numeric'}).toUpperCase()}</div>
        </div>
      </header>

      {/* NAV */}
      <nav style={{display:'flex',padding:'0 24px',background:G.bg2,borderBottom:`1px solid ${G.border}`}}>
        {Object.entries(navLabels).map(([id,label])=>(
          <button key={id} onClick={()=>setNav(id)} style={{padding:'11px 18px',fontSize:10,letterSpacing:1.5,textTransform:'uppercase',color:nav===id?G.gold:G.muted,border:'none',borderBottom:`2px solid ${nav===id?G.gold:'transparent'}`,background:'transparent',cursor:'pointer'}}>
            {label}
          </button>
        ))}
      </nav>

      {/* MAIN */}
      <main style={{padding:'20px 24px'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:300,letterSpacing:2}}>{navLabels[nav]}</div>
          <div style={{display:'flex',gap:4}}>
            {[['7','7D'],['30','30D'],['90','90D']].map(([v,l])=>(
              <button key={v} onClick={()=>setPeriod(v)} style={{padding:'5px 13px',fontSize:10,letterSpacing:1,textTransform:'uppercase',border:`1px solid ${period===v?G.gold:G.border}`,background:period===v?'rgba(179,151,97,.1)':'transparent',color:period===v?G.gold:G.muted,cursor:'pointer',borderRadius:2}}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* ── OVERVIEW ── */}
        {nav==='overview' && (<>
          {/* KPIs */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:16}}>
            {[
              { label:'Investimento Total', value: metaL?'…':fmt(totalSpend),   delta:`ROAS ${roas.toFixed(1)}x`,                          positive:true,  hi:true  },
              { label:'Alcance',            value: metaL?'…':fmtK(totalReach),  delta:`${fmtK(metaTotals.impressions||0)} impressões`,      positive:true,  hi:false },
              { label:'Resultados Meta',    value: metaL?'…':String(totalResults), delta:`CTR ${((metaTotals.ctr||0)).toFixed(1)}%`,        positive:true,  hi:false },
              { label:'Custo por Resultado',value: metaL?'…':fmt(avgCPR),       delta:`${fmtK(ga4Totals.sessions||0)} sessões GA4`,        positive:true,  hi:false },
            ].map(k=>(
              <div key={k.label} style={{background:G.bg2,border:`1px solid ${G.border}`,borderRadius:3,padding:'16px 18px',borderTop:`2px solid ${k.hi?G.orange:G.goldD}`}}>
                <div style={{fontSize:9,letterSpacing:1.5,textTransform:'uppercase',color:G.muted,marginBottom:8}}>{k.label}</div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:300,color:k.hi?G.orange:G.gold}}>{k.value}</div>
                <div style={{fontSize:10,color:k.positive?G.green:G.red,marginTop:6}}>{k.delta}</div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
            <Panel>
              <PHdr title="Investimento Diário Meta Ads" badge="Dados reais" />
              {metaL ? <Spin /> : (
                <ResponsiveContainer width="100%" height={110}>
                  <BarChart data={dailyChart} barSize={5}>
                    <XAxis dataKey="day" tick={{fill:'#444',fontSize:9}} tickLine={false} axisLine={false} interval={4}/>
                    <YAxis hide/><Tooltip content={<CTip/>}/>
                    <Bar dataKey="meta" fill={G.meta} radius={[2,2,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              )}
              <div style={{display:'flex',gap:14,marginTop:8}}>
                <span style={{display:'flex',alignItems:'center',gap:5,fontSize:10,color:G.muted}}><span style={{width:8,height:8,background:G.meta,borderRadius:1,display:'inline-block'}}/> Meta Ads · {fmt(totalSpend)}</span>
              </div>
            </Panel>

            <Panel>
              <PHdr title="Distribuição Meta Ads" badge="Campanhas ativas"/>
              {metaL ? <Spin /> : (
                <>
                  <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                    <thead><tr><TH>Campanha</TH><TH right>Gasto</TH><TH right>Result.</TH><TH right>CPR</TH></tr></thead>
                    <tbody>{campaigns.slice(0,4).map((c,i)=>(
                      <tr key={i}>
                        <TD><span style={{fontSize:11,color:G.goldL}}>{c.name?.substring(0,22)}{c.name?.length>22?'…':''}</span></TD>
                        <TD right>{fmt(c.spend)}</TD>
                        <TD right>{c.results}</TD>
                        <TD right>{fmt(c.cpr)}</TD>
                      </tr>
                    ))}</tbody>
                  </table>
                  <div style={{marginTop:14,display:'flex',alignItems:'center',gap:10}}>
                    <PieChart width={60} height={60}>
                      <Pie data={campaigns.slice(0,4).map(c=>({name:c.name,value:c.spend}))} cx={28} cy={28} innerRadius={18} outerRadius={28} dataKey="value" strokeWidth={0}>
                        {campaigns.slice(0,4).map((_,i)=><Cell key={i} fill={[G.meta,'#1a6fd4','#1560bb','#0d4a99'][i%4]}/>)}
                      </Pie>
                    </PieChart>
                    <div style={{fontSize:10,color:G.muted}}>Total: {fmt(totalSpend)} · {totalResults} resultados</div>
                  </div>
                </>
              )}
            </Panel>
          </div>

          {/* Funnel + GA4 */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:10,marginBottom:10}}>
            <Panel>
              <PHdr title="Funil · Meta Ads" badge="Dados reais"/>
              {metaL ? <Spin /> : <FunnelChart/>}
            </Panel>
            <Panel>
              <PHdr title="Comportamento · GA4" badge="Property 425809468"/>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:14}}>
                {[
                  { l:'Sessões',         v: ga4L?'…': fmtK(ga4Totals.sessions||0)     },
                  { l:'Tx. Engajamento', v: ga4L?'…': `${((ga4Totals.engagementRate||0)*100).toFixed(0)}%` },
                  { l:'Conversões',      v: ga4L?'…': String(ga4Totals.conversions||0) },
                ].map(m=>(
                  <div key={m.l} style={{background:G.bg3,border:`1px solid ${G.border}`,borderRadius:3,padding:11}}>
                    <div style={{fontSize:9,color:G.muted,letterSpacing:1,textTransform:'uppercase',marginBottom:5}}>{m.l}</div>
                    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:G.gold,fontWeight:300}}>{m.v}</div>
                  </div>
                ))}
              </div>
              <div style={{fontSize:10,color:G.muted,letterSpacing:1.5,textTransform:'uppercase',marginBottom:10}}>Páginas mais acessadas</div>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                <thead><tr><TH>Página</TH><TH right>Sessões</TH><TH right>Engaj.</TH><TH right>Conv.</TH></tr></thead>
                <tbody>
                  {ga4L ? <tr><td colSpan={4}><Spin/></td></tr>
                        : ga4Pages.slice(0,5).map((p,i)=>(
                    <tr key={i}>
                      <TD gold>{p.page}</TD>
                      <TD right>{p.sessions?.toLocaleString('pt-BR')}</TD>
                      <TD right>{((p.engagementRate||0)*100).toFixed(0)}%</TD>
                      <TD right><Pill v={String(p.conversions||0)} type="up"/></TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          </div>

          {/* Campaigns */}
          <Panel>
            <PHdr title="Campanhas Meta Ads · Dados Reais" badge="act_1359151465123137" bc={G.meta}/>
            {metaL ? <Spin /> : (
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                <thead><tr><TH>Campanha</TH><TH>Plat.</TH><TH right>Gasto</TH><TH right>Impr.</TH><TH right>Cliques</TH><TH right>CTR</TH><TH right>Result.</TH><TH right>CPR</TH><TH right>Status</TH></tr></thead>
                <tbody>{campaigns.map((c,i)=>(
                  <tr key={i}>
                    <TD>{c.name}</TD>
                    <TD><PDot p="Meta"/></TD>
                    <TD right>{fmt(c.spend)}</TD>
                    <TD right muted>{fmtK(c.impressions)}</TD>
                    <TD right muted>{fmtK(c.clicks)}</TD>
                    <TD right>{c.ctr?.toFixed(1)}%</TD>
                    <TD right>{c.results}</TD>
                    <TD right>{fmt(c.cpr)}</TD>
                    <TD right><SPill s={c.status}/></TD>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </Panel>
        </>)}

        {/* ── META ADS ── */}
        {nav==='meta' && (<>
          <div style={{fontSize:10,color:G.muted,marginBottom:14,paddingBottom:10,borderBottom:`1px solid ${G.border}`}}>Meta Ads · act_1359151465123137 · Dados reais</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:16}}>
            {[
              { l:'Gasto Total',   v: metaL?'…':fmt(totalSpend)        },
              { l:'Alcance',       v: metaL?'…':fmtK(totalReach)       },
              { l:'Resultados',    v: metaL?'…':String(totalResults)   },
              { l:'CPR',           v: metaL?'…':fmt(avgCPR)            },
            ].map(m=>(
              <div key={m.l} style={{background:G.bg2,border:`1px solid ${G.border}`,borderRadius:3,padding:'16px 18px',borderTop:`2px solid ${G.meta}`}}>
                <div style={{fontSize:9,letterSpacing:1.5,textTransform:'uppercase',color:G.muted,marginBottom:8}}>{m.l}</div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:300,color:G.meta}}>{m.v}</div>
              </div>
            ))}
          </div>
          <Panel>
            <PHdr title="Campanhas Meta Ads" badge="Facebook · Instagram" bc={G.meta}/>
            {metaL ? <Spin /> : (
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                <thead><tr><TH>Campanha</TH><TH right>Gasto</TH><TH right>Impr.</TH><TH right>Cliques</TH><TH right>CTR</TH><TH right>Result.</TH><TH right>CPR</TH><TH right>ROAS</TH></tr></thead>
                <tbody>{campaigns.map((c,i)=>(
                  <tr key={i}>
                    <TD>{c.name}</TD>
                    <TD right>{fmt(c.spend)}</TD>
                    <TD right muted>{fmtK(c.impressions)}</TD>
                    <TD right muted>{fmtK(c.clicks)}</TD>
                    <TD right>{c.ctr?.toFixed(1)}%</TD>
                    <TD right>{c.results}</TD>
                    <TD right>{fmt(c.cpr)}</TD>
                    <TD right><Pill v={c.spend>0?`${((c.results*150)/c.spend).toFixed(1)}x`:'—'} type="up"/></TD>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </Panel>
          <div style={{marginTop:10}}>
            <Panel>
              <PHdr title="Investimento Diário" badge="Meta Ads"/>
              {metaL ? <Spin /> : (
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={dailyChart} barSize={8}>
                    <XAxis dataKey="day" tick={{fill:'#444',fontSize:9}} tickLine={false} axisLine={false} interval={3}/>
                    <YAxis hide/><Tooltip content={<CTip/>}/>
                    <Bar dataKey="meta" fill={G.meta} radius={[2,2,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Panel>
          </div>
        </>)}

        {/* ── GOOGLE ADS ── */}
        {nav==='google' && (
          <Panel>
            <PHdr title="Google Ads" badge="830-593-5209" bc={G.google}/>
            <div style={{padding:'20px 0',color:G.muted,fontSize:13,textAlign:'center'}}>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:G.goldD,marginBottom:8}}>Em breve</div>
              Integração com Google Ads API via Developer Token — solicitação em andamento.
            </div>
          </Panel>
        )}

        {/* ── ANALYTICS ── */}
        {nav==='analytics' && (<>
          <div style={{fontSize:10,color:G.muted,marginBottom:14,paddingBottom:10,borderBottom:`1px solid ${G.border}`}}>Google Analytics 4 · Property ID: 425809468 · theviewbar.com.br · Dados reais</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:16}}>
            {[
              { l:'Sessões',         v: ga4L?'…':fmtK(ga4Totals.sessions||0)                    },
              { l:'Tx. Engajamento', v: ga4L?'…':`${((ga4Totals.engagementRate||0)*100).toFixed(0)}%` },
              { l:'Conversões',      v: ga4L?'…':String(ga4Totals.conversions||0)               },
              { l:'Páginas',         v: ga4L?'…':String(ga4Pages.length)                        },
            ].map(m=>(
              <div key={m.l} style={{background:G.bg2,border:`1px solid ${G.border}`,borderRadius:3,padding:'16px 18px',borderTop:`2px solid ${G.goldD}`}}>
                <div style={{fontSize:9,letterSpacing:1.5,textTransform:'uppercase',color:G.muted,marginBottom:8}}>{m.l}</div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:300,color:G.gold}}>{m.v}</div>
              </div>
            ))}
          </div>
          <Panel>
            <PHdr title="Páginas mais acessadas" badge="GA4 · Dados Reais"/>
            {ga4L ? <Spin /> : (
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                <thead><tr><TH>Página</TH><TH right>Sessões</TH><TH right>Engajamento</TH><TH right>Conversões</TH><TH right>Tx. Conv.</TH></tr></thead>
                <tbody>{ga4Pages.map((p,i)=>(
                  <tr key={i}>
                    <TD gold>{p.page}</TD>
                    <TD right>{p.sessions?.toLocaleString('pt-BR')}</TD>
                    <TD right>{((p.engagementRate||0)*100).toFixed(0)}%</TD>
                    <TD right><Pill v={String(p.conversions||0)} type="up"/></TD>
                    <TD right muted>{p.sessions>0?((p.conversions/p.sessions)*100).toFixed(1)+'%':'—'}</TD>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </Panel>
        </>)}

        {/* ── FUNNEL ── */}
        {nav==='funnel' && (
          <Panel>
            <PHdr title="Funil Completo · Dados Reais" badge="Meta + GA4"/>
            <div style={{maxWidth:520,margin:'0 auto'}}>
              {metaL ? <Spin /> : <FunnelChart/>}
              <div style={{marginTop:24,padding:18,background:G.bg3,borderRadius:3,border:`1px solid ${G.border}`}}>
                <div style={{fontSize:10,color:G.muted,letterSpacing:1.5,textTransform:'uppercase',marginBottom:14}}>Métricas Estratégicas · Dados Reais</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
                  {[
                    { l:'CAC',      v: metaL?'…':fmt(avgCPR),           n:'Custo de Aquisição'  },
                    { l:'ROAS',     v: metaL?'…':`${roas.toFixed(1)}x`, n:'Retorno sobre Gasto' },
                    { l:'Sessões',  v: ga4L?'…':fmtK(ga4Totals.sessions||0), n:'GA4 · Período'  },
                  ].map(m=>(
                    <div key={m.l} style={{textAlign:'center'}}>
                      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,color:G.gold,fontWeight:300}}>{m.v}</div>
                      <div style={{fontSize:11,color:G.text,marginTop:2}}>{m.l}</div>
                      <div style={{fontSize:9,color:G.muted,marginTop:2}}>{m.n}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Panel>
        )}
      </main>

      <footer style={{padding:'12px 24px',borderTop:`1px solid ${G.border}`,display:'flex',alignItems:'center',justifyContent:'space-between',background:G.bg2,marginTop:6}}>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:13,color:G.goldD,letterSpacing:2}}>THE VIEW · Dashboard</div>
        <div style={{display:'flex',gap:18,alignItems:'center'}}>
          <span style={{fontSize:10,color:G.muted}}>Meta: act_1359151465123137</span>
          <span style={{fontSize:10,color:G.muted}}>GA4: 425809468</span>
          <span style={{fontSize:10,color:G.goldD,border:`1px solid ${G.border}`,padding:'2px 8px',borderRadius:2}}>v2.0.0</span>
        </div>
      </footer>
    </div>
  )
}
