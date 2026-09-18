'use client'

import { useState, useEffect } from 'react'

type User = { id: number; name: string | null; email: string; createdAt: string }

export default function Home() {
  const [users, setUsers] = useState<User[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const fetchUsers = async () => {
    const res = await fetch('/api/users')
    setUsers(await res.json())
  }

  useEffect(() => { fetchUsers() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    })
    setName('')
    setEmail('')
    await fetchUsers()
    setLoading(false)
  }

  return (
    <main style={{ maxWidth: 600, margin: '0 auto', padding: '3rem 1rem', fontFamily: 'sans-serif' }}>

<h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Utilisateurs</h1>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
        <input
          type="text"
          placeholder="Nom"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ddd', fontSize: '1rem' }}
        />
        <input
          type="email"
          placeholder="Email *"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ddd', fontSize: '1rem' }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: '#f472b6',
            color: 'white',
            fontWeight: '600',
            fontSize: '1rem',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Enregistrement...' : 'Ajouter'}
        </button>
      </form>

      {/* Liste */}
      {users.length === 0 ? (
        <p style={{ color: '#888' }}>Aucun utilisateur pour l'instant.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {users.map(user => (
            <li key={user.id} style={{
              padding: '1rem',
              borderRadius: '0.75rem',
              border: '1px solid #eee',
              backgroundColor: '#fafafa',
            }}>
              <p style={{ fontWeight: '600', margin: 0 }}>{user.name || '(sans nom)'}</p>
              <p style={{ color: '#666', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>{user.email}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
