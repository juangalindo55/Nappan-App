import { useUserStore, type UserProfile } from '@/store/user.store'

export const CUSTOMER_PROFILE_STORAGE_KEY = 'nappan.customerProfile'

export type StoredCustomerProfile = UserProfile

function isBrowser() {
  return typeof window !== 'undefined'
}

export function saveCustomerProfileSession(profile: StoredCustomerProfile) {
  useUserStore.getState().setProfile(profile)

  if (!isBrowser()) return
  window.localStorage.setItem(CUSTOMER_PROFILE_STORAGE_KEY, JSON.stringify(profile))
}

export function clearCustomerProfileSession() {
  useUserStore.getState().clearProfile()

  if (!isBrowser()) return
  window.localStorage.removeItem(CUSTOMER_PROFILE_STORAGE_KEY)
}

export function loadCustomerProfileSession(): StoredCustomerProfile | null {
  const storeProfile = useUserStore.getState().profile
  if (storeProfile) return storeProfile

  if (!isBrowser()) return null

  const raw = window.localStorage.getItem(CUSTOMER_PROFILE_STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as Partial<StoredCustomerProfile>
    if (typeof parsed.phone !== 'string' || typeof parsed.name !== 'string') {
      return null
    }

    const profile = {
      name: parsed.name,
      phone: parsed.phone,
      tierName: typeof parsed.tierName === 'string' ? parsed.tierName : null,
      tierSlug: typeof parsed.tierSlug === 'string' ? parsed.tierSlug : null,
      discountPercent: typeof parsed.discountPercent === 'number' ? parsed.discountPercent : null,
    }

    useUserStore.getState().setProfile(profile)

    return profile
  } catch {
    return null
  }
}
