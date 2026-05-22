'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { label: 'Inicio', href: '/' },
  { label: 'Explorar', href: '/explorar' },
  { label: 'Pedir', href: '/order' },
  { label: 'Perfil', href: '/profile' },
]

export default function TopNav() {
  const pathname = usePathname()

  return (
    <nav
      className="hidden md:block sticky top-0 z-40 border-b"
      style={{
        background: 'var(--bg-primary)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-center gap-8 px-5 sm:px-8 lg:px-10" style={{ height: '60px' }}>
        {navItems.map(({ label, href }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className="text-sm font-semibold transition"
              style={{
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                borderBottom: active ? '2px solid var(--gold)' : 'transparent',
                paddingBottom: '8px',
              }}
            >
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
