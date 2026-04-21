import { getSupabaseClient } from '@/lib/supabase'

type AnyRecord = Record<string, unknown>

const CUSTOMER_TABLE_CANDIDATES = (() => {
  const configured =
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_CUSTOMER_TABLES ?? process.env.NEXT_PUBLIC_CUSTOMER_TABLE
      : undefined

  if (!configured) {
    return ['customers']
  }

  const tables = configured
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean)

  return tables.length > 0 ? tables : ['customers']
})()

const PHONE_COLUMN_CANDIDATES = ['phone'] as const

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

function buildPhoneCandidates(phone: string) {
  const normalized = normalizePhone(phone)
  const candidates = new Set<string>([normalized])

  if (normalized.length === 10) {
    candidates.add(`52${normalized}`)
    candidates.add(`+52${normalized}`)
    candidates.add(`521${normalized}`)
    candidates.add(`+521${normalized}`)
  }

  if (normalized.length === 12 && normalized.startsWith('52')) {
    const local = normalized.slice(2)
    candidates.add(local)
    candidates.add(`+${normalized}`)
    candidates.add(`1${normalized}`)
    candidates.add(`+1${normalized}`)
  }

  if (normalized.length === 13 && normalized.startsWith('521')) {
    const local = normalized.slice(3)
    const country = normalized.slice(1)
    candidates.add(local)
    candidates.add(country)
    candidates.add(`+${normalized}`)
    candidates.add(`+${country}`)
  }

  return Array.from(candidates).filter(Boolean)
}

function buildPhoneLikePatterns(phone: string) {
  return buildPhoneCandidates(phone).map((candidate) => `%${candidate.split('').join('%')}%`)
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message

  if (error && typeof error === 'object') {
    const candidate = error as { message?: unknown; details?: unknown; hint?: unknown; code?: unknown }
    const message =
      typeof candidate.message === 'string' && candidate.message.trim() !== ''
        ? candidate.message
        : 'Error inesperado de Supabase.'
    const details = typeof candidate.details === 'string' ? candidate.details : ''
    const hint = typeof candidate.hint === 'string' ? candidate.hint : ''
    const code = typeof candidate.code === 'string' ? candidate.code : ''

    return [message, details, hint, code ? `code: ${code}` : ''].filter(Boolean).join(' | ')
  }

  return String(error)
}

function toError(error: unknown) {
  return error instanceof Error ? error : new Error(getErrorMessage(error))
}

function isMissingTableError(error: unknown) {
  const message = getErrorMessage(error)
  const lower = message.toLowerCase()
  const code =
    error && typeof error === 'object' && 'code' in error
      ? String((error as { code?: unknown }).code ?? '').toLowerCase()
      : ''

  return (
    (lower.includes('relation') && lower.includes('does not exist')) ||
    lower.includes("could not find the table") ||
    lower.includes('pgrst205') ||
    code === 'pgrst205' ||
    code === '42p01'
  )
}

function isMissingColumnError(error: unknown) {
  const message = getErrorMessage(error).toLowerCase()
  const code =
    error && typeof error === 'object' && 'code' in error
      ? String((error as { code?: unknown }).code ?? '').toLowerCase()
      : ''

  return (
    code === '42703' ||
    message.includes('column') && message.includes('does not exist')
  )
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

function normalizeConfigToken(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function parsePercentFromConfigValue(value: string) {
  const match = value.match(/-?\d+(\.\d+)?/)
  if (!match) {
    return null
  }

  const parsed = Number(match[0])

  if (Number.isNaN(parsed)) {
    return null
  }

  return parsed
}

function buildTierDiscountConfigKeys(tierToken: string) {
  const normalized = tierToken.trim().toLowerCase()
  const compact = normalized.replace(/[^a-z0-9]/g, '')
  const snake = normalized.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')

  const keys = new Set<string>()
  if (snake) keys.add(`tier_${snake}_discount`)
  if (compact) keys.add(`tier_${compact}_discount`)
  return Array.from(keys)
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

function mapTierFromCustomerRow(row: AnyRecord | null) {
  if (!row) {
    return {
      tierName: null,
      tierSlug: null,
      discountPercent: null,
      benefits: [] as string[],
    }
  }

  const membershipTier =
    typeof row.membership_tier === 'string'
      ? row.membership_tier
      : typeof row.membershipTier === 'string'
        ? row.membershipTier
        : null

  return {
    tierName:
      membershipTier ??
      (typeof row.tier_name === 'string'
        ? row.tier_name
        : typeof row.tier_slug === 'string'
          ? row.tier_slug
          : null),
    tierSlug:
      membershipTier ??
      (typeof row.tier_slug === 'string'
        ? row.tier_slug
        : typeof row.tier_name === 'string'
          ? row.tier_name
          : null),
    discountPercent:
      toNumber(row.discount_percent) ??
      toNumber(row.membership_discount) ??
      toNumber(row.discount) ??
      null,
    benefits:
      toStringArray(row.benefits).length > 0
        ? toStringArray(row.benefits)
        : toStringArray(row.perks),
  }
}

async function findRowByPhone(tableName: string, phone: string) {
  const supabase = getSupabaseClient()
  const phoneCandidates = buildPhoneCandidates(phone)
  const phoneLikePatterns = buildPhoneLikePatterns(phone)

  for (const phoneColumn of PHONE_COLUMN_CANDIDATES) {
    for (const candidate of phoneCandidates) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq(phoneColumn, candidate)
        .limit(1)
        .maybeSingle()

      if (error) {
        if (isMissingTableError(error)) {
          return { row: null, missingTable: true }
        }

        if (isMissingColumnError(error)) {
          break
        }

        const code =
          typeof error === 'object' && error && 'code' in error
            ? String((error as { code?: unknown }).code ?? '').toLowerCase()
            : ''

        // If there are duplicated rows for the same phone, pick the first one.
        if (code === 'pgrst116') {
          const { data: listData, error: listError } = await supabase
            .from(tableName)
            .select('*')
            .eq(phoneColumn, candidate)
            .limit(1)

          if (listError) {
            throw toError(listError)
          }

          if (Array.isArray(listData) && listData.length > 0) {
            return { row: listData[0] as AnyRecord, missingTable: false }
          }

          continue
        }

        throw toError(error)
      }

      if (data) {
        return { row: data as AnyRecord, missingTable: false }
      }
    }

    // Fallback for mixed formats like "+52 81 23 50 97 68".
    for (const likePattern of phoneLikePatterns) {
      const { data: likeData, error: likeError } = await supabase
        .from(tableName)
        .select('*')
        .like(phoneColumn, likePattern)
        .limit(1)

      if (likeError) {
        if (isMissingTableError(likeError)) {
          return { row: null, missingTable: true }
        }

        if (isMissingColumnError(likeError)) {
          break
        }

        throw toError(likeError)
      }

      if (Array.isArray(likeData) && likeData.length > 0) {
        return { row: likeData[0] as AnyRecord, missingTable: false }
      }
    }
  }

  return { row: null, missingTable: false }
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

    throw toError(error)
  }

  return { row: data as AnyRecord | null, missingTable: false }
}

async function loadCustomerRow(phone: string, name: string) {
  for (const tableName of CUSTOMER_TABLE_CANDIDATES) {
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

  return null
}

async function loadCustomerByPhone(phone: string) {
  for (const tableName of CUSTOMER_TABLE_CANDIDATES) {
    const found = await findRowByPhone(tableName, phone)
    if (found.missingTable) continue

    if (found.row) {
      return { row: found.row, tableName }
    }
  }

  return null
}

async function loadTier(row: AnyRecord | null) {
  const directTier = mapTierFromCustomerRow(row)

  const tierId = row?.tier_id ?? row?.tierId
  const membershipTier = row?.membership_tier ?? row?.membershipTier
  const tierSlug = row?.tier_slug ?? row?.tierSlug ?? membershipTier

  const supabase = getSupabaseClient()

  async function withConfigDiscount(base: ReturnType<typeof mapTier>) {
    const tierToken = base.tierSlug ?? base.tierName

    if (!tierToken) {
      return base
    }

    try {
      const { data, error } = await supabase
        .from('app_config')
        .select('key, value')
        .limit(500)

      if (error || !Array.isArray(data)) {
        return base
      }

      const expectedKeys = buildTierDiscountConfigKeys(String(tierToken))
      const exactMatch = data.find((item) => {
        const key = typeof item.key === 'string' ? item.key.trim().toLowerCase() : ''
        return expectedKeys.includes(key)
      })

      if (exactMatch && typeof exactMatch.value === 'string') {
        const parsedExact = parsePercentFromConfigValue(exactMatch.value)
        if (parsedExact !== null) {
          return {
            ...base,
            discountPercent: parsedExact,
          }
        }
      }

      const normalizedTier = normalizeConfigToken(String(tierToken))
      const fallbackMatch = data.find((item) => {
        const key = typeof item.key === 'string' ? item.key : ''
        const normalizedKey = normalizeConfigToken(key)
        return normalizedKey.includes(`tier${normalizedTier}discount`)
      })

      if (!fallbackMatch || typeof fallbackMatch.value !== 'string') {
        return base
      }

      const parsedFallback = parsePercentFromConfigValue(fallbackMatch.value)
      if (parsedFallback === null) {
        return base
      }

      return {
        ...base,
        discountPercent: parsedFallback,
      }
    } catch {
      return base
    }
  }

  if (!tierId && !tierSlug) {
    return withConfigDiscount(directTier)
  }

  // If tier comes from membership_tier and there is no relational tier id,
  // resolve everything from customer row + app_config to avoid 404 noise
  // when customer_tiers/tiers tables do not exist in this project.
  if (!tierId && membershipTier) {
    return withConfigDiscount(directTier)
  }

  for (const tableName of ['customer_tiers', 'tiers']) {
    if (tierId) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', tierId)
        .maybeSingle()

      if (error) {
        if (isMissingTableError(error) || isMissingColumnError(error)) {
          continue
        }

        throw toError(error)
      }

      if (data) {
        return withConfigDiscount(mapTier(data as AnyRecord))
      }
    }

    if (!tierSlug) {
      continue
    }

    const slugValue = String(tierSlug).trim()

    if (!slugValue) {
      continue
    }

    let matchedTier: AnyRecord | null = null

    for (const column of ['slug', 'tier_slug', 'name', 'tier_name', 'label']) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .ilike(column, slugValue)
        .limit(1)

      if (error) {
        if (isMissingTableError(error)) {
          matchedTier = null
          break
        }

        if (isMissingColumnError(error)) {
          continue
        }

        throw toError(error)
      }

      if (Array.isArray(data) && data.length > 0) {
        matchedTier = data[0] as AnyRecord
        break
      }
    }

    if (matchedTier) {
      return withConfigDiscount(mapTier(matchedTier))
    }

    if (tierId) {
      continue
    }
  }

  return withConfigDiscount(directTier)
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
    if (isMissingTableError(error)) {
      return []
    }

    return []
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

  if (!customerLookup) {
    return {
      foundExisting: false,
      profile: {
        id: null,
        name: input.name.trim(),
        phone: normalizedPhone,
        tierName: null,
        tierSlug: null,
        discountPercent: null,
        benefits: [],
      },
      orders: await loadOrders(normalizedPhone),
    }
  }

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

  if (!created) {
    return {
      foundExisting: false,
      profile: {
        id: null,
        name: cleanName,
        phone: normalizedPhone,
        tierName: null,
        tierSlug: null,
        discountPercent: null,
        benefits: [],
      },
      orders: await loadOrders(normalizedPhone),
    }
  }

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
