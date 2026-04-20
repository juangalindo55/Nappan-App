'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCartStore } from '@/store/cart.store'

function IconHome({ active }: { active: boolean }) {
  const c = active ? '#E8A420' : '#5A4A38'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" fill={active ? 'rgba(232,164,32,0.12)' : 'none'} />
      <path d="M9 21V13h6v8" />
    </svg>
  )
}

function IconMenu({ active }: { active: boolean }) {
  const c = active ? '#E8A420' : '#5A4A38'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="16" y2="12" />
      <line x1="4" y1="18" x2="12" y2="18" />
    </svg>
  )
}

function IconCart({ active }: { active: boolean }) {
  const c = active ? '#E8A420' : '#5A4A38'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 6h15l-1.5 8.5a2 2 0 01-2 1.5H8a2 2 0 01-2-1.5L4.5 3H2" fill={active ? 'rgba(232,164,32,0.08)' : 'none'} />
      <circle cx="9" cy="20" r="1.3" fill={active ? 'rgba(232,164,32,0.12)' : 'none'} />
      <circle cx="18" cy="20" r="1.3" fill={active ? 'rgba(232,164,32,0.12)' : 'none'} />
    </svg>
  )
}

function IconProfile({ active }: { active: boolean }) {
  const c = active ? '#E8A420' : '#5A4A38'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="7" r="4" fill={active ? 'rgba(232,164,32,0.12)' : 'none'} />
      <path d="M4 21v-1a8 8 0 0116 0v1" />
    </svg>
  )
}

const tabs = [
  { label: 'Inicio',   href: '/',        Icon: IconHome },
  { label: 'Menú',     href: '/menu',    Icon: IconMenu },
  { label: 'Carrito',  href: '/cart',    Icon: IconCart },
  { label: 'Perfil',   href: '/profile', Icon: IconProfile },
]

export default function BottomNav() {
  const pathname = usePathname()
  const itemCount = useCartStore((state) =>
    state.cart.items.reduce((acc, item) => acc + item.quantity, 0),
  )

  return (
    <nav
      className="fixed bottom-0 z-50"
      style={{
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '430px',
        background: 'rgba(10,7,4,0.96)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(232,164,32,0.07)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-center max-w-lg mx-auto" style={{ height: '72px' }}>
        {/* First 2 tabs */}
        {tabs.slice(0, 2).map(({ label, href, Icon }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href} className="flex-1">
              <div className="flex flex-col items-center gap-1">
                <Icon active={active} />
                <span style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-dm-sans)',
                  fontWeight: active ? 600 : 400,
                  color: active ? '#E8A420' : '#5A4A38',
                  letterSpacing: '0.02em',
                  transition: 'color 0.2s',
                }}>
                  {label}
                </span>
              </div>
            </Link>
          )
        })}

        {/* Center Pedir button */}
        <Link href="/order" className="flex-1">
          <div className="flex flex-col items-center gap-1" style={{ marginTop: '-22px' }}>
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(145deg, #F0B030 0%, #C07810 60%, #A06008 100%)',
                boxShadow: '0 2px 24px rgba(232,164,32,0.45), 0 0 0 3px rgba(232,164,32,0.08)',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0C0806" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" fill="#0C0806" />
                <circle cx="20" cy="21" r="1" fill="#0C0806" />
                <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6" />
              </svg>
            </div>
            <span style={{
              fontSize: '10px',
              fontFamily: 'var(--font-dm-sans)',
              fontWeight: 600,
              color: '#E8A420',
              letterSpacing: '0.02em',
            }}>
              Pedir
            </span>
          </div>
        </Link>

        {/* Last 2 tabs */}
        {tabs.slice(2).map(({ label, href, Icon }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href} className="flex-1">
              <div className="flex flex-col items-center gap-1 relative">
                <Icon active={active} />
                <span style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-dm-sans)',
                  fontWeight: active ? 600 : 400,
                  color: active ? '#E8A420' : '#5A4A38',
                  letterSpacing: '0.02em',
                  transition: 'color 0.2s',
                }}>
                  {label}
                </span>
                {href === '/cart' && itemCount > 0 ? (
                  <span
                    className="absolute -top-0.5 right-[calc(50%-18px)] flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold text-[#0C0806]"
                    style={{ background: '#E8A420' }}
                  >
                    {itemCount}
                  </span>
                ) : null}
              </div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
