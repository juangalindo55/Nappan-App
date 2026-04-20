"use client"

import { useCart } from "@/hooks/useCart"
import { useConfig } from "@/hooks/useConfig"
import type { CartType } from "@/domain/cart.domain"

type ProductForCart = {
    sku: string
    name: string
    type?: CartType
    base_price?: number
    price?: number
    quantity?: number
    config?: Record<string, unknown>
}

type Props = {
    product: ProductForCart
}

export default function AddToCartButton({ product }: Props) {
    const { addItem } = useCart()
    const { config } = useConfig()

    function handleAdd() {
        if (!config) return

        const includes = config.includes[product.sku] || []
        const extras = config.extras[product.sku] || []
        const base_price = Number(product.base_price ?? product.price ?? 0)
        const quantity = Number(product.quantity ?? 1) || 1

        addItem({
            type: product.type ?? "mixed",
            sku: product.sku,
            name: product.name,
            quantity,
            base_price,
            config: product.config,
            includes,
            extras,
        })
    }

    return (
        <button onClick={handleAdd}>
            Agregar
        </button>
    )
}
