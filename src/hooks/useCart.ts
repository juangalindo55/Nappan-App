"use client"

import { useCartStore } from "@/store/cart.store"

export function useCart() {
    const items = useCartStore((state) => state.cart.items)
    const addItem = useCartStore((state) => state.addItem)
    const clearCart = useCartStore((state) => state.reset)
    const updateItemExtras = useCartStore((state) => state.updateItemExtras)

    // 🧠 helpers útiles
    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0)

    const totalPrice = useCartStore((state) => state.cart.summary.total)

    return {
        items,
        addItem,
        clearCart,
        updateItemExtras,
        totalItems,
        totalPrice,
    }
}
