"use client"

import { useCartStore } from "@/store/cart.store"

export function useCart() {
    const items = useCartStore((state) => state.items)
    const addItem = useCartStore((state) => state.addItem)
    const clearCart = useCartStore((state) => state.clearCart)

    // 🧠 helpers útiles
    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0)

    const totalPrice = items.reduce((acc, item) => {
        const price = Number(item.base_price) || 0
        const qty = Number(item.quantity) || 0

        return acc + price * qty
    }, 0)

    return {
        items,
        addItem,
        clearCart,
        totalItems,
        totalPrice,
    }
}