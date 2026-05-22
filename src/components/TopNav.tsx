'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCartStore } from '@/store/cart.store'

const navItems = [
  { label: 'Inicio', href: '/' },
  { label: 'Explorar', href: '/explorar' },
  { label: 'Pedir', href: '/order' },
  { label: 'Perfil', href: '/profile' },
]

export default function TopNav() {
  const pathname = usePathname()
  const totalItems = useCartStore(
    (state) => state.cart.items.reduce((acc, item) => acc + item.quantity, 0),
  )

  return (
    <nav
      className="hidden md:block fixed top-0 left-0 right-0 z-50 border-b"
      style={{
        background: 'var(--bg-primary)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10" style={{ height: '80px' }}>
        {/* Logo */}
        <Link href="/" className="transition active:scale-[0.98] shrink-0">
          <div className="relative h-16 w-16">
            <Image
              src="/images/nappan/logo-dorado.svg"
              alt="Nappan Studio"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* Center Navigation */}
        <div className="flex items-center gap-8 flex-1 justify-center">
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

        {/* Cart Icon */}
        <Link
          href="/cart"
          className="relative flex h-11 w-11 items-center justify-center rounded-full transition active:scale-95 shrink-0"
          style={{
            background: 'rgba(255,252,245,0.78)',
            border: '1px solid rgba(88,55,34,0.14)',
            boxShadow: '0 12px 30px rgba(62,35,19,0.10)',
          }}
          aria-label="Ver carrito"
        >
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#2A1710"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          {totalItems > 0 && (
            <span
              className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1"
              style={{
                background: '#D89B2B',
                fontSize: '10px',
                fontWeight: 800,
                color: '#2A1710',
                border: '2px solid #FFF8EA',
              }}
            >
              {totalItems}
            </span>
          )}
        </Link>
      </div>
    </nav>
  )
}
