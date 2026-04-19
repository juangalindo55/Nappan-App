// /store/cart.store.ts

import { create } from "zustand"
import { Cart, CartItem } from "@/domain/cart.domain"
import { calculateCart } from "@/domain/cart.pricing"
import { validateCart } from "@/domain/cart.validators"
import { v4 as uuid } from "uuid"

type CartStore = {
    cart: Cart

    addItem: (item: Omit<CartItem, "id">) => void
    removeItem: (id: string) => void
    updateQuantity: (id: string, qty: number) => void

    addExtra: (itemId: string, extra: any) => void
    removeExtra: (itemId: string, extraId: string) => void

    validate: () => { valid: boolean; errors: string[] }
    reset: () => void
}

export const useCartStore = create<CartStore>((set, get) => ({
    cart: {
        version: "v1",
        type: "mixed",
        items: [],
        summary: {
            subtotal: 0,
            extras_total: 0,
            shipping: 0,
            total: 0
        }
    },

    addItem: (item) => {
        const newItem = { ...item, id: uuid() }

        const updated = {
            ...get().cart,
            items: [...get().cart.items, newItem]
        }

        set({ cart: calculateCart(updated) })
    },

    removeItem: (id) => {
        const updated = {
            ...get().cart,
            items: get().cart.items.filter(i => i.id !== id)
        }

        set({ cart: calculateCart(updated) })
    },

    updateQuantity: (id, qty) => {
        const updated = {
            ...get().cart,
            items: get().cart.items.map(i =>
                i.id === id ? { ...i, quantity: qty } : i
            )
        }

        set({ cart: calculateCart(updated) })
    },

    addExtra: (itemId, extra) => {
        const updated = {
            ...get().cart,
            items: get().cart.items.map(i =>
                i.id === itemId
                    ? { ...i, extras: [...i.extras, { ...extra, id: uuid() }] }
                    : i
            )
        }

        set({ cart: calculateCart(updated) })
    },

    removeExtra: (itemId, extraId) => {
        const updated = {
            ...get().cart,
            items: get().cart.items.map(i =>
                i.id === itemId
                    ? { ...i, extras: i.extras.filter(e => e.id !== extraId) }
                    : i
            )
        }

        set({ cart: calculateCart(updated) })
    },

    validate: () => validateCart(get().cart),

    reset: () =>
        set({
            cart: {
                version: "v1",
                type: "mixed",
                items: [],
                summary: {
                    subtotal: 0,
                    extras_total: 0,
                    shipping: 0,
                    total: 0
                }
            }
        })
}))