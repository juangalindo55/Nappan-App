import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type OrderType = 'catering' | 'event'

export type OrderCategory =
  | 'lunchbox'
  | 'artistic-box'
  | 'wellness-bar'
  | 'live-event'

type OrderFlowState = {
  category: OrderCategory | null
  orderType: OrderType | null
  setOrderCategory: (category: OrderCategory) => void
  resetOrderFlow: () => void
}

function getOrderType(category: OrderCategory): OrderType {
  return category === 'live-event' ? 'event' : 'catering'
}

export const useOrderFlowStore = create<OrderFlowState>()(
  persist(
    (set) => ({
      category: null,
      orderType: null,

      setOrderCategory: (category) =>
        set({
          category,
          orderType: getOrderType(category),
        }),

      resetOrderFlow: () =>
        set({
          category: null,
          orderType: null,
        }),
    }),
    {
      name: 'nappan-order-flow',
    },
  ),
)
