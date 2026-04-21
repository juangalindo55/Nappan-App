"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useCartStore } from "@/store/cart.store"
import { useConfig } from "@/hooks/useConfig"
import type { CartExtra, CartItem } from "@/domain/cart.domain"
import { loadCustomerProfileSession } from "@/lib/customer-profile-session"
import BottomNav from "@/components/BottomNav"

type ConfigExtra = {
    id?: string
    label: string
    price: number
}

type CartItemConfigWithExtras = {
    availableExtras?: ConfigExtra[]
}

function getExtraKey(sku: string, extra: { id?: string; label: string; price: number }) {
    return extra.id ?? `${sku}-${extra.label}-${extra.price}`
}

function normalizeExtra(sku: string, extra: ConfigExtra): CartExtra {
    return {
        id: getExtraKey(sku, extra),
        label: extra.label,
        price: Number(extra.price) || 0,
    }
}

function buildAvailableExtras(item: CartItem, rawExtras: ConfigExtra[]) {
    const configuredExtras =
        (item.config as CartItemConfigWithExtras | undefined)?.availableExtras ?? []
    const existingIdsBySignature = new Map(
        item.extras.map((extra) => [`${extra.label}-${extra.price}`, extra.id]),
    )
    const extrasBySignature = new Map<string, ConfigExtra>()

    ;[...configuredExtras, ...rawExtras, ...item.extras].forEach((extra) => {
        const signature = `${extra.label}-${extra.price}`
        if (!extrasBySignature.has(signature)) {
            extrasBySignature.set(signature, extra)
        }
    })

    return Array.from(extrasBySignature.values()).map((extra) => {
        const signature = `${extra.label}-${extra.price}`

        return {
            id: extra.id ?? existingIdsBySignature.get(signature) ?? `${item.sku}-${signature}`,
            label: extra.label,
            price: Number(extra.price) || 0,
        }
    })
}

export default function CartPage() {
    const router = useRouter()
    const items = useCartStore((state) => state.cart.items)
    const summary = useCartStore((state) => state.cart.summary)
    const removeItem = useCartStore((state) => state.removeItem)
    const updateQuantity = useCartStore((state) => state.updateQuantity)
    const updateItemExtras = useCartStore((state) => state.updateItemExtras)
    const { config, loading } = useConfig()
    const [destinationPostalCode, setDestinationPostalCode] = useState('')
    const [quotePrice, setQuotePrice] = useState<number | null>(null)
    const [quoteDistanceKm, setQuoteDistanceKm] = useState<number | null>(null)
    const [quoteError, setQuoteError] = useState('')
    const [quoteLoading, setQuoteLoading] = useState(false)
    const [discountPercent] = useState<number>(() => {
        const stored = loadCustomerProfileSession()
        const pct = stored?.discountPercent ?? 0
        return pct > 0 ? pct : 0
    })
    const [hasTier] = useState<boolean>(() => {
        const stored = loadCustomerProfileSession()
        return stored?.tierName != null
    })

    const extrasBySku = useMemo(() => config?.extras ?? {}, [config])
    const discountAmount = Math.round(summary.total * (discountPercent / 100))
    const discountedTotal = Math.max(0, summary.total - discountAmount)
    const totalWithShipping = discountedTotal + (quotePrice ?? 0)

    const isEmpty = items.length === 0

    async function handleQuoteShipping() {
        setQuoteLoading(true)
        setQuoteError('')

        try {
            const response = await fetch('/api/shipping/quote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    destinationPostalCode,
                }),
            })

            const payload = (await response.json()) as {
                error?: string
                price?: number
                distanceKm?: number
            }

            if (!response.ok) {
                throw new Error(payload.error || 'No se pudo cotizar el envío.')
            }

            setQuotePrice(payload.price ?? null)
            setQuoteDistanceKm(payload.distanceKm ?? null)
        } catch (error) {
            setQuotePrice(null)
            setQuoteDistanceKm(null)
            setQuoteError(error instanceof Error ? error.message : 'No se pudo cotizar el envío.')
        } finally {
            setQuoteLoading(false)
        }
    }

    return (
        <>
        <main className="min-h-dvh bg-[#0C0806] px-4 pb-32 pt-5 text-[#F0E4CC]">
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
                <header className="rounded-lg border border-[#E8A420]/10 bg-[#181209] p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7A6A55]">
                        Pedido actual
                    </p>
                    <h1 className="mt-1 text-3xl font-semibold text-[#FFF6E5]">
                        Tu carrito
                    </h1>
                    <p className="mt-2 text-sm leading-5 text-[#F0E4CC]/60">
                        Revisa tus productos, ajusta cantidades y edita tus extras antes de continuar.
                    </p>
                </header>

                {isEmpty ? (
                    <section className="rounded-lg border border-[#E8A420]/10 bg-[#181209] p-5">
                        <p className="text-lg font-semibold text-[#FFF6E5]">
                            Tu carrito está vacío
                        </p>
                        <p className="mt-2 text-sm leading-5 text-[#F0E4CC]/60">
                            Agrega un producto desde el menú de pedido para empezar.
                        </p>
                        <Link
                            href="/order"
                            className="mt-4 inline-flex rounded-md bg-[#E8A420] px-4 py-3 text-sm font-bold text-[#0C0806] transition active:scale-[0.99]"
                        >
                            Ir a pedir
                        </Link>
                    </section>
                ) : (
                    <>
                        {!hasTier ? (
                            <div className="flex items-center justify-between gap-3 rounded-lg border border-[#E8A420]/10 bg-[#181209] px-4 py-3">
                                <p className="text-sm text-[#F0E4CC]/70">
                                    ¿Tienes descuento de membresía?
                                </p>
                                <Link
                                    href="/profile"
                                    className="shrink-0 rounded-md border border-[#E8A420]/25 px-3 py-1.5 text-xs font-semibold text-[#E8A420] transition active:scale-[0.99]"
                                >
                                    Ver perfil →
                                </Link>
                            </div>
                        ) : null}

                        <section className="space-y-3">
                            {items.map((item) => {
                                const availableExtras = buildAvailableExtras(
                                    item,
                                    (extrasBySku[item.sku] ?? []) as ConfigExtra[],
                                )

                                return (
                                    <CartItemEditable
                                        key={item.id}
                                        item={item}
                                        availableExtras={availableExtras}
                                        onRemove={() => removeItem(item.id)}
                                        onQuantityChange={(nextQuantity) =>
                                            updateQuantity(item.id, nextQuantity)
                                        }
                                        onExtrasChange={(newExtras) =>
                                            updateItemExtras(item.id, newExtras)
                                        }
                                    />
                                )
                            })}
                        </section>

                        <section className="rounded-lg border border-[#E8A420]/10 bg-[#181209] p-4">
                            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7A6A55]">
                                Resumen
                            </p>

                            <dl className="mt-3 space-y-2 text-sm">
                                <SummaryRow label="Subtotal" value={summary.subtotal} />
                                <SummaryRow label="Extras" value={summary.extras_total} />
                                {discountPercent > 0 ? (
                                    <SummaryRow
                                        label={`Descuento (${discountPercent}%)`}
                                        value={-discountAmount}
                                    />
                                ) : null}
                                <SummaryRow
                                    label={discountPercent > 0 ? "Total con descuento" : "Total"}
                                    value={discountedTotal}
                                    highlight
                                />
                            </dl>

                            <p className="mt-3 text-sm leading-5 text-[#F0E4CC]/58">
                                El envío se cotiza aparte con los tiers de Supabase.
                            </p>

                            <div className="mt-4 rounded-lg border border-[#E8A420]/10 bg-[#100B07] p-4">
                                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7A6A55]">
                                    Cotizar envío
                                </p>
                                <p className="mt-2 text-sm leading-5 text-[#F0E4CC]/58">
                                    El origen es fijo y se toma desde la sucursal configurada en Vercel. Aquí solo capturas el código postal de destino.
                                </p>
                                <label className="mt-3 block">
                                    <span className="mb-1 block text-xs font-semibold text-[#F0E4CC]/60">
                                        Código postal de destino
                                    </span>
                                    <input
                                        value={destinationPostalCode}
                                        onChange={(event) => setDestinationPostalCode(event.target.value)}
                                        inputMode="numeric"
                                        placeholder="64000"
                                        className="h-11 w-full rounded-md border border-[#E8A420]/14 bg-[#181209] px-4 text-sm text-[#FFF6E5] outline-none focus:border-[#E8A420]/60"
                                    />
                                </label>

                                <button
                                    type="button"
                                    onClick={handleQuoteShipping}
                                    disabled={quoteLoading}
                                    className="mt-3 w-full rounded-md bg-[#E8A420] px-4 py-3 text-sm font-bold text-[#0C0806] transition active:scale-[0.99] disabled:opacity-60"
                                >
                                    {quoteLoading ? 'Cotizando...' : 'Calcular envío'}
                                </button>

                                {quoteError ? (
                                    <p className="mt-3 rounded-md border border-red-400/25 bg-red-500/10 px-3 py-2 text-sm leading-5 text-red-100">
                                        {quoteError}
                                    </p>
                                ) : null}

                                {quotePrice !== null ? (
                                    <div className="mt-3 space-y-2 rounded-md border border-[#E8A420]/14 bg-[#181209] px-3 py-3 text-sm">
                                        <p className="flex items-center justify-between gap-3">
                                            <span className="text-[#F0E4CC]/60">Distancia</span>
                                            <span className="font-semibold text-[#FFF6E5]">
                                                {quoteDistanceKm?.toFixed(1)} km
                                            </span>
                                        </p>
                                        <p className="flex items-center justify-between gap-3">
                                            <span className="text-[#F0E4CC]/60">Envío</span>
                                            <span className="font-semibold text-[#FFF6E5]">
                                                ${quotePrice.toLocaleString('es-MX')}
                                            </span>
                                        </p>
                                        <p className="flex items-center justify-between gap-3 border-t border-[#E8A420]/10 pt-2">
                                            <span className="text-[#F0E4CC]/60">Total con envío</span>
                                            <span className="text-base font-bold text-[#E8A420]">
                                                ${(discountedTotal + quotePrice).toLocaleString('es-MX')}
                                            </span>
                                        </p>
                                    </div>
                                ) : null}
                            </div>

                            <div className="mt-4 flex gap-3">
                                <Link
                                    href="/order"
                                    className="flex-1 rounded-md border border-[#E8A420]/14 bg-[#100B07] px-4 py-3 text-center text-sm font-semibold text-[#FFF6E5] transition active:scale-[0.99]"
                                >
                                    Seguir comprando
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => router.push('/checkout')}
                                    className="flex-1 rounded-md bg-[#E8A420] px-4 py-3 text-sm font-bold text-[#0C0806] transition active:scale-[0.99] disabled:opacity-60"
                                    disabled={loading || items.length === 0}
                                >
                                    {loading ? "Cargando..." : `Continuar${quotePrice !== null ? ` · $${totalWithShipping.toLocaleString('es-MX')}` : ''}`}
                                </button>
                            </div>
                        </section>
                    </>
                )}
            </div>
        </main>
        <BottomNav />
        </>
    )
}

function CartItemEditable({
    item,
    availableExtras,
    onRemove,
    onQuantityChange,
    onExtrasChange,
}: {
    item: CartItem
    availableExtras: Array<{ id: string; label: string; price: number }>
    onRemove: () => void
    onQuantityChange: (quantity: number) => void
    onExtrasChange: (extras: CartExtra[]) => void
}) {
    const selectedExtras = item.extras.map((extra) => getExtraKey(item.sku, extra))

    const extrasTotal = item.extras.reduce((sum, extra) => sum + extra.price, 0)
    const itemTotal = (item.base_price + extrasTotal) * item.quantity

    function toggleExtra(extraId: string) {
        const isSelected = selectedExtras.includes(extraId)

        if (isSelected) {
            onExtrasChange(
                item.extras.filter((extra) => getExtraKey(item.sku, extra) !== extraId),
            )
            return
        }

        const extra = availableExtras.find((current) => current.id === extraId)
        if (!extra) return

        onExtrasChange([...item.extras, normalizeExtra(item.sku, extra)])
    }

    return (
        <article className="rounded-lg border border-[#E8A420]/10 bg-[#181209] p-4">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7A6A55]">
                        {item.sku}
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-[#FFF6E5]">
                        {item.name}
                    </h2>
                    <p className="mt-2 text-sm leading-5 text-[#F0E4CC]/60">
                        Base: ${item.base_price.toLocaleString("es-MX")} · Cantidad: {item.quantity}
                    </p>
                    {item.type === 'artistic' && (item.config as { ideaText?: string; designLink?: string }).ideaText && (
                        <p className="mt-1 truncate text-xs text-[#F0E4CC]/50">
                            Diseño: {((item.config as { ideaText?: string }).ideaText || '').substring(0, 40)}…
                        </p>
                    )}
                    {item.type === 'artistic' && (item.config as { ideaText?: string; designLink?: string }).designLink && (
                        <p className="mt-1 truncate text-xs text-[#F0E4CC]/50">
                            Ref: {((item.config as { designLink?: string }).designLink || '').substring(0, 40)}…
                        </p>
                    )}
                </div>

                <button
                    type="button"
                    onClick={onRemove}
                    className="rounded-md border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-100 transition active:scale-[0.99]"
                >
                    Eliminar
                </button>
            </div>

            {item.sku === 'fitbar-selection' ? (
                <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-sm text-[#F0E4CC]/60">
                        Selección de barra bienestar · cantidad fija
                    </p>
                    <p className="text-lg font-bold text-[#E8A420]">
                        ${itemTotal.toLocaleString("es-MX")}
                    </p>
                </div>
            ) : (
                <div className="mt-4 flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => onQuantityChange(Math.max(1, item.quantity - 1))}
                        className="flex h-11 w-11 items-center justify-center rounded-md border border-[#E8A420]/14 bg-[#100B07] text-2xl font-semibold text-[#FFF6E5] active:scale-[0.98]"
                        aria-label="Disminuir cantidad"
                    >
                        -
                    </button>

                    <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(event) => onQuantityChange(Math.max(1, Number(event.target.value) || 1))}
                        className="h-11 min-w-0 flex-1 rounded-md border border-[#E8A420]/14 bg-[#100B07] px-4 text-center text-base font-bold text-[#FFF6E5] outline-none focus:border-[#E8A420]/60"
                        aria-label="Cantidad del producto"
                    />

                    <button
                        type="button"
                        onClick={() => onQuantityChange(item.quantity + 1)}
                        className="flex h-11 w-11 items-center justify-center rounded-md border border-[#E8A420]/14 bg-[#100B07] text-2xl font-semibold text-[#FFF6E5] active:scale-[0.98]"
                        aria-label="Aumentar cantidad"
                    >
                        +
                    </button>

                    <p className="ml-auto text-lg font-bold text-[#E8A420]">
                        ${itemTotal.toLocaleString("es-MX")}
                    </p>
                </div>
            )}

            <div className="mt-4">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#7A6A55]">
                    Extras
                </p>

                {availableExtras.length > 0 ? (
                    <ExtrasChips
                        extras={availableExtras}
                        selectedExtras={selectedExtras}
                        onToggleExtra={toggleExtra}
                    />
                ) : (
                    <p className="text-sm leading-5 text-[#F0E4CC]/54">
                        No hay extras configurados para este producto.
                    </p>
                )}
            </div>

            {item.extras.length > 0 ? (
                <ul className="mt-4 space-y-1 text-sm text-[#F0E4CC]/68">
                    {item.extras.map((extra) => (
                        <li key={getExtraKey(item.sku, extra)} className="flex items-center justify-between gap-3">
                            <span>{extra.label}</span>
                            <span>+${extra.price.toLocaleString("es-MX")}</span>
                        </li>
                    ))}
                </ul>
            ) : null}
        </article>
    )
}

function ExtrasChips({
    extras,
    selectedExtras,
    onToggleExtra,
}: {
    extras: Array<{ id: string; label: string; price: number }>
    selectedExtras: string[]
    onToggleExtra: (extraId: string) => void
}) {
    return (
        <div className="flex flex-wrap gap-2">
            {extras.map((extra) => {
                const isSelected = selectedExtras.includes(extra.id)

                return (
                    <button
                        key={extra.id}
                        type="button"
                        onClick={() => onToggleExtra(extra.id)}
                        aria-pressed={isSelected}
                        className={[
                            "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold",
                            "transition-all duration-200 ease-out",
                            "active:scale-[0.98]",
                            isSelected
                                ? "scale-[1.02] border-black bg-black text-white shadow-md"
                                : "border-gray-300 bg-white text-gray-700 hover:border-black hover:bg-[#FFF9F0]",
                        ].join(" ")}
                    >
                        <span>{extra.label}</span>
                        <span className={isSelected ? "text-white/80" : "text-gray-500"}>
                            +${extra.price}
                        </span>
                    </button>
                )
            })}
        </div>
    )
}

function SummaryRow({
    label,
    value,
    highlight = false,
}: {
    label: string
    value: number
    highlight?: boolean
}) {
    return (
        <div className="flex items-center justify-between gap-4">
            <dt className="text-[#F0E4CC]/52">{label}</dt>
            <dd
                className={`font-semibold ${
                    highlight ? "text-[#E8A420] text-lg" : "text-[#FFF6E5]"
                }`}
            >
                ${value.toLocaleString("es-MX")}
            </dd>
        </div>
    )
}
