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

    const shipping = 0
    const total = subtotal + extras_total

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
