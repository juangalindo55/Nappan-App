import Link from 'next/link'
import { GoldShimmer } from './ProductChrome'

export function EventPromo() {
  return (
    <div className="px-4 mt-8 anim-up d4">
      <div
        className="rounded-2xl p-5 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1A1209 0%, #0E0907 100%)',
          border: '1px solid rgba(232,164,32,0.08)',
        }}
      >
        <GoldShimmer />
        <p
          style={{
            fontSize: '11px',
            fontFamily: 'var(--font-dm-sans)',
            color: '#5A4A38',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '6px',
          }}
        >
          ¿Tienes un evento?
        </p>
        <p
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontStyle: 'italic',
            fontSize: '22px',
            color: '#F0E4CC',
            marginBottom: '14px',
          }}
        >
          Hacemos pancakes artísticos en tu celebración
        </p>
        <Link href="/products/eventos">
          <span
            className="inline-flex items-center gap-1.5 rounded-lg"
            style={{
              padding: '9px 18px',
              background: 'rgba(232,164,32,0.1)',
              border: '1px solid rgba(232,164,32,0.2)',
              fontSize: '12px',
              fontFamily: 'var(--font-dm-sans)',
              fontWeight: 600,
              color: '#E8A420',
            }}
          >
            Cotizar evento
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#E8A420"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </Link>
      </div>
    </div>
  )
}
