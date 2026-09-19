import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PacMac covoit 🚗',
  description: 'Organise le covoiturage de l\'équipe PacMac pour les événements sportifs.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
