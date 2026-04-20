import { getSupabaseClient } from '@/lib/supabase'

type AnyRecord = Record<string, any>

export type CustomerOrder = {
  order_number: string | null
  total: number | null
  status: string | null
  created_at: string | null
}

export type CustomerProfile = {
  id: string | null
  name: string
  phone: string
  tierName: string | null
  tierSlug: string | null
  discountPercent: number | null
  benefits: string[]
}

export type CustomerProfileResult = {
  profile: CustomerProfile
  orders: CustomerOrder[]
  foundExisting: boolean
}

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, '')
}

function isMissingTableError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  return message.toLowerCase().includes('relation') && message.toLowerCase().includes('does not exist')
}

function toNumber(value: unknown) {
  if (typeof value === 'number') return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isNaN(parsed) ? null : parsed
  }
  return null
}

function toStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean)
  }

  if (typeof value === 'string' && value.trim() !== '') {
    return value
      .split('|')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
}

function mapTier(row: AnyRecord | null) {
  if (!row) {
    return {
      tierName: null,
      tierSlug: null,
      discountPercent: null,
      benefits: [] as string[],
    }
  }

  return {
    tierName:
      typeof row.name === 'string'
        ? row.name
        : typeof row.tier_name === 'string'
          ? row.tier_name
          : typeof row.label === 'string'
            ? row.label
            : null,
    tierSlug:
      typeof row.slug === 'string'
        ? row.slug
        : typeof row.tier_slug === 'string'
          ? row.tier_slug
          : null,
    discountPercent:
      toNumber(row.discount_percent) ?? toNumber(row.discount) ?? null,
    benefits:
      toStringArray(row.benefits).length > 0
        ? toStringArray(row.benefits)
        : toStringArray(row.perks),
  }
}

async function findRowByPhone(tableName: string, phone: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .eq('phone', phone)
    .maybeSingle()

  if (error) {
    if (isMissingTableError(error)) {
      return { row: null, missingTable: true }
    }

    throw error
  }

  return { row: data as AnyRecord | null, missingTable: false }
}

async function insertRow(tableName: string, payload: Record<string, unknown>) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from(tableName)
    .insert(payload)
    .select('*')
    .single()

  if (error) {
    if (isMissingTableError(error)) {
      return { row: null, missingTable: true }
    }

    throw error
  }

  return { row: data as AnyRecord | null, missingTable: false }
}

async function loadCustomerRow(phone: string, name: string) {
  for (const tableName of ['customers', 'profiles']) {
    const found = await findRowByPhone(tableName, phone)
    if (found.missingTable) continue

    if (found.row) {
      return { row: found.row, tableName, created: false }
    }

    if (name.trim()) {
      const created = await insertRow(tableName, {
        phone,
        name: name.trim(),
      })

      if (created.missingTable) continue

      if (created.row) {
        return { row: created.row, tableName, created: true }
      }
    }
  }

  throw new Error('No se encontró una tabla de clientes compatible en Supabase.')
}

async function loadCustomerByPhone(phone: string) {
  for (const tableName of ['customers', 'profiles']) {
    const found = await findRowByPhone(tableName, phone)
    if (found.missingTable) continue

    if (found.row) {
      return { row: found.row, tableName }
    }
  }

  return null
}

async function loadTier(row: AnyRecord | null) {
  const directTier = mapTier(row)

  const tierId = row?.tier_id ?? row?.tierId
  const tierSlug = row?.tier_slug ?? row?.tierSlug

  if (!tierId && !tierSlug) {
    return directTier
  }

  const supabase = getSupabaseClient()

  for (const tableName of ['customer_tiers', 'tiers']) {
    let query = supabase.from(tableName).select('*')

    if (tierId) {
      query = query.eq('id', tierId)
    } else if (tierSlug) {
      query = query.eq('slug', tierSlug)
    }

    const { data, error } = await query.maybeSingle()

    if (error) {
      if (isMissingTableError(error)) {
        continue
      }

      throw error
    }

    if (data) {
      return mapTier(data as AnyRecord)
    }
  }

  return directTier
}

async function loadOrders(phone: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('orders')
    .select('order_number, total, status, created_at')
    .eq('customer_phone', phone)
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    throw error
  }

  return (data ?? []).map((order) => ({
    order_number: typeof order.order_number === 'string' ? order.order_number : null,
    total: toNumber(order.total),
    status: typeof order.status === 'string' ? order.status : null,
    created_at: typeof order.created_at === 'string' ? order.created_at : null,
  }))
}

export async function resolveCustomerProfile(input: {
  phone: string
  name: string
}): Promise<CustomerProfileResult> {
  const normalizedPhone = normalizePhone(input.phone)

  if (normalizedPhone.length < 10) {
    throw new Error('Ingresa un número de teléfono válido.')
  }

  const customerLookup = await loadCustomerRow(normalizedPhone, input.name)
  const tier = await loadTier(customerLookup.row)
  const orders = await loadOrders(normalizedPhone)

  return {
    foundExisting: !customerLookup.created,
    profile: {
      id: typeof customerLookup.row?.id === 'string' ? customerLookup.row.id : null,
      name:
        typeof customerLookup.row?.name === 'string'
          ? customerLookup.row.name
          : typeof customerLookup.row?.full_name === 'string'
            ? customerLookup.row.full_name
            : typeof input.name === 'string'
              ? input.name.trim()
              : '',
      phone: normalizedPhone,
      tierName: tier.tierName,
      tierSlug: tier.tierSlug,
      discountPercent: tier.discountPercent,
      benefits: tier.benefits,
    },
    orders,
  }
}

export async function lookupCustomerProfile(phone: string): Promise<CustomerProfileResult | null> {
  const normalizedPhone = normalizePhone(phone)

  if (normalizedPhone.length < 10) {
    throw new Error('Ingresa un número de teléfono válido.')
  }

  const customer = await loadCustomerByPhone(normalizedPhone)

  if (!customer) {
    return null
  }

  const tier = await loadTier(customer.row)
  const orders = await loadOrders(normalizedPhone)

  return {
    foundExisting: true,
    profile: {
      id: typeof customer.row?.id === 'string' ? customer.row.id : null,
      name:
        typeof customer.row?.name === 'string'
          ? customer.row.name
          : typeof customer.row?.full_name === 'string'
            ? customer.row.full_name
            : '',
      phone: normalizedPhone,
      tierName: tier.tierName,
      tierSlug: tier.tierSlug,
      discountPercent: tier.discountPercent,
      benefits: tier.benefits,
    },
    orders,
  }
}

export async function createBasicCustomerProfile(input: {
  phone: string
  name: string
}): Promise<CustomerProfileResult> {
  const normalizedPhone = normalizePhone(input.phone)

  if (normalizedPhone.length < 10) {
    throw new Error('Ingresa un número de teléfono válido.')
  }

  const cleanName = input.name.trim()

  if (!cleanName) {
    throw new Error('Escribe un nombre para continuar.')
  }

  const existing = await loadCustomerByPhone(normalizedPhone)

  if (existing) {
    return resolveCustomerProfile({ phone: normalizedPhone, name: cleanName })
  }

  const created = await loadCustomerRow(normalizedPhone, cleanName)
  const tier = await loadTier(created.row)
  const orders = await loadOrders(normalizedPhone)

  return {
    foundExisting: false,
    profile: {
      id: typeof created.row?.id === 'string' ? created.row.id : null,
      name: cleanName,
      phone: normalizedPhone,
      tierName: tier.tierName,
      tierSlug: tier.tierSlug,
      discountPercent: tier.discountPercent,
      benefits: tier.benefits,
    },
    orders,
  }
}
