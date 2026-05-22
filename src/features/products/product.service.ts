import { PRODUCTS } from './product.constants'
import { getActiveProducts } from './product.selectors'

// TODO (Supabase integration):
// 1. Import the Supabase client from '@/lib/supabase'.
// 2. Replace PRODUCTS with a database query against the products table.
// 3. Map database rows into the Product UI/domain shape before filtering.
// 4. Throw Supabase errors here so hooks can expose real error states.
// 5. Remove the PRODUCTS import once the backend product source is stable.
//
// Example shape:
// const { data, error } = await supabase.from('products').select('*')
// if (error) throw error
// const products = data.map(mapProductRowToProduct)
// return getActiveProducts(products)
export function getProductSnapshot() {
  return getActiveProducts(PRODUCTS)
}

export async function listProducts() {
  // Currently using mock data from constants. This keeps local development stable
  // while the hook already follows the async flow needed for Supabase later.
  return getProductSnapshot()
}
