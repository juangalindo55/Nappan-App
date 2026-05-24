import type { Product } from '@/features/products/product.types'
import { TwoColumnProductSection } from './TwoColumnProductSection'
import { CompactProductCard } from './CompactProductCard'

type ProductGridProps = {
  products: Product[]
}

export function ProductGrid({ products }: ProductGridProps) {
  const lunchBox = products.find((p) => p.categoryId === 'lunch-box')
  const fitBar = products.find((p) => p.categoryId === 'fit-bar')

  return (
    <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {lunchBox && <TwoColumnProductSection product={lunchBox} />}
        {fitBar && <CompactProductCard product={fitBar} delay="0.06s" />}
      </div>
    </div>
  )
}
