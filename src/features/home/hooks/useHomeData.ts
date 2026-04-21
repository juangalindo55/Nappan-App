'use client'

import { useEffect, useState } from 'react'
import { listProducts } from '@/features/products/product.service'
import type { Product } from '@/features/products/product.types'

type HomeData = {
  featuredProduct: Product | null
  greeting: string
  products: Product[]
  loading: boolean
  error: string | null
}

function getGreeting(date = new Date()) {
  const hour = date.getHours()

  if (hour < 12) return 'Buenos días'
  if (hour < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

export function useHomeData(): HomeData {
  const [products, setProducts] = useState<Product[]>([])
  const [greeting] = useState(() => getGreeting())
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

  return {
    featuredProduct: products[0] ?? null,
    greeting,
    products,
    loading,
    error,
  }
}
