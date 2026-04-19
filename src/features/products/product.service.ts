import { PRODUCTS } from './product.constants'
import { getActiveProducts } from './product.selectors'

export async function listProducts() {
  return getActiveProducts(PRODUCTS)
}
