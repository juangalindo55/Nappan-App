import { getSupabaseClient } from '@/lib/supabase'

export type LunchboxVariant = 'lunchbox1' | 'lunchbox2'

export type LunchboxExtraOption = {
  id: string
  label: string
  price: number
}

export type LunchboxVariantConfig = {
  label: string
  price: number
  note: string
}

export type LunchboxCatalog = {
  variants: Record<LunchboxVariant, LunchboxVariantConfig>
  extras: Record<LunchboxVariant, LunchboxExtraOption[]>
}

export type LunchboxDesignOption = {
  id: string
  label: string
}

export type LunchboxComplementOption = {
  id: string
  label: string
  description: string
}

export type LunchboxDesignsAndComplements = {
  designs: LunchboxDesignOption[]
  complements: LunchboxComplementOption[]
  minQuantity: number
}

type ProductRow = {
  id: string
  sku: string
  name: string | null
  description: string | null
  base_price: number | null
  section: string | null
  is_active?: boolean | null
  sort_order?: number | null
}

type ProductExtraRow = {
  id: string
  product_id: string
  label: string | null
  price: number | string | null
  is_active?: boolean | null
  sort_order?: number | null
}

type AppConfigRow = {
  key: string
  value: string
}

export const FALLBACK_LUNCHBOX_VARIANTS: Record<LunchboxVariant, LunchboxVariantConfig> = {
  lunchbox1: {
    label: 'Lunchbox 1',
    price: 125,
    note: 'La clásica. Perfecta para eventos. Agrega tus extras favoritos.',
  },
  lunchbox2: {
    label: 'Lunchbox 2',
    price: 130,
    note: 'La completa. Más antojo. Incluye opciones premium.',
  },
}

export const FALLBACK_LUNCHBOX_EXTRAS: Record<LunchboxVariant, LunchboxExtraOption[]> = {
  lunchbox1: [
    {
      id: 'lunchbox1-salchipulpos',
      label: 'Salchipulpos + catsup',
      price: 25,
    },
    {
      id: 'lunchbox1-nucolato',
      label: 'Agregar Nucolato',
      price: 10,
    },
  ],
  lunchbox2: [
    {
      id: 'lunchbox2-croissant',
      label: 'Upgrade a croissant completo',
      price: 20,
    },
    {
      id: 'lunchbox2-nucolato',
      label: 'Agregar Nucolato',
      price: 10,
    },
  ],
}

export const FALLBACK_LUNCHBOX_DESIGNS: LunchboxDesignOption[] = [
  { id: 'lunchbox_design_1', label: 'Osito' },
  { id: 'lunchbox_design_2', label: 'Capibara' },
]

export const FALLBACK_LUNCHBOX_COMPLEMENTS: LunchboxComplementOption[] = [
  { id: 'lunchbox_complement_1', label: 'Fruta',    description: 'Uva, durazno y fresa frescos' },
  { id: 'lunchbox_complement_2', label: 'Gelatina', description: 'Arco iris de sabores' },
]

const VALID_VARIANTS = new Set<LunchboxVariant>(['lunchbox1', 'lunchbox2'])

function normalizeVariant(sku: string): LunchboxVariant | null {
  return VALID_VARIANTS.has(sku as LunchboxVariant) ? (sku as LunchboxVariant) : null
}

function buildAppConfigMap(rows: AppConfigRow[]) {
  return new Map(rows.map(({ key, value }) => [key, value]))
}

function getTrimmedText(value: string | null | undefined) {
  return typeof value === 'string' ? value.trim() : ''
}

function buildFallbackCatalog(): LunchboxCatalog {
  return {
    variants: FALLBACK_LUNCHBOX_VARIANTS,
    extras: FALLBACK_LUNCHBOX_EXTRAS,
  }
}

export async function loadLunchboxCatalog(): Promise<LunchboxCatalog> {
  const supabase = getSupabaseClient()

  const [{ data: productsData, error: productsError }, { data: configData, error: configError }] = await Promise.all([
    supabase
      .from('products')
      .select('id, sku, name, description, base_price, section, is_active, sort_order')
      .eq('section', 'lunchbox')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
    supabase
      .from('app_config')
      .select('key, value')
      .limit(500),
  ])

  if (productsError) {
    console.error('LUNCHBOX PRODUCTS ERROR:', productsError)
    return buildFallbackCatalog()
  }

  if (configError) {
    console.error('LUNCHBOX APP CONFIG ERROR:', configError)
  }

  const products = (productsData ?? []) as ProductRow[]
  if (products.length === 0) {
    return buildFallbackCatalog()
  }

  const appConfig = buildAppConfigMap((configData ?? []) as AppConfigRow[])

  const productIds = products.map((product) => product.id).filter(Boolean)
  const extrasRows = productIds.length > 0
    ? await (async () => {
        const { data, error } = await supabase
          .from('product_extras')
          .select('id, product_id, label, price, is_active, sort_order')
          .in('product_id', productIds)
          .eq('is_active', true)
          .order('sort_order', { ascending: true })

        if (error) {
          console.error('LUNCHBOX EXTRAS ERROR:', error)
          return [] as ProductExtraRow[]
        }

        return (data ?? []) as ProductExtraRow[]
      })()
    : []

  const variants = { ...FALLBACK_LUNCHBOX_VARIANTS }
  const extrasByVariant: Record<LunchboxVariant, LunchboxExtraOption[]> = {
    lunchbox1: [],
    lunchbox2: [],
  }

  products.forEach((product) => {
    const variant = normalizeVariant(product.sku)
    if (!variant) {
      return
    }

    const fallback = FALLBACK_LUNCHBOX_VARIANTS[variant]
    const label = getTrimmedText(product.name) || fallback.label
    const note = getTrimmedText(product.description) || fallback.note
    const price = Number(product.base_price) || fallback.price

    variants[variant] = {
      label,
      note,
      price,
    }

    const variantExtras = extrasRows
      .filter((extra) => extra.product_id === product.id)
      .map((extra, index) => {
        const fallbackExtra = FALLBACK_LUNCHBOX_EXTRAS[variant][index]
        const configKey = `extra_label_${product.sku}_${index + 1}`
        const labelOverride = getTrimmedText(appConfig.get(configKey))
        const extraLabel = labelOverride || getTrimmedText(extra.label) || fallbackExtra?.label || `Extra ${index + 1}`

        return {
          id: String(extra.id),
          label: extraLabel,
          price: Number(extra.price) || fallbackExtra?.price || 0,
        }
      })

    extrasByVariant[variant] = variantExtras.length > 0 ? variantExtras : FALLBACK_LUNCHBOX_EXTRAS[variant]
  })

  if (extrasByVariant.lunchbox1.length === 0) {
    extrasByVariant.lunchbox1 = FALLBACK_LUNCHBOX_EXTRAS.lunchbox1
  }

  if (extrasByVariant.lunchbox2.length === 0) {
    extrasByVariant.lunchbox2 = FALLBACK_LUNCHBOX_EXTRAS.lunchbox2
  }

  return {
    variants,
    extras: extrasByVariant,
  }
}

export async function loadLunchboxDesignsAndComplements(): Promise<LunchboxDesignsAndComplements> {
  const supabase = getSupabaseClient()

  const { data: configData, error } = await supabase
    .from('app_config')
    .select('key, value')
    .like('key', 'lunchbox_%')

  if (error || !configData) {
    if (error) console.error('LUNCHBOX OPTIONS ERROR:', error)
    return {
      designs: FALLBACK_LUNCHBOX_DESIGNS,
      complements: FALLBACK_LUNCHBOX_COMPLEMENTS,
      minQuantity: 20,
    }
  }

  const configMap = new Map(configData.map(({ key, value }) => [key, value]))
  
  const designs: LunchboxDesignOption[] = []
  for (let i = 1; i <= 10; i++) {
    const label = configMap.get(`lunchbox_design_${i}_label`)
    if (!label) break
    designs.push({ id: `lunchbox_design_${i}`, label })
  }

  const complements: LunchboxComplementOption[] = []
  for (let i = 1; i <= 10; i++) {
    const label = configMap.get(`lunchbox_complement_${i}_label`)
    const description = configMap.get(`lunchbox_complement_${i}_description`) ?? ''
    if (!label) break
    complements.push({ id: `lunchbox_complement_${i}`, label, description })
  }

  const minQuantityStr = configMap.get('lunchbox_min_quantity')
  const minQuantity = minQuantityStr ? parseInt(minQuantityStr, 10) : 20

  return { 
    designs: designs.length > 0 ? designs : FALLBACK_LUNCHBOX_DESIGNS, 
    complements: complements.length > 0 ? complements : FALLBACK_LUNCHBOX_COMPLEMENTS,
    minQuantity: isNaN(minQuantity) ? 20 : minQuantity,
  }
}
