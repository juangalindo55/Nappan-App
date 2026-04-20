export type ShippingTier = {
    km: number
    price: number
}

export function quoteShippingByDistanceKm(distanceKm: number, tiers: ShippingTier[]) {
    const normalizedDistance = Math.max(0, Number(distanceKm) || 0)

    const sortedTiers = [...tiers].sort((a, b) => a.km - b.km)
    const matchedTier = sortedTiers.find((tier) => normalizedDistance <= tier.km)

    if (matchedTier) {
        return {
            km: normalizedDistance,
            price: matchedTier.price,
            tierKm: matchedTier.km,
        }
    }

    const lastTier = sortedTiers[sortedTiers.length - 1]

    return {
        km: normalizedDistance,
        price: lastTier?.price ?? 0,
        tierKm: lastTier?.km ?? 0,
    }
}
