import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/features/products/product.types'

const productCopy: Record<string, { description: string; cta: string; image: string; alt: string }> = {
  nappanbox: {
    description: 'Regalos personalizados y detalles listos para compartir.',
    cta: 'Personalizar caja',
    image: '/images/nappan/gallery-mario-box.jpg',
    alt: 'Nappan Box colorida con pancake art personalizado',
  },
  lunchbox: {
    description: 'Cajas para grupos, juntas y celebraciones coordinadas.',
    cta: 'Ver opciones',
    image: '/images/nappan/lunchbox.jpg',
    alt: 'Lunch Box Nappan con pancakes y toppings para compartir',
  },
  fitbar: {
    description: 'Pancakes proteicos para un antojo limpio y práctico.',
    cta: 'Elegir Fit Bar',
    image: '/images/nappan/fitbar.jpg',
    alt: 'Fit Bar con pancakes proteicos y presentación saludable',
  },
  eventos: {
    description: 'Pancake art en vivo para marcas y celebraciones.',
    cta: 'Cotizar evento',
    image: '/images/nappan/wellness-event.webp',
    alt: 'Experiencia de evento Nappan con pancake art',
  },
}

type ProductCardProps = {
  delay: string
  product: Product
}

export function ProductCard({ delay, product }: ProductCardProps) {
  const copy = productCopy[product.id]

  return (
    <Link href={product.href} className="block transition active:scale-[0.99] md:hover:-translate-y-1">
      <article
        className="relative flex min-h-[270px] flex-col overflow-hidden rounded-[1.6rem] anim-up"
        style={{
          animationDelay: delay,
          background: 'rgba(255,252,245,0.86)',
          border: '1px solid rgba(88,55,34,0.13)',
          boxShadow: '0 16px 42px rgba(62,35,19,0.08)',
        }}
      >
        <div className="relative h-36 overflow-hidden" style={{ background: '#EAD9B9' }}>
          {copy ? (
            <Image
              src={copy.image}
              alt={copy.alt}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          ) : null}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'linear-gradient(180deg, rgba(42,23,16,0.02) 0%, rgba(42,23,16,0.2) 100%)' }}
          />
          <span
            className="absolute left-4 top-4 rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em]"
            style={{ color: '#FFF8EA', background: 'rgba(42,23,16,0.62)', fontFamily: 'var(--font-dm-sans)', backdropFilter: 'blur(10px)' }}
          >
            {product.tag}
          </span>
        </div>

        <div className="relative z-10 flex flex-1 flex-col p-5">
          <div className="flex-1">
            <h3
              className="text-4xl leading-[0.9] tracking-[-0.05em]"
              style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontWeight: 500, color: '#2A1710' }}
            >
              {product.name}
            </h3>
            <p
              className="mt-3 max-w-sm text-sm leading-6"
              style={{ color: '#765E4B', fontFamily: 'var(--font-dm-sans)' }}
            >
              {copy?.description ?? product.subtitle}
            </p>
          </div>

          <span
            className="mt-5 text-sm font-extrabold"
            style={{ color: '#2A1710', fontFamily: 'var(--font-dm-sans)' }}
          >
            {copy?.cta ?? 'Ver experiencia'} →
          </span>
        </div>
      </article>
    </Link>
  )
}
