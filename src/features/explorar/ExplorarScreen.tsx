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
      <main className="min-h-dvh bg-[#0C0806] px-4 pb-32 pt-5 text-[#F0E4CC]">
        <div className="mx-auto w-full max-w-3xl">
          <header className="mb-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#E8A420]">
              Explora nuestros productos
            </p>
            <h1 className="mt-2 text-4xl font-semibold leading-tight text-[#FFF6E5]">
              Todos los productos
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#F0E4CC]/65">
              Descubre todas nuestras opciones de pancake art para tu evento.
            </p>
          </header>

          {error ? (
            <div className="rounded-lg border border-red-400/25 bg-red-500/10 p-4 text-sm text-red-100">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="grid grid-cols-1 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-40 rounded-lg bg-[#181209] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={product.href}
                  className="block rounded-lg border border-[#E8A420]/10 bg-[#181209] p-4 transition hover:border-[#E8A420]/30 active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-[#FFF6E5]">
                        {product.name}
                      </h2>
                      <p className="mt-1 text-sm text-[#F0E4CC]/65">
                        {product.subtitle}
                      </p>
                    </div>
                    <span className="rounded-full bg-[#E8A420]/10 px-2.5 py-1 text-xs font-semibold text-[#E8A420]">
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
