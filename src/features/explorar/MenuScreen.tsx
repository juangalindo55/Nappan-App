import Image from 'next/image'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import { getProductSnapshot } from '@/features/products/product.service'
import type { Product } from '@/features/products/product.types'

// ─── Per-product menu copy ────────────────────────────────────────────────────
// Pricing is intentionally omitted until confirmed. Constraints communicate
// the ordering logic in its place.

type MenuEntry = {
  description: string
  image: { src: string; alt: string }
  inclusions: string[]
  constraint: string
  cta: string
}

const MENU_DATA: Record<string, MenuEntry> = {
  nappanbox: {
    description:
      'Un lienzo comestible diseñado para sorprender — retratos, personajes o ideas totalmente personalizadas.',
    image: {
      src: '/images/nappan/nappanbox.jpg',
      alt: 'Nappan Box personalizada con pancake art de retrato',
    },
    inclusions: [
      'Pancake art personalizado (retrato, personaje o concepto)',
      'Toppings artesanales seleccionados',
      'Presentación en caja premium lista para regalar',
      'Mensaje o dedicatoria incluida',
    ],
    constraint: 'Desde 1 pieza · diseño personalizado',
    cta: 'Personalizar mi caja',
  },
  lunchbox: {
    description:
      'Ideal para grupos, brunchs y celebraciones donde quieres que todo llegue bonito y ordenado.',
    image: {
      src: '/images/nappan/lunchbox.jpg',
      alt: 'Lunch Box Nappan con pancakes y toppings para compartir',
    },
    inclusions: [
      'Pancakes artísticos por caja',
      'Selección de toppings compartibles',
      'Packaging individual sellado y etiquetado',
      'Entrega coordinada en fecha y horario acordado',
    ],
    constraint: 'Mínimo 20 cajas · pedido anticipado',
    cta: 'Cotizar lunchboxes',
  },
  fitbar: {
    description:
      'La versión más limpia de Nappan: proteína, sabor y presentación sin perder lo especial.',
    image: {
      src: '/images/nappan/protein-minipancakes.webp',
      alt: 'Mini pancakes proteicos presentados como Fit Bar',
    },
    inclusions: [
      'Mini pancakes altos en proteína',
      'Opciones de toppings saludables',
      'Presentación lista para consumo inmediato',
      'Variante sin azúcar añadida disponible',
    ],
    constraint: 'Mínimo $1,000 MXN en pedido · productos de menú',
    cta: 'Armar pedido Fit Bar',
  },
  eventos: {
    description:
      'Pancake art en vivo para que tu celebración tenga algo único que todos quieran ver de cerca.',
    image: {
      src: '/images/nappan/stand.webp',
      alt: 'Estación de Nappan en vivo para eventos',
    },
    inclusions: [
      'Estación de pancake art completamente equipada',
      'Artista Nappan en sitio durante el evento',
      'Pancakes según paquete cotizado',
      'Coordinación previa y diseños acordados',
    ],
    constraint: 'Servicio por cotización · sin carrito online',
    cta: 'Solicitar cotización',
  },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MenuScreen() {
  const products = getProductSnapshot()

  return (
    <>
      <main
        className="desktop-nav-offset min-h-dvh px-5 pb-36 pt-16 md:pt-24 md:pb-12"
        style={{ background: '#FFF8EA' }}
      >
        <div className="mx-auto w-full max-w-6xl">
          {/* ── Header ─────────────────────────────────────────────────── */}
          <header className="mb-12 anim-up d1">
            <p
              className="text-[11px] font-extrabold uppercase tracking-[0.24em]"
              style={{ color: '#A87325', fontFamily: 'var(--font-dm-sans)' }}
            >
              Nappan · Menú completo
            </p>
            <h1
              className="mt-2 text-5xl md:text-6xl font-medium leading-none tracking-[-0.05em]"
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontStyle: 'italic',
                color: '#2A1710',
              }}
            >
              Todo lo que hacemos
            </h1>
            <p
              className="mt-4 max-w-xl text-sm leading-6"
              style={{ color: '#765E4B', fontFamily: 'var(--font-dm-sans)' }}
            >
              Cada formato tiene su lógica. Elige el que mejor encaja con tu
              ocasión.
            </p>
          </header>

          {/* ── Product cards ───────────────────────────────────────────── */}
          <div className="flex flex-col gap-8">
            {products.map((product, i) => {
              const entry = MENU_DATA[product.id]
              if (!entry) return null
              return (
                <MenuCard
                  key={product.id}
                  product={product}
                  entry={entry}
                  delay={`${0.06 + i * 0.06}s`}
                  reversed={i % 2 !== 0}
                />
              )
            })}
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  )
}

// ─── MenuCard ─────────────────────────────────────────────────────────────────

type MenuCardProps = {
  product: Product
  entry: MenuEntry
  delay: string
  reversed: boolean
}

function MenuCard({ product, entry, delay, reversed }: MenuCardProps) {
  return (
    <article
      className="overflow-hidden rounded-[2rem] anim-up"
      style={{
        animationDelay: delay,
        background: 'rgba(255,252,245,0.88)',
        border: '1px solid rgba(88,55,34,0.13)',
        boxShadow: '0 20px 56px rgba(62,35,19,0.09)',
      }}
    >
      {/*
       * On md+ the grid alternates image/text order via flex-row-reverse.
       * On mobile it's always image-top, text-bottom.
       */}
      <div
        className={`flex flex-col ${reversed ? 'md:flex-row-reverse' : 'md:flex-row'}`}
      >
        {/* ── Image ──────────────────────────────────────────────────── */}
        <div className="relative min-h-[260px] shrink-0 overflow-hidden bg-[#EAD9B9] md:w-[420px] md:min-h-[400px]">
          <Image
            src={entry.image.src}
            alt={entry.image.alt}
            fill
            sizes="(min-width: 768px) 420px, 100vw"
            className="object-cover transition duration-500"
          />
          {/* Subtle vignette */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(42,23,16,0.04) 0%, rgba(42,23,16,0.18) 100%)',
            }}
          />
          {/* Category tag */}
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

        {/* ── Text content ───────────────────────────────────────────── */}
        <div className="flex flex-1 flex-col justify-between p-7 sm:p-9">
          <div>
            <h2
              className="text-4xl leading-none tracking-[-0.05em]"
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontStyle: 'italic',
                fontWeight: 500,
                color: '#2A1710',
              }}
            >
              {product.name}
            </h2>

            <p
              className="mt-4 text-sm leading-7"
              style={{ color: '#765E4B', fontFamily: 'var(--font-dm-sans)' }}
            >
              {entry.description}
            </p>

            {/* Inclusions */}
            <div className="mt-7">
              <p
                className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.22em]"
                style={{ color: '#A87325', fontFamily: 'var(--font-dm-sans)' }}
              >
                Lo que incluye
              </p>
              <ul className="space-y-2.5">
                {entry.inclusions.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm leading-6"
                    style={{
                      color: '#2A1710',
                      fontFamily: 'var(--font-dm-sans)',
                    }}
                  >
                    <span
                      className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: '#D89B2B' }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Constraint / ordering info */}
            <p
              className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.16em]"
              style={{ color: '#9A7A61', fontFamily: 'var(--font-dm-sans)' }}
            >
              {entry.constraint}
            </p>
          </div>

          {/* CTA */}
          <Link
            href={product.href}
            className="mt-8 inline-flex w-fit items-center rounded-full px-6 py-3.5 text-sm font-extrabold shadow-[0_16px_36px_rgba(62,35,19,0.16)] transition active:scale-95 md:hover:-translate-y-0.5"
            style={{
              fontFamily: 'var(--font-dm-sans)',
              background: '#2A1710',
              color: '#FFF8EA',
            }}
          >
            {entry.cta} →
          </Link>
        </div>
      </div>
    </article>
  )
}
