// /domain/cart.validators.ts

import { Cart } from "./cart.domain"

export type ValidationResult = {
    valid: boolean
    errors: string[]
}

export function validateCart(cart: Cart): ValidationResult {
    const errors: string[] = []

    cart.items.forEach(item => {
        if (item.type === "lunchbox") {
            const minQty = typeof item.config?.minQuantity === 'number' ? item.config.minQuantity : 20
            if (item.quantity < minQty) {
                errors.push(`Lunchbox mínimo ${minQty} piezas`)
            }
        }
    })

    const fitbarTotal = cart.items
        .filter(i => i.type === "fitbar")
        .reduce((acc, i) => acc + i.base_price * i.quantity, 0)

    if (fitbarTotal > 0 && fitbarTotal < 1000) {
        errors.push("Fitbar mínimo $1000")
    }

    return {
        valid: errors.length === 0,
        errors
    }
}