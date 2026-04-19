"use client"

import { useCart } from "@/hooks/useCart"
import { useConfig } from "@/hooks/useConfig"

type Props = {
    product: any
}

export default function AddToCartButton({ product }: Props) {
    const { addItem } = useCart()
    const { config } = useConfig()

    function handleAdd() {
        if (!config) return

        const includes = config.includes[product.sku] || []
        const extras = config.extras[product.sku] || []

        addItem({
            ...product,
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