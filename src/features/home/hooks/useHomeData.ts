'use client'

import { useEffect, useState } from 'react'
import { getProductSnapshot, listProducts } from '@/features/products/product.service'
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
  const [greeting] = useState(() => getGreeting())
  const [products, setProducts] = useState<Product[]>(() => getProductSnapshot())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function loadProducts() {
      try {
        setLoading(products.length === 0)
        setError(null)

        const data = await listProducts()

        if (mounted) {
          setProducts(data)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'No pudimos cargar los productos.')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadProducts()

    return () => {
      mounted = false
    }
  }, [products.length])

  return {
    featuredProduct: products[0] ?? null,
    greeting,
    products,
    loading,
    error,
  }
}
