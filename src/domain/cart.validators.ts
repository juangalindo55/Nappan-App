// /domain/cart.validators.ts

import { Cart } from "./cart.domain"

export type ValidationResult = {
    valid: boolean
    errors: string[]
}

export function validateCart(cart: Cart): ValidationResult {
    const errors: string[] = []

    cart.items.forEach(item => {
        if (item.type === "lunchbox" && item.quantity < 20) {
            errors.push("Lunchbox mínimo 20 piezas")
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