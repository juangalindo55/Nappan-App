// /domain/cart.domain.ts

export type CartType = "lunchbox" | "fitbar" | "artistic" | "mixed"

export type Cart = {
    version: "v1"
    type: CartType
    items: CartItem[]
    summary: CartSummary
}

export type CartItem = {
    id: string
    type: CartType

    sku: string
    name: string

    quantity: number
    base_price: number

    config?: Record<string, unknown>

    includes: string[]

    extras: CartExtra[]
}

export type CartExtra = {
    id: string
    label: string
    price: number
}

export type CartSummary = {
    subtotal: number
    extras_total: number
    shipping: number
    total: number
}