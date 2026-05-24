'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { listProducts } from '@/features/products/product.service'
import type { Product } from '@/features/products/product.types'
import BottomNav from '@/components/BottomNav'

const productDescriptions: Record<string, string> = {
  nappanbox: 'Un lienzo comestible diseñado para sorprender con retratos, personajes o ideas totalmente personalizadas.',
  lunchbox: 'Ideal para grupos, brunchs y celebraciones donde quieres que todo llegue bonito y ordenado.',
  fitbar: 'La versión más limpia de Nappan: proteína, sabor y presentación sin perder lo especial.',
  eventos: 'Pancake art en vivo para que tu celebración tenga algo único que todos quieran ver de cerca.',
}

const productImages: Record<string, { src: string; alt: string }> = {
  nappanbox: {
    src: '/images/nappan/nappanbox.jpg',
    alt: 'Nappan Box personalizada con pancake art de retrato',
  },
  lunchbox: {
    src: '/images/nappan/lunchbox.jpg',
    alt: 'Lunch Box Nappan con pancakes y toppings para compartir',
  },
  fitbar: {
    src: '/images/nappan/protein-minipancakes.webp',
    alt: 'Mini pancakes proteicos presentados como Fit Bar',
  },
  eventos: {
    src: '/images/nappan/stand.webp',
    alt: 'Estación de Nappan en vivo para eventos',
  },
}

const CATEGORIES = [
  { id: 'todos', label: 'Todos' },
  { id: 'nappan-box', label: 'Artístico' },
  { id: 'lunch-box', label: 'Eventos' },
  { id: 'fit-bar', label: 'Proteína' },
  { id: 'events', label: 'En Vivo' },
]

export default function ExplorarScreen() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('todos')

  useEffect(() => {
    let cancelled = false

    async function loadProducts() {
      try {
        setLoading(true)
        setError(null)
        const nextProducts = await listProducts()

        if (!cancelled) {
          setProducts(nextProducts)
        }
      } catch {
        if (!cancelled) {
          setError('No pudimos cargar los productos. Intenta recargar la página.')
          setProducts([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadProducts()

    return () => {
      cancelled = true
    }
  }, [])

  const filteredProducts = products.filter((product) => {
    if (selectedCategory === 'todos') return true
    return product.categoryId === selectedCategory
  })

  return (
    <>
      <main className="desktop-nav-offset min-h-dvh px-5 pb-36 pt-16 md:pt-24 md:pb-12" style={{ background: '#FFF8EA' }}>
        <div className="mx-auto w-full max-w-6xl">
          {/* Header section */}
          <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6 anim-up d1">
            <header className="max-w-2xl">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.24em]" style={{ color: '#A87325', fontFamily: 'var(--font-dm-sans)' }}>
                Catálogo Nappan
              </p>
              <h1 className="mt-2 text-5xl md:text-6xl font-medium leading-none tracking-[-0.05em]" style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', color: '#2A1710' }}>
                Nuestras Experiencias
              </h1>
              <p className="mt-4 text-sm leading-6" style={{ color: '#765E4B', fontFamily: 'var(--font-dm-sans)' }}>
                Descubre todas nuestras creaciones de pancake art artesanal. Elige el estilo perfecto para tu regalo, mesa dulce o evento especial.
              </p>
            </header>
            
            <Link
              href="/"
              className="inline-flex shrink-0 items-center justify-center rounded-full border px-5 py-2.5 text-xs font-extrabold shadow-[0_12px_30px_rgba(62,35,19,0.06)] transition active:scale-95 md:hover:-translate-y-0.5"
              style={{
                fontFamily: 'var(--font-dm-sans)',
                background: 'rgba(255,252,245,0.85)',
                borderColor: 'rgba(88,55,34,0.18)',
                color: '#2A1710',
              }}
              title="Regresar al inicio"
            >
              ← Volver al inicio
            </Link>
          </div>

          {/* Category Filter Tabs */}
          <div className="mb-10 flex flex-wrap gap-2.5 border-b pb-6 anim-up d2" style={{ borderColor: 'rgba(88,55,34,0.1)' }}>
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="rounded-full px-5 py-2.5 text-xs font-extrabold uppercase tracking-[0.14em] transition active:scale-95"
                  style={{
                    fontFamily: 'var(--font-dm-sans)',
                    background: isActive ? '#2A1710' : 'rgba(255,252,245,0.7)',
                    color: isActive ? '#FFF8EA' : '#765E4B',
                    border: isActive ? '1px solid #2A1710' : '1px solid rgba(88,55,34,0.12)',
                    boxShadow: isActive ? '0 12px 30px rgba(62,35,19,0.15)' : 'none',
                  }}
                >
                  {cat.label}
                </button>
              )
            })}
          </div>

          {error ? (
            <div className="rounded-[1.8rem] border border-red-200 bg-red-50 p-5 text-sm text-red-700 anim-up d3">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-96 rounded-[1.8rem] animate-pulse" style={{ background: 'rgba(255,252,245,0.5)', border: '1px solid rgba(88,55,34,0.08)' }} />
              ))}
            </div>
          ) : (
            <>
              {filteredProducts.length === 0 ? (
                <div className="rounded-[1.8rem] border border-dashed p-12 text-center anim-up d3" style={{ borderColor: 'rgba(88,55,34,0.2)' }}>
                  <p className="text-sm font-medium" style={{ color: '#765E4B', fontFamily: 'var(--font-dm-sans)' }}>
                    No encontramos productos en esta categoría.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 anim-up d3">
                  {filteredProducts.map((product) => {
                    const img = productImages[product.id] ?? productImages.nappanbox
                    const desc = productDescriptions[product.id] ?? product.subtitle
                    return (
                      <Link
                        key={product.id}
                        href={product.href}
                        className="group block transition active:scale-[0.99] md:hover:-translate-y-1"
                      >
                        <article
                          className="flex flex-col h-full overflow-hidden rounded-[1.8rem] transition duration-300"
                          style={{
                            background: 'rgba(255,252,245,0.86)',
                            border: '1px solid rgba(88,55,34,0.13)',
                            boxShadow: '0 16px 42px rgba(62,35,19,0.08)',
                          }}
                        >
                          {/* Image Box */}
                          <div className="relative w-full aspect-[16/10] bg-[#EAD9B9] overflow-hidden">
                            <Image
                              src={img.src}
                              alt={img.alt}
                              fill
                              sizes="(min-width: 768px) 500px, 100vw"
                              className="object-cover transition duration-500 group-hover:scale-105"
                            />
                            <div
                              className="pointer-events-none absolute inset-0"
                              style={{
                                background: 'linear-gradient(180deg, rgba(42,23,16,0.03) 0%, rgba(42,23,16,0.15) 100%)',
                              }}
                            />
                            
                            {/* Category Tag Badge */}
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

                          {/* Content Body */}
                          <div className="flex flex-1 flex-col p-6 sm:p-8">
                            <div className="flex-1">
                              <h2
                                className="text-3xl leading-none tracking-[-0.04em] transition group-hover:text-[#D89B2B]"
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
                                className="mt-3 text-sm leading-6"
                                style={{ color: '#765E4B', fontFamily: 'var(--font-dm-sans)' }}
                              >
                                {desc}
                              </p>
                            </div>

                            <div className="mt-6 pt-4 border-t flex items-center justify-between" style={{ borderColor: 'rgba(88,55,34,0.08)' }}>
                              <span
                                className="inline-flex items-center rounded-full border px-4 py-2 text-xs font-extrabold uppercase tracking-[0.08em] transition duration-300"
                                style={{
                                  color: '#FFF8EA',
                                  fontFamily: 'var(--font-dm-sans)',
                                  background: '#2A1710',
                                }}
                              >
                                Personalizar →
                              </span>
                            </div>
                          </div>
                        </article>
                      </Link>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <BottomNav />
    </>
  )
}
