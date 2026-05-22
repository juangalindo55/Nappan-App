'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserProfile = {
  name: string
  phone: string
  tierName: string | null
  tierSlug: string | null
  discountPercent: number | null
}

type UserState = {
  profile: UserProfile | null
  setProfile: (profile: UserProfile) => void
  clearProfile: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
      clearProfile: () => set({ profile: null }),
    }),
    {
      name: 'nappan-user',
    },
  ),
)
