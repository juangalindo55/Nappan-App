import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/features/products/product.types'

const productCopy: Record<string, { description: string; cta: string; image: string; alt: string; benefits: string[] }> = {
  lunchbox: {
    description: 'Cajas para grupos, brunchs y celebraciones donde todo debe verse bien desde el primer vistazo.',
    cta: 'Ordenar ahora',
    image: '/images/nappan/lunchbox.jpg',
    alt: 'Lunch Box Nappan con pancakes y toppings para compartir',
    benefits: ['Perfecta para grupos', 'Presentación premium', 'Lista para compartir'],
  },
}

type TwoColumnProductSectionProps = {
  product: Product
}

export function TwoColumnProductSection({ product }: TwoColumnProductSectionProps) {
  const copy = productCopy[product.id]

  if (!copy) {
    return null
  }

  return (
    <Link href={product.href} className="block transition active:scale-[0.99] md:hover:-translate-y-1">
      <article
        className="relative overflow-hidden rounded-[1.8rem] anim-up d3"
        style={{
          background: 'rgba(255,252,245,0.86)',
          border: '1px solid rgba(88,55,34,0.13)',
          boxShadow: '0 16px 42px rgba(62,35,19,0.08)',
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-0">
          {/* Image - Left */}
          <div className="relative h-64 md:h-full min-h-[280px] bg-[#EAD9B9] order-2 md:order-1">
            <Image
              src={copy.image}
              alt={copy.alt}
              fill
              sizes="(min-width: 768px) 280px, 100vw"
              className="object-cover"
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: 'linear-gradient(180deg, rgba(42,23,16,0.04) 0%, rgba(42,23,16,0.12) 100%)',
              }}
            />
          </div>

          {/* Text Content - Right */}
          <div className="relative z-10 flex flex-col justify-between p-6 sm:p-8 md:p-10 order-1 md:order-2">
            <div>
              <span
                className="inline-block rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] mb-4"
                style={{
                  color: '#FFF8EA',
                  background: 'rgba(42,23,16,0.64)',
                  fontFamily: 'var(--font-dm-sans)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                {product.tag}
              </span>

              <h3
                className="text-4xl leading-[0.9] tracking-[-0.05em] mt-2"
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
                className="mt-4 max-w-sm text-sm leading-6"
                style={{ color: '#765E4B', fontFamily: 'var(--font-dm-sans)' }}
              >
                {copy.description}
              </p>

              {/* Benefits List */}
              <ul className="mt-5 space-y-2">
                {copy.benefits.map((benefit, idx) => (
                  <li
                    key={idx}
                    className="text-sm"
                    style={{ color: '#765E4B', fontFamily: 'var(--font-dm-sans)' }}
                  >
                    <span style={{ color: '#D89B2B' }}>•</span> {benefit}
                  </li>
                ))}
              </ul>
            </div>

            <span
              className="mt-6 inline-flex w-fit items-center rounded-full border px-4 py-2 text-sm font-extrabold"
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
        </div>
      </article>
    </Link>
  )
}
