import Link from 'next/link'
import type { Product } from '@/features/products/product.types'
import { GoldShimmer, GrainLayer } from './ProductChrome'

type ProductCardProps = {
  delay: string
  product: Product
}

export function ProductCard({ delay, product }: ProductCardProps) {
  return (
    <Link href={product.href}>
      <div
        className="relative rounded-xl overflow-hidden anim-up"
        style={{
          height: '155px',
          background: product.visual.gradient,
          animationDelay: delay,
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 40% 40%, ${product.visual.glow} 0%, transparent 65%)`,
          }}
        />

        <GrainLayer opacity={0.15} />
        <GoldShimmer />

        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: '70%',
            background:
              'linear-gradient(to top, rgba(4,6,4,0.9) 0%, transparent 100%)',
          }}
        />

        <div className="absolute bottom-0 left-0 right-0 p-3">
          <span
            style={{
              display: 'block',
              fontSize: '9px',
              fontFamily: 'var(--font-dm-sans)',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(232,164,32,0.55)',
              marginBottom: '2px',
            }}
          >
            {product.tag}
          </span>
          <h3
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontStyle: 'italic',
              fontWeight: 600,
              fontSize: '22px',
              lineHeight: 1.1,
              color: '#F0E4CC',
            }}
          >
            {product.name}
          </h3>
        </div>
      </div>
    </Link>
  )
}
