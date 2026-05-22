'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type LiveEventDraft = {
  name: string
  phone: string
  guestCount: string
  eventDate: string
}

type BookingStore = {
  liveEventDraft: LiveEventDraft
  updateLiveEventDraft: (draft: Partial<LiveEventDraft>) => void
  resetLiveEventDraft: () => void
}

const emptyLiveEventDraft: LiveEventDraft = {
  name: '',
  phone: '',
  guestCount: '',
  eventDate: '',
}

export const useBookingStore = create<BookingStore>()(
  persist(
    (set) => ({
      liveEventDraft: emptyLiveEventDraft,
      updateLiveEventDraft: (draft) =>
        set((state) => ({
          liveEventDraft: {
            ...state.liveEventDraft,
            ...draft,
          },
        })),
      resetLiveEventDraft: () => set({ liveEventDraft: emptyLiveEventDraft }),
    }),
    {
      name: 'nappan-booking',
    },
  ),
)
