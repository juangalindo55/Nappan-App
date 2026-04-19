import type { Product } from '@/features/products/product.types'
import { ProductCard } from './ProductCard'

type ProductGridProps = {
  products: Product[]
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 px-4 anim-up d3">
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
