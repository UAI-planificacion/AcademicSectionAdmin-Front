import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Administrador de Secciones Académicas',
  description: 'Administrador de Secciones Académicas',
  generator: 'AcademicSectionAdmin',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
