import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/features/products/product.types'

const productDescriptions: Record<string, string> = {
  nappanbox: 'El regalo que todos van a ver, probar y recordar.',
  lunchbox: 'Para compartir. Para celebrar. Para que nadie se quede sin su porción de magia.',
  fitbar: 'Proteína que sabe a celebración. Rápido pero sin compromisos.',
  eventos: 'La estación que todos van a rodear. Pancake art en vivo, conversación garantizada.',
}

const productImages: Record<string, { src: string; alt: string }> = {
  nappanbox: {
    src: '/images/nappan/gallery-mario-box.jpg',
    alt: 'Nappan Box colorida con pancake art personalizado',
  },
  lunchbox: {
    src: '/images/nappan/lunchbox.jpg',
    alt: 'Lunch Box Nappan con pancakes y toppings para compartir',
  },
  fitbar: {
    src: '/images/nappan/fitbar.jpg',
    alt: 'Fit Bar con pancakes proteicos y presentación saludable',
  },
  eventos: {
    src: '/images/nappan/wellness-event.webp',
    alt: 'Mesa de evento Nappan con experiencia de pancake art',
  },
}

type FeaturedProductCardProps = {
  product: Product
}

export function FeaturedProductCard({ product }: FeaturedProductCardProps) {
  const image = productImages[product.id] ?? productImages.nappanbox

  return (
    <Link href={product.href} className="block transition active:scale-[0.99] md:hover:-translate-y-1">
      <article
        className="relative overflow-hidden rounded-[2rem] anim-scale d1"
        style={{
          minHeight: '330px',
          background: 'linear-gradient(135deg, rgba(255,252,245,0.97) 0%, rgba(247,238,220,0.98) 100%)',
          border: '1px solid rgba(88,55,34,0.13)',
          boxShadow: '0 28px 70px rgba(62,35,19,0.12)',
        }}
      >
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-2xl"
          style={{ background: 'rgba(216,155,43,0.23)' }}
        />
        <div
          className="pointer-events-none absolute -bottom-20 left-8 h-52 w-52 rounded-full blur-3xl"
          style={{ background: 'rgba(185,106,69,0.14)' }}
        />

        <div className="relative z-10 grid gap-0 md:grid-cols-[minmax(0,1fr)_minmax(300px,0.86fr)]">
          <div className="flex min-h-[330px] flex-col justify-between p-6 sm:p-8 md:p-10">
            <div>
              <div className="mb-6 flex items-center gap-3">
                <span
                  className="rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em]"
                  style={{ background: '#F7EEDC', color: '#A87325', border: '1px solid rgba(88,55,34,0.10)', fontFamily: 'var(--font-dm-sans)' }}
                >
                  Destacado · {product.tag}
                </span>
              </div>

              <h2
                className="max-w-xl text-[clamp(3rem,8vw,5.5rem)] leading-[0.88] tracking-[-0.06em]"
                style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontWeight: 500, color: '#2A1710' }}
              >
                {product.name}
              </h2>
              <p
                className="mt-5 max-w-md text-sm leading-7 sm:text-base"
                style={{ color: '#765E4B', fontFamily: 'var(--font-dm-sans)' }}
              >
                {productDescriptions[product.id] ?? product.subtitle}
              </p>
            </div>

            <span
              className="mt-7 inline-flex w-fit items-center rounded-full px-5 py-3 text-sm font-extrabold"
              style={{ background: '#2A1710', color: '#FFF8EA', fontFamily: 'var(--font-dm-sans)' }}
            >
              Personalizar ahora →
            </span>
          </div>

          <div
            className="relative min-h-[250px] overflow-hidden md:min-h-[330px]"
            style={{ background: '#EAD9B9' }}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority
              sizes="(min-width: 768px) 42vw, 100vw"
              className="object-cover"
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: 'linear-gradient(90deg, rgba(255,252,245,0.22) 0%, rgba(255,252,245,0) 38%), linear-gradient(180deg, rgba(42,23,16,0) 55%, rgba(42,23,16,0.18) 100%)' }}
            />
          </div>
        </div>
      </article>
    </Link>
  )
}
