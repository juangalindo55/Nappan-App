export const CUSTOMER_PROFILE_STORAGE_KEY = 'nappan.customerProfile'

export type StoredCustomerProfile = {
  name: string
  phone: string
  tierName: string | null
  tierSlug: string | null
  discountPercent: number | null
}

function isBrowser() {
  return typeof window !== 'undefined'
}

export function saveCustomerProfileSession(profile: StoredCustomerProfile) {
  if (!isBrowser()) return
  window.localStorage.setItem(CUSTOMER_PROFILE_STORAGE_KEY, JSON.stringify(profile))
}

export function clearCustomerProfileSession() {
  if (!isBrowser()) return
  window.localStorage.removeItem(CUSTOMER_PROFILE_STORAGE_KEY)
}

export function loadCustomerProfileSession(): StoredCustomerProfile | null {
  if (!isBrowser()) return null

  const raw = window.localStorage.getItem(CUSTOMER_PROFILE_STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as Partial<StoredCustomerProfile>
    if (typeof parsed.phone !== 'string' || typeof parsed.name !== 'string') {
      return null
    }

    return {
      name: parsed.name,
      phone: parsed.phone,
      tierName: typeof parsed.tierName === 'string' ? parsed.tierName : null,
      tierSlug: typeof parsed.tierSlug === 'string' ? parsed.tierSlug : null,
      discountPercent: typeof parsed.discountPercent === 'number' ? parsed.discountPercent : null,
    }
  } catch {
    return null
  }
}
