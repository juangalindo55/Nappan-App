import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
})

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

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
    <html lang="es" className={`${cormorant.variable} ${dmSans.variable} h-full`}>
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
