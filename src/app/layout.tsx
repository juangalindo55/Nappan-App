import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nappan Studio',
  description: 'Pancakes & Art Studio — Monterrey',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Nappan',
  },
}

export const viewport: Viewport = {
  themeColor: '#0C0806',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full antialiased" style={{ background: '#060402' }}>
        <div style={{
          maxWidth: '430px',
          margin: '0 auto',
          minHeight: '100dvh',
          background: '#0C0806',
          position: 'relative',
          boxShadow: '0 0 80px rgba(0,0,0,0.8)',
        }}>
          {children}
        </div>
      </body>
    </html>
  )
}
