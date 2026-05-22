import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nappan Studio',
  description: 'Pancakes & Art Studio — Monterrey',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Nappan',
  },
}

export const viewport: Viewport = {
  themeColor: '#FFF8EA',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full antialiased" style={{ background: '#FFF8EA' }}>
        <div
          style={{
            minHeight: '100dvh',
            background:
              'radial-gradient(circle at 12% 0%, rgba(216,155,43,0.18), transparent 28%), radial-gradient(circle at 88% 4%, rgba(185,106,69,0.14), transparent 26%), linear-gradient(180deg, #FFF8EA 0%, #F7EEDC 54%, #FFFDF7 100%)',
            color: '#2A1710',
            position: 'relative',
            overflowX: 'hidden',
          }}
        >
          {children}
        </div>
      </body>
    </html>
  )
}
