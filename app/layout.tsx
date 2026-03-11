import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Prima Nota - Gestione Contabilità',
  description: 'Sistema di gestione della prima nota e conto economico',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  )
}
