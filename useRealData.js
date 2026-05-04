// src/useRealData.js
// Hook para buscar dados reais das Serverless Functions

import { useState, useEffect } from 'react'

const BASE = ''  // mesmo domínio no Vercel

export function useGA4Data(period) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    setLoading(true)
    fetch(`${BASE}/api/ga4?period=${period}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [period])

  return { data, loading, error }
}

export function useGoogleAdsData(period) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    setLoading(true)
    fetch(`${BASE}/api/google-ads?period=${period}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [period])

  return { data, loading, error }
}
