'use client'

import { useEffect, useState } from 'react'
import { listProducts } from '@/features/products/product.service'
import type { Product } from '@/features/products/product.types'

type HomeData = {
  featuredProduct: Product | null
  greeting: string
  products: Product[]
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

  useEffect(() => {
    let cancelled = false

    async function loadProducts() {
      const nextProducts = await listProducts()

      if (!cancelled) {
        setProducts(nextProducts)
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
  }
}
