import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/features/products/product.types'

const productCopy: Record<string, { description: string; cta: string; image: string; alt: string }> = {
  nappanbox: {
    description: 'Piezas personalizadas para regalo, cumpleaños o ese detalle que tiene que impresionar.',
    cta: 'Ordenar ahora',
    image: '/images/nappan/gallery-1.jpg',
    alt: 'Nappan Box personalizada con arte de personaje',
  },
  lunchbox: {
    description: 'Cajas para grupos, brunchs y celebraciones donde todo debe verse bien desde el primer vistazo.',
    cta: 'Ordenar ahora',
    image: '/images/nappan/lunchbox.jpg',
    alt: 'Lunch Box Nappan con pancakes y toppings para compartir',
  },
  fitbar: {
    description: 'Pancakes proteicos para un antojo más limpio sin perder presentación.',
    cta: 'Ordenar ahora',
    image: '/images/nappan/protein-minipancakes.webp',
    alt: 'Mini pancakes proteicos presentados como Fit Bar',
  },
  eventos: {
    description: 'Pancake art en vivo para marcas, bodas y celebraciones con alma.',
    cta: 'Ordenar ahora',
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
        className="relative flex h-full min-h-[320px] flex-col overflow-hidden rounded-[1.8rem] anim-up"
        style={{
          animationDelay: delay,
          background: 'rgba(255,252,245,0.86)',
          border: '1px solid rgba(88,55,34,0.13)',
          boxShadow: '0 16px 42px rgba(62,35,19,0.08)',
        }}
      >
        <div className="relative h-40 overflow-hidden" style={{ background: '#EAD9B9' }}>
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
            style={{ background: 'linear-gradient(180deg, rgba(42,23,16,0.04) 0%, rgba(42,23,16,0.22) 100%)' }}
          />
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
            className="mt-5 inline-flex w-fit items-center rounded-full border px-4 py-2 text-sm font-extrabold"
            style={{
              color: '#2A1710',
              fontFamily: 'var(--font-dm-sans)',
              borderColor: 'rgba(88,55,34,0.16)',
              background: 'rgba(255,252,245,0.72)',
            }}
          >
            {copy?.cta ?? 'Ver experiencia'} →
          </span>
        </div>
      </article>
    </Link>
  )
}
