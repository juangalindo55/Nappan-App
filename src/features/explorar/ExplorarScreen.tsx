'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { listProducts } from '@/features/products/product.service'
import type { Product } from '@/features/products/product.types'
import BottomNav from '@/components/BottomNav'

export default function ExplorarScreen() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      } catch (err) {
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

  return (
    <>
      <main className="min-h-dvh px-4 pb-32 pt-5" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-6 flex items-start justify-between gap-4">
            <header className="flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: 'var(--gold)' }}>
                Explora nuestros productos
              </p>
              <h1 className="mt-2 text-4xl font-semibold leading-tight">
                Todos los productos
              </h1>
              <p className="mt-3 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
                Descubre todas nuestras opciones de pancake art para tu evento.
              </p>
            </header>
            <Link
              href="/"
              className="mt-2 inline-flex shrink-0 items-center justify-center rounded-lg border px-3 py-2 text-sm font-semibold transition active:scale-[0.98]"
              style={{ background: 'var(--surface-1)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              title="Regresar al inicio"
            >
              ← Volver
            </Link>
          </div>

          {error ? (
            <div className="rounded-lg border border-red-400/25 bg-red-500/10 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="grid grid-cols-1 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-40 rounded-lg animate-pulse" style={{ background: 'var(--surface-2)' }} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={product.href}
                  className="block rounded-lg border p-4 transition active:scale-[0.99]"
                  style={{
                    background: 'var(--surface-1)',
                    borderColor: 'var(--border)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--gold)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)'
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold">
                        {product.name}
                      </h2>
                      <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {product.subtitle}
                      </p>
                    </div>
                    <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: 'var(--gold-dim)', color: 'var(--gold)' }}>
                      {product.tag}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </>
  )
}
