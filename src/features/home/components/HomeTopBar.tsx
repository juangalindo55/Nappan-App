"use client"

import Link from 'next/link'
import { useCartStore } from '@/store/cart.store'

export function HomeTopBar() {
  const totalItems = useCartStore(
    (state) => state.cart.items.reduce((acc, item) => acc + item.quantity, 0),
  )

  return (
    <div
      className="flex items-center justify-between px-5 anim-up"
      style={{
        paddingTop: 'calc(20px + env(safe-area-inset-top, 0px))',
        paddingBottom: '12px',
      }}
    >
      <div className="flex items-baseline gap-1.5">
        <span
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontStyle: 'italic',
            fontWeight: 700,
            fontSize: '28px',
            color: '#FFF6E5',
            letterSpacing: '-0.01em',
          }}
        >
          Nappan
        </span>
        <span
          style={{
            fontSize: '11px',
            color: '#A58B69',
            fontFamily: 'var(--font-dm-sans)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          Studio
        </span>
      </div>

      <Link
        href="/cart"
        className="relative flex h-11 w-11 items-center justify-center rounded-full transition active:scale-95"
        style={{
          background: 'rgba(26,18,9,0.92)',
          border: '1px solid rgba(232,164,32,0.1)',
        }}
        aria-label="Ver carrito"
      >
        <svg
          width="19"
          height="19"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#F0E4CC"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
        <span
          className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full"
          style={{
            background: '#E8A420',
            fontSize: '9px',
            fontWeight: 700,
            color: '#0C0806',
          }}
        >
          {totalItems}
        </span>
      </Link>
    </div>
  )
}
