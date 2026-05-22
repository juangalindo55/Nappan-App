"use client"

import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/store/cart.store'

export function HomeTopBar() {
  const totalItems = useCartStore(
    (state) => state.cart.items.reduce((acc, item) => acc + item.quantity, 0),
  )

  return (
    <header
      className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 sm:px-8 lg:px-10 anim-up"
      style={{
        paddingTop: 'calc(20px + env(safe-area-inset-top, 0px))',
        paddingBottom: '18px',
      }}
    >
      <Link href="/" className="transition active:scale-[0.98]">
        <div className="relative h-20 w-20">
          <Image
            src="/images/nappan/logo-dorado.svg"
            alt="Nappan Studio"
            fill
            className="object-contain"
            priority
          />
        </div>
      </Link>

      <Link
        href="/cart"
        className="relative flex h-11 w-11 items-center justify-center rounded-full transition active:scale-95"
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
        {totalItems > 0 ? (
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
        ) : null}
      </Link>
    </header>
  )
}
