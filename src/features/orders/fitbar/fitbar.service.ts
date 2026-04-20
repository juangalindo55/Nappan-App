import { getSupabaseClient } from '@/lib/supabase'

export type FitbarProductRow = {
  sku: string
  name: string
  base_price: number
  section: string
}

export async function listFitbarProducts() {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('products')
    .select('sku,name,base_price,section')
    .eq('section', 'fitbar')
    .order('name', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as FitbarProductRow[]
}
