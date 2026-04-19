export type ProductCategoryId =
  | 'nappan-box'
  | 'lunch-box'
  | 'fit-bar'
  | 'events'

export type ProductVisual = {
  gradient: string
  glow: string
  accentColor: string
}

export type Product = {
  id: string
  slug: string
  name: string
  subtitle: string
  tag: string
  href: string
  categoryId: ProductCategoryId
  visual: ProductVisual
  sortOrder: number
  isActive: boolean
}
