'use client'

const annees = [2020, 2021, 2022, 2023, 2024, 2025]

const inflation = {
  labels: annees,
  values: [104.61, 105.99, 111.13, 117.61, 119.77, 120.77],
  description: "Indice des prix à la consommation (base 100 = 2015)",
  source: "INSEE — Série BDM 001769682"
}

// Taux d'inflation annuelle calculé
const tauxInflation = inflation.values.map((v, i) =>
  i === 0 ? null : +((v - inflation.values[i - 1]) / inflation.values[i - 1] * 100).toFixed(2)
)

// Taux de chômage officiel INSEE (BIT, France métropolitaine)
const chomage = {
  labels: [2020, 2021, 2022, 2023, 2024, 2025],
  values: [8.0, 7.9, 7.3, 7.3, 7.4, 7.3],
  source: "INSEE — Enquête Emploi (BIT)"
}

// Population France (millions)
const population = {
  labels: [2020, 2021, 2022, 2023, 2024, 2025],
  values: [67.4, 67.6, 67.8, 68.0, 68.2, 68.4],
  source: "INSEE — Bilan démographique"
}

const MAX_BAR = 200

function BarChart({ data, color, unit, format }: {
  data: { labels: number[], values: number[] }
  color: string
  unit: string
  format?: (v: number) => string
}) {
  const max = Math.max(...data.values)
  const min = Math.min(...data.values)
  const range = max - min || 1
  const fmt = format || ((v: number) => v.toString())

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', height: MAX_BAR + 40 }}>
      {data.labels.map((annee, i) => {
        const val = data.values[i]
        const height = 40 + ((val - min) / range) * (MAX_BAR - 40)
        return (
          <div key={annee} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: 4, color }}>{fmt(val)}{unit}</span>
            <div style={{
              width: '100%',
              height,
              backgroundColor: color,
              borderRadius: '6px 6px 0 0',
              opacity: i === data.labels.length - 1 ? 0.6 : 1,
              transition: 'height 0.3s',
            }} />
            <span style={{ fontSize: '0.7rem', color: '#888', marginTop: 6 }}>{annee}</span>
          </div>
        )
      })}
    </div>
  )
}

function EvolutionBadge({ values }: { values: (number | null)[] }) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
      {values.map((v, i) => {
        if (v === null) return null
        const positif = v > 0
        return (
          <span key={i} style={{
            padding: '4px 10px',
            borderRadius: 999,
            fontSize: '0.8rem',
            fontWeight: '600',
            backgroundColor: positif ? '#fee2e2' : '#dcfce7',
            color: positif ? '#dc2626' : '#16a34a',
          }}>
            {annees[i]} {positif ? '▲' : '▼'} {Math.abs(v)}%
          </span>
        )
      })}
    </div>
  )
}

function Card({ title, emoji, source, children }: {
  title: string, emoji: string, source: string, children: React.ReactNode
}) {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '1rem',
      border: '1px solid #e5e7eb',
      padding: '1.5rem',
      marginBottom: '1.5rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>{emoji}</span> {title}
        </h2>
        <span style={{ fontSize: '0.7rem', color: '#9ca3af', textAlign: 'right', maxWidth: 180 }}>{source}</span>
      </div>
      {children}
    </div>
  )
}

export default function InseePage() {
  const chomageEvol = chomage.values.map((v, i) =>
    i === 0 ? null : +((v - chomage.values[i - 1])).toFixed(1)
  )
  const popEvol = population.values.map((v, i) =>
    i === 0 ? null : +((v - population.values[i - 1]) * 1000).toFixed(0)
  )

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1rem', fontFamily: 'sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ width: 40, height: 40, backgroundColor: '#1d4ed8', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>
            IN
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', color: '#111' }}>Tableau de bord INSEE</h1>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>Données économiques France — 2020 à 2025</p>
          </div>
        </div>
      </div>

      {/* Cartes résumé */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Inflation 2024', value: '+1.9%', sub: 'vs 2023', color: '#ef4444', bg: '#fee2e2' },
          { label: 'Chômage 2024', value: '7.4%', sub: 'taux BIT', color: '#f97316', bg: '#ffedd5' },
          { label: 'Population', value: '68.2M', sub: 'habitants', color: '#1d4ed8', bg: '#dbeafe' },
        ].map(c => (
          <div key={c.label} style={{ backgroundColor: c.bg, borderRadius: '0.75rem', padding: '1rem' }}>
            <p style={{ margin: 0, fontSize: '0.75rem', color: c.color, fontWeight: '600' }}>{c.label}</p>
            <p style={{ margin: '4px 0 0', fontSize: '1.6rem', fontWeight: '800', color: c.color }}>{c.value}</p>
            <p style={{ margin: 0, fontSize: '0.7rem', color: c.color, opacity: 0.7 }}>{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Inflation */}
      <Card title="Inflation — Indice des prix à la consommation" emoji="📈" source={inflation.source}>
        <BarChart data={inflation} color="#ef4444" unit="" format={v => v.toFixed(1)} />
        <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '1rem' }}>
          L'indice passe de <strong>104.6</strong> en 2020 à <strong>120.8</strong> en 2025 — soit une hausse de <strong>+15.4%</strong> du coût de la vie en 5 ans.
        </p>
        <div style={{ marginTop: '0.75rem' }}>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0 0 6px' }}>Taux d'inflation annuelle :</p>
          <EvolutionBadge values={tauxInflation} />
        </div>
      </Card>

      {/* Chômage */}
      <Card title="Taux de chômage (BIT)" emoji="👥" source={chomage.source}>
        <BarChart data={chomage} color="#f97316" unit="%" format={v => v.toFixed(1)} />
        <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '1rem' }}>
          Le chômage a baissé de <strong>8.0%</strong> en 2020 (pic Covid) à <strong>7.3%</strong> en 2025, son niveau le plus bas depuis 15 ans.
        </p>
        <div style={{ marginTop: '0.75rem' }}>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0 0 6px' }}>Évolution annuelle (en points) :</p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {chomageEvol.map((v, i) => {
              if (v === null) return null
              const baisse = v <= 0
              return (
                <span key={i} style={{
                  padding: '4px 10px', borderRadius: 999, fontSize: '0.8rem', fontWeight: '600',
                  backgroundColor: baisse ? '#dcfce7' : '#fee2e2',
                  color: baisse ? '#16a34a' : '#dc2626',
                }}>
                  {annees[i]} {baisse ? '▼' : '▲'} {Math.abs(v)}pt
                </span>
              )
            })}
          </div>
        </div>
      </Card>

      {/* Population */}
      <Card title="Population française" emoji="🇫🇷" source={population.source}>
        <BarChart data={population} color="#1d4ed8" unit="M" format={v => v.toFixed(1)} />
        <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '1rem' }}>
          La France passe de <strong>67.4M</strong> à <strong>68.4M</strong> d'habitants, soit une croissance de <strong>+200 000</strong> personnes par an en moyenne.
        </p>
        <div style={{ marginTop: '0.75rem' }}>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0 0 6px' }}>Croissance annuelle :</p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {popEvol.map((v, i) => {
              if (v === null) return null
              return (
                <span key={i} style={{
                  padding: '4px 10px', borderRadius: 999, fontSize: '0.8rem', fontWeight: '600',
                  backgroundColor: '#dbeafe', color: '#1d4ed8',
                }}>
                  {annees[i]} +{v?.toLocaleString('fr-FR')}
                </span>
              )
            })}
          </div>
        </div>
      </Card>

      {/* Footer */}
      <p style={{ textAlign: 'center', fontSize: '0.7rem', color: '#9ca3af', marginTop: '2rem' }}>
        Données officielles INSEE — api.insee.fr · Mise à jour 2025 · ★ 2025 en estimation
      </p>
    </main>
  )
}
