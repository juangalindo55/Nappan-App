import type { Product } from './product.types'

export function getActiveProducts(products: Product[]) {
  return products
    .filter((product) => product.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}
