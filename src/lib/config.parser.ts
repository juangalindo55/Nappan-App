type ParsedConfig = {
    includes: Record<string, string[]>
    extras: Record<string, string[]>
    shipping: {
        km: number
        price: number
    }[]
    raw: Record<string, string>
}

export function parseConfig(config: { key: string; value: string }[]): ParsedConfig {
    const parsed: ParsedConfig = {
        includes: {},
        extras: {},
        shipping: [],
        raw: {},
    }

    config.forEach(({ key, value }) => {
        parsed.raw[key] = value

        // ✅ INCLUDES
        if (key.startsWith("includes_")) {
            const sku = key.replace("includes_", "")
            parsed.includes[sku] = value.split("|") // puedes usar | como separador
        }

        // ✅ EXTRAS
        if (key.startsWith("extra_label_")) {
            const match = key.match(/extra_label_(.+)_\d+/)
            if (!match) return

            const sku = match[1]

            if (!parsed.extras[sku]) {
                parsed.extras[sku] = []
            }

            const [label, price] = value.split("|")

            parsed.extras[sku].push({
                label: label.trim(),
                price: Number(price) || 0
            })
        }

        // ✅ SHIPPING
        if (key.startsWith("shipping_tier_") && key.endsWith("_km")) {
            const tier = key.replace("shipping_tier_", "").replace("_km", "")
            const km = Number(value)

            const priceKey = `shipping_tier_${tier}_price`
            const priceItem = config.find(c => c.key === priceKey)

            if (priceItem) {
                parsed.shipping.push({
                    km,
                    price: Number(priceItem.value),
                })
            }
        }
    })

    return parsed
}