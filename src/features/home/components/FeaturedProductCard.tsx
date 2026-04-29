import Link from 'next/link'
import type { Product } from '@/features/products/product.types'
import { GoldShimmer, GrainLayer } from './ProductChrome'

type FeaturedProductCardProps = {
  product: Product
}

export function FeaturedProductCard({ product }: FeaturedProductCardProps) {
  return (
    <Link href={product.href}>
      <div
        className="relative rounded-2xl overflow-hidden anim-scale d1"
        style={{
          minHeight: '280px',
          background: product.visual.gradient,
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.30)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 35% 50%, ${product.visual.glow} 0%, transparent 60%)`,
          }}
        />

        <GrainLayer opacity={0.22} />
        <GoldShimmer />

        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: '70%',
            background:
              'linear-gradient(to top, rgba(4,8,6,0.95) 0%, rgba(4,8,6,0.72) 60%, transparent 100%)',
          }}
        />

        <div className="absolute bottom-0 left-0 right-0 p-5">
          <span
            className="inline-block mb-3 rounded-full px-2.5 py-1"
            style={{
              fontSize: '10px',
              fontFamily: 'var(--font-dm-sans)',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              background: 'rgba(232,164,32,0.12)',
              border: '1px solid rgba(232,164,32,0.22)',
              color: '#E8A420',
            }}
          >
            {product.tag}
          </span>

          <h2
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontStyle: 'italic',
              fontWeight: 600,
              fontSize: 'clamp(34px, 7vw, 42px)',
              lineHeight: 1.02,
              color: '#F0E4CC',
              marginBottom: '8px',
              maxWidth: '10ch',
            }}
          >
            {product.name}
          </h2>

          <p
            style={{
              fontSize: '14px',
              color: 'rgba(240,228,204,0.55)',
              fontFamily: 'var(--font-dm-sans)',
              marginBottom: '16px',
              maxWidth: '22ch',
            }}
          >
            {product.subtitle}
          </p>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E8A420]/18 bg-[#E8A420]/12 px-3 py-2">
            <span
              style={{
                fontSize: '12px',
                color: '#E8A420',
                fontFamily: 'var(--font-dm-sans)',
                fontWeight: 500,
              }}
            >
              Explorar
            </span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#E8A420"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        <div
          className="absolute top-4 right-4 px-2.5 py-1 rounded-full"
          style={{
            background: 'rgba(14,10,6,0.65)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(232,164,32,0.15)',
          }}
        >
          <span
            style={{
              fontSize: '10px',
              color: '#E8A420',
              fontFamily: 'var(--font-dm-sans)',
              fontWeight: 600,
              letterSpacing: '0.05em',
            }}
          >
            DESTACADO
          </span>
        </div>
      </div>
    </Link>
  )
}
