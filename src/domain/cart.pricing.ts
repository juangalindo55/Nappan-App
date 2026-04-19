// /domain/cart.pricing.ts

import { Cart } from "./cart.domain"

export function calculateCart(cart: Cart): Cart {
    let subtotal = 0
    let extras_total = 0

    cart.items.forEach(item => {
        subtotal += item.base_price * item.quantity

        item.extras.forEach(extra => {
            extras_total += extra.price * item.quantity
        })
    })

    const shipping = calculateShipping(subtotal)

    const total = subtotal + extras_total + shipping

    return {
        ...cart,
        summary: {
            subtotal,
            extras_total,
            shipping,
            total
        }
    }
}

function calculateShipping(subtotal: number): number {
    if (subtotal > 2000) return 0
    return 150
}