import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/features/products/product.types'

const productCopy: Record<string, { description: string; cta: string; image: string; alt: string; highlights: string[] }> = {
  fitbar: {
    description: 'Pancakes proteicos para un antojo más limpio sin perder presentación.',
    cta: 'Ordenar ahora',
    image: '/images/nappan/protein-minipancakes.webp',
    alt: 'Mini pancakes proteicos presentados como Fit Bar',
    highlights: ['Proteína pura', 'Ingredientes limpios', 'Sin compromiso'],
  },
}

type CompactProductCardProps = {
  product: Product
  delay?: string
}

export function CompactProductCard({ product, delay = '0s' }: CompactProductCardProps) {
  const copy = productCopy[product.id]

  if (!copy) {
    return null
  }

  return (
    <Link href={product.href} className="block transition active:scale-[0.99] md:hover:-translate-y-1">
      <article
        className="relative flex flex-col overflow-hidden rounded-[1.8rem] h-full anim-up"
        style={{
          animationDelay: delay,
          background: 'rgba(255,252,245,0.86)',
          border: '1px solid rgba(88,55,34,0.13)',
          boxShadow: '0 16px 42px rgba(62,35,19,0.08)',
        }}
      >
        {/* Image - Square crop at top */}
        <div className="relative w-full aspect-square bg-[#EAD9B9] overflow-hidden">
          <Image
            src={copy.image}
            alt={copy.alt}
            fill
            sizes="(min-width: 768px) 300px, 100vw"
            className="object-cover"
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, rgba(42,23,16,0.04) 0%, rgba(42,23,16,0.12) 100%)',
            }}
          />

          {/* Badge overlay */}
          <span
            className="absolute left-4 top-4 rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em]"
            style={{
              color: '#FFF8EA',
              background: 'rgba(42,23,16,0.64)',
              fontFamily: 'var(--font-dm-sans)',
              backdropFilter: 'blur(10px)',
            }}
          >
            {product.tag}
          </span>
        </div>

        {/* Text Content */}
        <div className="relative z-10 flex flex-1 flex-col p-5">
          <div className="flex-1">
            <h3
              className="text-3xl leading-[0.9] tracking-[-0.05em]"
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontStyle: 'italic',
                fontWeight: 500,
                color: '#2A1710',
              }}
            >
              {product.name}
            </h3>

            <p
              className="mt-3 text-xs leading-5"
              style={{ color: '#765E4B', fontFamily: 'var(--font-dm-sans)' }}
            >
              {copy.description}
            </p>

            {/* Highlights */}
            <ul className="mt-4 space-y-1">
              {copy.highlights.map((highlight, idx) => (
                <li
                  key={idx}
                  className="text-xs"
                  style={{ color: '#9A7A61', fontFamily: 'var(--font-dm-sans)' }}
                >
                  <span style={{ color: '#D89B2B' }}>✓</span> {highlight}
                </li>
              ))}
            </ul>
          </div>

          <span
            className="mt-4 inline-flex w-fit items-center rounded-full border px-3 py-1.5 text-xs font-extrabold"
            style={{
              color: '#2A1710',
              fontFamily: 'var(--font-dm-sans)',
              borderColor: 'rgba(88,55,34,0.16)',
              background: 'rgba(255,252,245,0.72)',
            }}
          >
            {copy.cta} →
          </span>
        </div>
      </article>
    </Link>
  )
}
