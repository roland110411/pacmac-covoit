'use client'

import { useState, useEffect, useCallback } from 'react'

type ApiResult = {
  id: string
  title: string
  emoji: string
  color: string
  source: string
  loading: boolean
  text: string | null
  image: string | null
}

const APIS = [
  { id: 'cat',    title: 'Chat aléatoire',  emoji: '🐱', color: '#f472b6', source: 'cataas.com' },
  { id: 'dog',    title: 'Chien aléatoire', emoji: '🐶', color: '#fb923c', source: 'dog.ceo' },
  { id: 'bored',  title: 'Idée activité',   emoji: '🎯', color: '#a78bfa', source: 'appbrewery.com' },
  { id: 'chuck',  title: 'Chuck Norris',    emoji: '💪', color: '#ef4444', source: 'chucknorris.io' },
  { id: 'joke',   title: 'Blague',          emoji: '😂', color: '#facc15', source: 'official-joke-api' },
  { id: 'kanye',  title: 'Kanye West',      emoji: '🎤', color: '#111',    source: 'kanye.rest' },
  { id: 'yesno',  title: 'Oui ou Non ?',    emoji: '🎲', color: '#22c55e', source: 'yesno.wtf' },
  { id: 'advice', title: 'Conseil de vie',  emoji: '🧠', color: '#0ea5e9', source: 'adviceslip.com' },
]

async function callApi(id: string): Promise<{ text: string | null; image: string | null }> {
  const r = await fetch(`/api/fun?id=${id}`)
  const d = await r.json()
  return { text: d.text ?? null, image: d.image ?? null }
}

export default function FunPage() {
  const [results, setResults] = useState<ApiResult[]>(
    APIS.map(a => ({ ...a, loading: true, text: null, image: null }))
  )

  const fetchOne = useCallback(async (id: string) => {
    setResults(prev => prev.map(r => r.id === id ? { ...r, loading: true, text: null, image: null } : r))
    const data = await callApi(id)
    setResults(prev => prev.map(r => r.id === id ? { ...r, loading: false, ...data } : r))
  }, [])

  const fetchAll = useCallback(() => {
    APIS.forEach(a => fetchOne(a.id))
  }, [fetchOne])

  useEffect(() => { fetchAll() }, [fetchAll])

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1rem', fontFamily: 'sans-serif' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800' }}>APIs rigolotes 🎉</h1>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '0.85rem' }}>
            Traduit en 🇫🇷 français et 🏴 breton côté serveur
          </p>
        </div>
        <button onClick={fetchAll} style={{
          backgroundColor: '#111', color: 'white', border: 'none',
          borderRadius: '0.75rem', padding: '0.75rem 1.5rem',
          fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer',
        }}>
          🔄 Rafraîchir tout
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        {results.map(item => (
          <div key={item.id} style={{
            backgroundColor: 'white', borderRadius: '1rem',
            border: `2px solid ${item.color}22`, padding: '1.25rem',
            minHeight: 180, display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.3rem' }}>{item.emoji}</span>
                <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{item.title}</span>
              </div>
              <button onClick={() => fetchOne(item.id)} title="Rafraîchir"
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', opacity: 0.5 }}>
                🔄
              </button>
            </div>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {item.loading ? (
                <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Traduction en cours...</span>
              ) : item.image ? (
                <div style={{ textAlign: 'center' }}>
                  <img src={item.image} alt={item.title}
                    style={{ maxHeight: 150, maxWidth: '100%', borderRadius: '0.5rem', objectFit: 'cover' }} />
                  {item.text && <p style={{ margin: '8px 0 0', fontSize: '0.85rem', fontWeight: '600', color: item.color }}>{item.text}</p>}
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-line', textAlign: 'center' }}>
                  {item.text}
                </p>
              )}
            </div>

            <span style={{
              marginTop: '0.75rem', padding: '3px 10px', borderRadius: 999,
              fontSize: '0.7rem', fontWeight: '600', alignSelf: 'flex-start',
              backgroundColor: `${item.color}18`, color: item.color,
            }}>
              {item.source}
            </span>
          </div>
        ))}
      </div>
    </main>
  )
}
