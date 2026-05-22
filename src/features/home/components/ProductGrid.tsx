import type { Product } from '@/features/products/product.types'
import { ProductCard } from './ProductCard'

type ProductGridProps = {
  products: Product[]
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 px-5 sm:px-8 md:grid-cols-2 lg:px-10 anim-up d3">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          delay={`${0.18 + index * 0.06}s`}
        />
      ))}
    </div>
  )
}
