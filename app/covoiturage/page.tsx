'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

type Passager = { id: number; nom: string; createdAt: string }
type Chauffeur = { id: number; nom: string; depart: string | null; arrivee: string | null; capacite: number; special: boolean; createdAt: string; passagers: Passager[] }

// ─── Section passagers orphelins ───────────────────────────────────────────
function SectionOrphelins({ orphelins, chauffeurs, onRefresh }: {
  orphelins: Passager[]
  chauffeurs: Chauffeur[]
  onRefresh: () => void
}) {
  if (orphelins.length === 0) return null

  const noms = orphelins.map(p => p.nom).join(', ')

  return (
    <div style={{ background: '#fff7ed', border: '2px solid #fb923c', borderRadius: 16, padding: '14px 16px', marginBottom: 16 }}>
      <p style={{ margin: '0 0 8px', fontWeight: 800, fontSize: 14, color: '#c2410c' }}>
        ⚠️ Attention — {orphelins.length > 1 ? 'les champions' : 'le champion'} <strong>{noms}</strong> {orphelins.length > 1 ? "n'ont" : "n'a"} plus de pilote !
      </p>
      <p style={{ margin: '0 0 10px', fontSize: 12, color: '#9a3412' }}>
        Glisse-les dans une voiture disponible 👇
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {orphelins.map(p => (
          <PassagerDraggable key={p.id} passager={p} onRefresh={onRefresh} onDelete={async () => {
            await fetch('/api/passagers/orphelins', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ passagerId: p.id }),
            })
            onRefresh()
          }} />
        ))}
      </div>
    </div>
  )
}

function PassagerDraggable({ passager, onRefresh, onDelete }: { passager: Passager; onRefresh: () => void; onDelete: () => void }) {
  const isDragging = useRef(false)

  return (
    <div style={{ position: 'relative' }}>
      <div
        draggable
        onDragStart={e => {
          isDragging.current = true
          e.dataTransfer.setData('passagerId', String(passager.id))
          e.dataTransfer.effectAllowed = 'move'
        }}
        onDragEnd={() => { isDragging.current = false }}
        style={{
          padding: '8px 24px 8px 14px', borderRadius: 999, fontSize: 14, fontWeight: 700,
          background: '#fed7aa', color: '#9a3412', border: '2px dashed #fb923c',
          cursor: 'grab', userSelect: 'none', touchAction: 'none',
        }}
      >
        🏃 {passager.nom}
      </div>
      <button onClick={onDelete}
        style={{ position: 'absolute', top: -4, right: -4, width: 17, height: 17, borderRadius: '50%', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
    </div>
  )
}

// ─── Carte "Par mes propres moyens" ────────────────────────────────────────
function CarteSansVehicule({ c, onRefresh }: { c: Chauffeur; onRefresh: () => void }) {
  const [nom, setNom] = useState('')
  const [loading, setLoading] = useState(false)

  const rejoindre = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nom.trim()) return
    setLoading(true)
    await fetch(`/api/chauffeurs/${c.id}/passagers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom }),
    })
    setNom(''); setLoading(false); onRefresh()
  }

  const retirer = async (passagerId: number) => {
    await fetch(`/api/chauffeurs/${c.id}/passagers`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passagerId }),
    })
    onRefresh()
  }

  return (
    <div style={{ background: '#bbf7d0', borderRadius: 16, border: '2px solid #16a34a', padding: '12px 14px', marginBottom: 16 }}>
      <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: '#92400e' }}>
        🚶 Par mes propres moyens — {c.passagers.length} champion{c.passagers.length !== 1 ? 's' : ''}
      </p>
      <form onSubmit={rejoindre} style={{ display: 'flex', gap: 8, marginBottom: c.passagers.length ? 10 : 0 }}>
        <input value={nom} onChange={e => setNom(e.target.value)} placeholder="Votre nom..."
          style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: '1px solid #fcd34d', fontSize: 15 }} />
        <button type="submit" disabled={loading}
          style={{ background: '#f59e0b', color: 'white', border: 'none', borderRadius: 10, padding: '10px 16px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
          {loading ? '...' : '+'}
        </button>
      </form>
      {c.passagers.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {c.passagers.map(p => (
            <div key={p.id} style={{ position: 'relative' }}>
              <span style={{ padding: '5px 12px', borderRadius: 999, fontSize: 13, background: '#fef3c7', color: '#92400e', fontWeight: 600 }}>
                🚶 {p.nom}
              </span>
              <button onClick={() => retirer(p.id)}
                style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Carte chauffeur ────────────────────────────────────────────────────────
function CarteChaufeur({ c, onRefresh }: { c: Chauffeur; onRefresh: () => void }) {
  const [nomPassager, setNomPassager] = useState('')
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [confirmSuppr, setConfirmSuppr] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState({ nom: c.nom, depart: c.depart || '', arrivee: c.arrivee || '' })
  const plein = c.passagers.length >= c.capacite
  const pct = Math.round((c.passagers.length / c.capacite) * 100)

  const sauvegarder = async () => {
    if (!editForm.nom.trim()) return
    await fetch(`/api/chauffeurs/${c.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    setEditMode(false); onRefresh()
  }

  const ajouterPassager = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nomPassager.trim()) return
    setLoading(true); setErreur('')
    const r = await fetch(`/api/chauffeurs/${c.id}/passagers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom: nomPassager }),
    })
    const d = await r.json()
    if (!r.ok) { setErreur(d.error); setLoading(false); return }
    setNomPassager(''); setLoading(false); onRefresh()
  }

  const supprimerPassager = async (passagerId: number) => {
    await fetch(`/api/chauffeurs/${c.id}/passagers`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passagerId }),
    })
    onRefresh()
  }

  const supprimerChauffeur = async () => {
    await fetch(`/api/chauffeurs/${c.id}`, { method: 'DELETE' })
    setConfirmSuppr(false)
    onRefresh()
  }

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const passagerId = parseInt(e.dataTransfer.getData('passagerId'))
    if (!passagerId) return
    const r = await fetch(`/api/passagers/${passagerId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chauffeurId: c.id }),
    })
    if (!r.ok) {
      const d = await r.json()
      setErreur(d.error)
    }
    onRefresh()
  }

  const sieges = Array.from({ length: c.capacite }, (_, i) => c.passagers[i] || null)

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      style={{
        background: dragOver ? '#eff6ff' : 'white',
        borderRadius: 18,
        border: `2px solid ${dragOver ? '#3b82f6' : plein ? '#fca5a5' : '#bfdbfe'}`,
        overflow: 'hidden', marginBottom: 14,
        transition: 'border-color 0.2s, background 0.2s',
        boxShadow: dragOver ? '0 0 0 4px #bfdbfe' : 'none',
      }}
    >
      {/* Header */}
      <div style={{ background: dragOver ? '#dbeafe' : plein ? '#fef2f2' : '#eff6ff', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: plein ? '#fca5a5' : '#93c5fd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🚗</div>
          <div style={{ flex: 1 }}>
            {editMode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <input value={editForm.nom} onChange={e => setEditForm(f => ({ ...f, nom: e.target.value }))}
                  style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #93c5fd', fontSize: 14, fontWeight: 700 }} />
                <input value={editForm.depart} onChange={e => setEditForm(f => ({ ...f, depart: e.target.value }))}
                  placeholder="📍 Départ" style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13 }} />
                <input value={editForm.arrivee} onChange={e => setEditForm(f => ({ ...f, arrivee: e.target.value }))}
                  placeholder="🏁 Arrivée" style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13 }} />
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => setEditMode(false)}
                    style={{ flex: 1, padding: '6px', borderRadius: 8, border: '1px solid #d1d5db', background: 'white', fontSize: 12, cursor: 'pointer' }}>Annuler</button>
                  <button onClick={sauvegarder}
                    style={{ flex: 1, padding: '6px', borderRadius: 8, border: 'none', background: '#1d4ed8', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>✓ OK</button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: 16 }}>{c.nom}</p>
                  <button onClick={() => { setEditForm({ nom: c.nom, depart: c.depart || '', arrivee: c.arrivee || '' }); setEditMode(true) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, padding: 0, lineHeight: 1, opacity: 0.5 }}>✏️</button>
                </div>
                {(c.depart || c.arrivee) && (
                  <p style={{ margin: '3px 0 0', fontSize: 13, color: '#6b7280' }}>
                    {c.depart && `📍 ${c.depart}`}{c.depart && c.arrivee && ' → '}{c.arrivee}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ padding: '5px 12px', borderRadius: 999, fontSize: 13, fontWeight: 700, background: plein ? '#fee2e2' : '#dbeafe', color: plein ? '#dc2626' : '#1d4ed8', whiteSpace: 'nowrap' }}>
            {plein ? '🔴 Complet' : `${c.passagers.length}/${c.capacite}`}
          </span>
          <button onClick={() => setConfirmSuppr(true)}
            style={{ width: 30, height: 30, borderRadius: '50%', background: '#fee2e2', border: 'none', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            🗑️
          </button>
        </div>
      </div>

      {/* Confirmation suppression */}
      {confirmSuppr && (
        <div style={{ background: '#fef2f2', padding: '10px 16px', borderBottom: '1px solid #fca5a5' }}>
          <p style={{ margin: '0 0 8px', fontSize: 13, color: '#991b1b', fontWeight: 600 }}>
            Supprimer {c.nom} ?{c.passagers.length > 0 ? ` (${c.passagers.length} champion${c.passagers.length > 1 ? 's' : ''} sans pilote)` : ''}
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setConfirmSuppr(false)}
              style={{ flex: 1, padding: '8px', borderRadius: 10, border: '1px solid #d1d5db', background: 'white', cursor: 'pointer', fontSize: 13 }}>
              Annuler
            </button>
            <button onClick={supprimerChauffeur}
              style={{ flex: 1, padding: '8px', borderRadius: 10, border: 'none', background: '#dc2626', color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
              Supprimer
            </button>
          </div>
        </div>
      )}

      {dragOver && (
        <div style={{ padding: '8px 16px', background: '#dbeafe', textAlign: 'center', fontSize: 13, color: '#1d4ed8', fontWeight: 600 }}>
          📥 Dépose ici pour rejoindre {c.nom}
        </div>
      )}

      <div style={{ padding: '14px 16px' }}>
        {/* Barre */}
        <div style={{ height: 6, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden', marginBottom: 12 }}>
          <div style={{ height: '100%', borderRadius: 99, width: `${pct}%`, background: plein ? '#ef4444' : '#3b82f6', transition: 'width 0.4s' }} />
        </div>

        {/* Sièges */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 12 }}>
          {sieges.map((p, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', borderRadius: 10,
                background: p ? '#dcfce7' : '#f9fafb', border: `1px solid ${p ? '#86efac' : '#e5e7eb'}`,
                fontSize: 14, color: p ? '#15803d' : '#9ca3af', fontWeight: p ? 600 : 400,
              }}>
                <span style={{ fontSize: 16 }}>{p ? '🧑' : '💺'}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p ? p.nom : 'Libre'}</span>
              </div>
              {p && (
                <button onClick={() => supprimerPassager(p.id)}
                  style={{ position: 'absolute', top: -5, right: -5, width: 18, height: 18, borderRadius: '50%', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              )}
            </div>
          ))}
        </div>

        {!plein && (
          <form onSubmit={ajouterPassager} style={{ display: 'flex', gap: 8 }}>
            <input value={nomPassager} onChange={e => setNomPassager(e.target.value)} placeholder="Votre nom..."
              style={{ flex: 1, padding: '12px 14px', borderRadius: 12, border: '1px solid #d1d5db', fontSize: 15 }} />
            <button type="submit" disabled={loading}
              style={{ background: '#1d4ed8', color: 'white', border: 'none', borderRadius: 12, padding: '12px 18px', cursor: 'pointer', fontSize: 15, fontWeight: 700 }}>
              {loading ? '...' : '+'}
            </button>
          </form>
        )}
        {erreur && <p style={{ margin: '6px 0 0', fontSize: 13, color: '#dc2626' }}>{erreur}</p>}
      </div>
    </div>
  )
}

// ─── Formulaire chauffeur ───────────────────────────────────────────────────
function FormulaireChaufeur({ onRefresh }: { onRefresh: () => void }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ nom: '', depart: '', arrivee: '', capacite: '4' })
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/chauffeurs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setForm({ nom: '', depart: '', arrivee: '', capacite: '4' })
    setLoading(false); setOpen(false); onRefresh()
  }

  if (!open) return (
    <button onClick={() => setOpen(true)} style={{
      width: '100%', padding: 16, borderRadius: 16, border: '2px dashed #d1d5db',
      background: 'white', fontSize: 16, fontWeight: 700, color: '#374151', cursor: 'pointer',
    }}>
      🚗 Je suis pilote
    </button>
  )

  return (
    <div style={{ background: 'white', borderRadius: 18, border: '1px solid #e5e7eb', padding: 16 }}>
      <p style={{ margin: '0 0 14px', fontWeight: 700, fontSize: 16 }}>🚗 Je suis pilote</p>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
          placeholder="Votre nom *" required
          style={{ padding: '13px 14px', borderRadius: 12, border: '1px solid #d1d5db', fontSize: 15 }} />
        <input value={form.depart} onChange={e => setForm(f => ({ ...f, depart: e.target.value }))}
          placeholder="📍 Départ *" required
          style={{ padding: '13px 14px', borderRadius: 12, border: '1px solid #d1d5db', fontSize: 15 }} />
        <input value={form.arrivee} onChange={e => setForm(f => ({ ...f, arrivee: e.target.value }))}
          placeholder="🏁 Arrivée *" required
          style={{ padding: '13px 14px', borderRadius: 12, border: '1px solid #d1d5db', fontSize: 15 }} />
        <select value={form.capacite} onChange={e => setForm(f => ({ ...f, capacite: e.target.value }))}
          style={{ padding: '13px 14px', borderRadius: 12, border: '1px solid #d1d5db', fontSize: 15, background: 'white' }}>
          {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>👥 {n} champion{n > 1 ? 's' : ''}</option>)}
        </select>


        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={() => setOpen(false)}
            style={{ flex: 1, padding: 14, borderRadius: 12, border: '1px solid #d1d5db', background: 'white', fontSize: 15, cursor: 'pointer', color: '#6b7280' }}>
            Annuler
          </button>
          <button type="submit" disabled={loading}
            style={{ flex: 2, padding: 14, borderRadius: 12, border: 'none', background: '#16a34a', color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
            {loading ? '...' : '✓ Proposer'}
          </button>
        </div>
      </form>
    </div>
  )
}

// ─── Page principale ────────────────────────────────────────────────────────
function ModalNotifChampion({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ nom: '', phone: '', wabotKey: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setLoading(false); setDone(true)
    setTimeout(onClose, 2000)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
      <div style={{ position: 'relative', background: 'white', borderRadius: '20px 20px 0 0', padding: '24px 20px 40px', maxWidth: 430, width: '100%', margin: '0 auto' }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: '#d1d5db', margin: '0 auto 20px' }} />
        <p style={{ margin: '0 0 6px', fontWeight: 800, fontSize: 17 }}>🔔 Me notifier si mon pilote annule</p>
        <p style={{ margin: '0 0 16px', fontSize: 13, color: '#6b7280' }}>
          Tu recevras un WhatsApp si ton pilote supprime sa voiture.
        </p>
        <div style={{ background: '#f0fdf4', borderRadius: 12, padding: 12, marginBottom: 14, fontSize: 12, color: '#166534' }}>
          1. Enregistre <strong>+34 644 60 09 64</strong> (CallMeBot) dans tes contacts<br />
          2. Envoie-lui : <strong>I allow callmebot to send me messages</strong><br />
          3. Copie la clé API reçue ci-dessous
        </div>
        {done ? (
          <p style={{ textAlign: 'center', fontSize: 16, color: '#16a34a', fontWeight: 700 }}>✅ Enregistré !</p>
        ) : (
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
              placeholder="Ton nom (tel qu'inscrit dans la voiture) *" required
              style={{ padding: '13px 14px', borderRadius: 12, border: '1px solid #d1d5db', fontSize: 15 }} />
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="📱 Ton numéro (ex: 33612345678)" type="tel" required
              style={{ padding: '13px 14px', borderRadius: 12, border: '1px solid #d1d5db', fontSize: 15 }} />
            <input value={form.wabotKey} onChange={e => setForm(f => ({ ...f, wabotKey: e.target.value }))}
              placeholder="🔑 Clé API CallMeBot" required
              style={{ padding: '13px 14px', borderRadius: 12, border: '1px solid #d1d5db', fontSize: 15 }} />
            <button type="submit" disabled={loading}
              style={{ padding: 14, borderRadius: 12, border: 'none', background: '#16a34a', color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
              {loading ? '...' : '✓ Enregistrer'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default function CovoituragePage() {
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([])
  const [orphelins, setOrphelins] = useState<Passager[]>([])
  const [showNotifModal, setShowNotifModal] = useState(false)

  const refresh = useCallback(async () => {
    const [rC, rO] = await Promise.all([
      fetch('/api/chauffeurs'),
      fetch('/api/passagers/orphelins'),
    ])
    setChauffeurs(await rC.json())
    setOrphelins(await rO.json())
  }, [])

  useEffect(() => { refresh() }, [refresh])

  useEffect(() => {
    const init = async () => {
      const r = await fetch('/api/chauffeurs')
      const data: Chauffeur[] = await r.json()
      if (!data.find(c => c.special)) {
        await fetch('/api/chauffeurs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nom: 'Par mes propres moyens', capacite: 99, special: true }),
        })
        refresh()
      }
    }
    init()
  }, [refresh])

  const special = chauffeurs.find(c => c.special)
  const normaux = chauffeurs.filter(c => !c.special)
  const totalPassagers = normaux.reduce((a, c) => a + c.passagers.length, 0)
  const placesRestantes = normaux.reduce((a, c) => a + Math.max(0, c.capacite - c.passagers.length), 0)

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', minHeight: '100dvh', background: '#f3f4f6', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'white', borderBottom: '1px solid #e5e7eb', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>🚗 PacMac covoit <span style={{ fontSize: 13, fontWeight: 400, color: '#9ca3af' }}>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span></h1>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: '#6b7280' }}>
            {totalPassagers} champion{totalPassagers !== 1 ? 's' : ''} inscrit{totalPassagers !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={() => setShowNotifModal(true)}
          style={{ background: 'none', border: 'none', fontSize: 14, cursor: 'pointer', opacity: 0.5, padding: 4 }}>
          🔔
        </button>
      </div>

      {/* Contenu */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 120px' }}>
        {/* Alerte orphelins */}
        <SectionOrphelins orphelins={orphelins} chauffeurs={normaux} onRefresh={refresh} />

        {/* Sans véhicule */}
        {special && <CarteSansVehicule c={special} onRefresh={refresh} />}

        {/* Véhicules */}
        {normaux.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🚗</div>
            <p style={{ margin: 0, fontSize: 15 }}>Aucun pilote inscrit aujourd'hui.</p>
          </div>
        ) : (
          normaux.map(c => <CarteChaufeur key={c.id} c={c} onRefresh={refresh} />)
        )}
      </div>

      {showNotifModal && <ModalNotifChampion onClose={() => setShowNotifModal(false)} />}

      {/* Bouton flottant */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, padding: '12px 14px 24px', background: 'linear-gradient(to top, #f3f4f6 70%, transparent)', pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'auto' }}>
          <FormulaireChaufeur onRefresh={refresh} />
        </div>
      </div>
    </div>
  )
}
