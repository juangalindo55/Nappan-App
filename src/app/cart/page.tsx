"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useCartStore } from "@/store/cart.store"
import { useUserStore } from "@/store/user.store"
import { useConfig } from "@/hooks/useConfig"
import type { CartExtra, CartItem } from "@/domain/cart.domain"
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

function getItemVisual(item: CartItem) {
    if (item.sku.includes('fitbar') || item.type === 'fitbar') {
        return {
            src: '/images/nappan/fitbar.jpg',
            alt: 'Fit Bar con pancakes proteicos y presentación saludable',
        }
    }

    if (item.sku.includes('lunch') || item.type === 'lunchbox') {
        return {
            src: '/images/nappan/lunchbox.jpg',
            alt: 'Lunch Box Nappan con pancakes y toppings para compartir',
        }
    }

    return {
        src: '/images/nappan/gallery-mario-box.jpg',
        alt: 'Nappan Box colorida con pancake art personalizado',
    }
}

export default function CartPage() {
    const router = useRouter()
    const items = useCartStore((state) => state.cart.items)
    const summary = useCartStore((state) => state.cart.summary)
    const removeItem = useCartStore((state) => state.removeItem)
    const updateQuantity = useCartStore((state) => state.updateQuantity)
    const updateItemExtras = useCartStore((state) => state.updateItemExtras)
    const profile = useUserStore((state) => state.profile)
    const { config, loading } = useConfig()
    const [destinationPostalCode, setDestinationPostalCode] = useState('')
    const [quotePrice, setQuotePrice] = useState<number | null>(null)
    const [quoteDistanceKm, setQuoteDistanceKm] = useState<number | null>(null)
    const [quoteError, setQuoteError] = useState('')
    const [quoteLoading, setQuoteLoading] = useState(false)

    const extrasBySku = useMemo(() => config?.extras ?? {}, [config])
    const discountPercent = Math.max(0, profile?.discountPercent ?? 0)
    const hasTier = profile?.tierName != null
    const discountAmount = Math.round(summary.total * (discountPercent / 100))
    const discountedTotal = Math.max(0, summary.total - discountAmount)
    const totalWithShipping = discountedTotal + (quotePrice ?? 0)

    const checkoutCardStyle = {
        borderColor: 'rgba(88, 55, 34, 0.12)',
        background: 'linear-gradient(180deg, rgba(255, 252, 245, 0.96) 0%, rgba(255, 241, 232, 0.94) 100%)',
        borderRadius: '24px',
        boxShadow: '0 18px 45px rgba(61, 44, 42, 0.08)',
    }

    const checkoutHeadingStyle = {
        fontFamily: 'var(--font-cormorant)',
        color: 'var(--text-primary)',
    }

    const checkoutBodyStyle = {
        fontFamily: 'var(--font-dm-sans)',
    }

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
        <main className="desktop-nav-offset min-h-dvh px-4 pb-40 pt-5 md:px-8 md:pb-24 lg:px-10" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'var(--font-dm-sans)' }}>
            <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6">
                <header className="rounded-[24px] border p-5 md:p-6" style={checkoutCardStyle}>
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="flex-1">
                            <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-tertiary)' }}>
                                Pedido actual
                            </p>
                            <h1 className="mt-1 text-[clamp(2.25rem,4vw,3.25rem)] font-semibold leading-none" style={checkoutHeadingStyle}>
                                Tu carrito
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm leading-6 md:text-[18px] md:leading-7" style={{ color: 'var(--text-secondary)', ...checkoutBodyStyle }}>
                                Revisa tus productos, ajusta cantidades y edita tus extras antes de continuar.
                            </p>
                        </div>
                        {profile && (
                            <div className="flex items-start justify-between gap-3 rounded-[20px] border px-4 py-3 md:min-w-[220px] md:flex-col md:items-end" style={{ borderColor: 'rgba(216, 155, 43, 0.16)', background: 'rgba(255, 248, 245, 0.72)' }}>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="h-3 w-3 rounded-full animate-pulse"
                                        style={{
                                            background: hasTier ? 'var(--success)' : 'var(--error)',
                                            boxShadow: `0 0 8px ${hasTier ? '#4ADE80' : '#F87171'}`,
                                        }}
                                    />
                                    <span className="text-xs font-semibold" style={{ color: hasTier ? 'var(--success)' : 'var(--error)' }}>
                                        {hasTier ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                                <p className="text-xs md:text-right" style={{ color: 'var(--text-secondary)' }}>
                                    {profile.name}
                                </p>
                            </div>
                        )}
                    </div>
                </header>

                {isEmpty ? (
                    <section className="rounded-lg border p-5" style={{ borderColor: 'rgba(216, 155, 43, 0.2)', background: 'var(--surface-1)' }}>
                        <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                            Tu carrito está vacío
                        </p>
                        <p className="mt-2 text-sm leading-5" style={{ color: 'var(--text-secondary)' }}>
                            Agrega un producto desde el menú de pedido para empezar.
                        </p>
                        <Link
                            href="/order"
                            className="mt-4 inline-flex rounded-md px-4 py-3 text-sm font-bold transition active:scale-[0.99]"
                            style={{ background: 'var(--gold)', color: 'var(--text-primary)' }}
                        >
                            Ir a pedir
                        </Link>
                    </section>
                ) : (
                    <>
                        {!hasTier ? (
                            <div className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3" style={{ borderColor: 'rgba(216, 155, 43, 0.2)', background: 'var(--surface-1)' }}>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    ¿Tienes descuento de membresía?
                                </p>
                                <Link
                                    href="/profile"
                                    className="shrink-0 rounded-md border px-3 py-1.5 text-xs font-semibold transition active:scale-[0.99]"
                                    style={{ borderColor: 'rgba(216, 155, 43, 0.3)', color: 'var(--gold)' }}
                                >
                                    Ver perfil →
                                </Link>
                            </div>
                        ) : null}

                        <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
                            <section className="space-y-4 lg:col-span-8">
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

                            <section className="overflow-hidden rounded-[24px] border p-5 md:p-6 lg:sticky lg:top-32 lg:col-span-4" style={checkoutCardStyle}>
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-tertiary)' }}>
                                            Checkout
                                        </p>
                                        <h2 className="mt-1 text-2xl font-semibold" style={checkoutHeadingStyle}>
                                            Tu pedido
                                        </h2>
                                    </div>
                                    <span
                                        className="inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold"
                                        style={{ background: 'rgba(248, 220, 217, 0.55)', color: 'var(--text-primary)' }}
                                    >
                                        Listo para confirmar
                                    </span>
                                </div>

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

                                <p className="mt-3 text-sm leading-5" style={{ color: 'var(--text-tertiary)', ...checkoutBodyStyle }}>
                                    El envío se cotiza aparte con los tiers de Supabase.
                                </p>

                                <div className="mt-4 rounded-[20px] border p-4" style={{ borderColor: 'rgba(216, 155, 43, 0.18)', background: 'rgba(255, 248, 245, 0.8)' }}>
                                    <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-tertiary)' }}>
                                        Cotizar envío
                                    </p>
                                    <p className="mt-2 text-sm leading-5" style={{ color: 'var(--text-tertiary)', ...checkoutBodyStyle }}>
                                        El origen es fijo y se toma desde la sucursal configurada en Vercel. Aquí solo capturas el código postal de destino.
                                    </p>
                                    <label className="mt-3 block">
                                        <span className="mb-1 block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                                            Código postal de destino
                                        </span>
                                        <input
                                            value={destinationPostalCode}
                                            onChange={(event) => setDestinationPostalCode(event.target.value)}
                                            inputMode="numeric"
                                            placeholder="64000"
                                            className="h-11 w-full rounded-md border px-4 text-sm outline-none"
                                            style={{ borderColor: 'rgba(216, 155, 43, 0.2)', background: 'var(--surface-1)', color: 'var(--text-primary)', ...checkoutBodyStyle }}
                                            onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(216, 155, 43, 0.6)'}
                                            onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(216, 155, 43, 0.2)'}
                                        />
                                    </label>

                                    <button
                                        type="button"
                                        onClick={handleQuoteShipping}
                                        disabled={quoteLoading}
                                        className="mt-3 w-full rounded-full px-4 py-3 text-sm font-bold transition active:scale-[0.99] disabled:opacity-60"
                                        style={{ background: 'var(--gold)', color: 'var(--text-primary)' }}
                                    >
                                        {quoteLoading ? 'Cotizando...' : 'Calcular envío'}
                                    </button>

                                    {quoteError ? (
                                        <p className="mt-3 rounded-md border border-red-400/25 bg-red-500/10 px-3 py-2 text-sm leading-5 text-red-700" style={checkoutBodyStyle}>
                                            {quoteError}
                                        </p>
                                    ) : null}

                                    {quotePrice !== null ? (
                                        <div className="mt-3 space-y-2 rounded-md border px-3 py-3 text-sm" style={{ borderColor: 'rgba(216, 155, 43, 0.2)', background: 'var(--surface-1)', ...checkoutBodyStyle }}>
                                            <p className="flex items-center justify-between gap-3">
                                                <span style={{ color: 'var(--text-secondary)' }}>Distancia</span>
                                                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                                    {quoteDistanceKm?.toFixed(1)} km
                                                </span>
                                            </p>
                                            <p className="flex items-center justify-between gap-3">
                                                <span style={{ color: 'var(--text-secondary)' }}>Envío</span>
                                                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                                    ${quotePrice.toLocaleString('es-MX')}
                                                </span>
                                            </p>
                                            <p className="flex items-center justify-between gap-3 border-t pt-2" style={{ borderColor: 'rgba(216, 155, 43, 0.2)' }}>
                                                <span style={{ color: 'var(--text-secondary)' }}>Total con envío</span>
                                                <span className="text-base font-bold" style={{ color: 'var(--gold)' }}>
                                                    ${(discountedTotal + quotePrice).toLocaleString('es-MX')}
                                                </span>
                                            </p>
                                        </div>
                                    ) : null}
                                </div>

                                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                                    <Link
                                        href="/order"
                                        className="flex-1 rounded-full border px-4 py-3 text-center text-sm font-semibold transition active:scale-[0.99]"
                                        style={{ borderColor: 'rgba(216, 155, 43, 0.2)', color: 'var(--text-primary)', background: 'var(--surface-1)', ...checkoutBodyStyle }}
                                    >
                                        Seguir comprando
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => router.push('/checkout')}
                                        className="flex-1 rounded-full px-4 py-3 text-sm font-bold transition active:scale-[0.99] disabled:opacity-60"
                                        style={{ background: 'var(--gold)', color: 'var(--text-primary)' }}
                                        disabled={loading || items.length === 0}
                                    >
                                        {loading ? 'Cargando...' : `Continuar${quotePrice !== null ? ` · $${totalWithShipping.toLocaleString('es-MX')}` : ''}`}
                                    </button>
                                </div>
                            </section>
                        </div>
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
    const visual = getItemVisual(item)

    const itemHeadingStyle = {
        fontFamily: 'var(--font-cormorant)',
        color: 'var(--text-primary)',
    }
    const itemBodyStyle = {
        fontFamily: 'var(--font-dm-sans)',
    }

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
        <article className="overflow-hidden rounded-[24px] border p-5 md:p-6" style={{ borderColor: 'rgba(216, 155, 43, 0.2)', background: 'var(--surface-1)', boxShadow: '0 10px 30px -5px rgba(61, 44, 42, 0.08)' }}>
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:gap-6">
                <div className="relative h-44 w-full overflow-hidden rounded-[20px] bg-[rgba(255,248,245,0.8)] shadow-sm md:h-48 md:w-48 md:shrink-0">
                    <Image
                        src={visual.src}
                        alt={visual.alt}
                        fill
                        className="object-cover transition-transform duration-700"
                        sizes="(max-width: 768px) 100vw, 192px"
                    />
                </div>

                <div className="min-w-0 flex-1 space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                            <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-tertiary)' }}>
                                {item.sku}
                            </p>
                            <h2 className="mt-1 text-[22px] font-semibold leading-tight md:text-[32px]" style={itemHeadingStyle}>
                                {item.name}
                            </h2>
                            <p className="mt-2 text-sm leading-6 md:text-[18px] md:leading-7" style={{ color: 'var(--text-secondary)', ...itemBodyStyle }}>
                                Base: ${item.base_price.toLocaleString('es-MX')} · Cantidad: {item.quantity}
                            </p>
                            {item.type === 'artistic' && (item.config as { ideaText?: string; designLink?: string }).ideaText && (
                                <p className="mt-1 truncate text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                    Diseño: {((item.config as { ideaText?: string }).ideaText || '').substring(0, 40)}…
                                </p>
                            )}
                            {item.type === 'artistic' && (item.config as { ideaText?: string; designLink?: string }).designLink && (
                                <p className="mt-1 truncate text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                    Ref: {((item.config as { designLink?: string }).designLink || '').substring(0, 40)}…
                                </p>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={onRemove}
                            className="inline-flex items-center justify-center rounded-full border px-3 py-2 text-sm font-semibold transition active:scale-[0.99]"
                            style={{ borderColor: 'rgba(244, 63, 94, 0.3)', background: 'rgba(244, 63, 94, 0.08)', color: 'rgb(220, 38, 38)' }}
                        >
                            Eliminar
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {item.includes.slice(0, 2).map((label) => (
                            <span key={label} className="rounded-full border px-3 py-1 text-[11px] font-semibold" style={{ borderColor: 'rgba(88, 55, 34, 0.16)', background: 'rgba(255, 252, 245, 0.92)', color: 'var(--text-primary)' }}>
                                {label}
                            </span>
                        ))}
                    </div>

                    {item.sku === 'fitbar-selection' ? (
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm" style={{ color: 'var(--text-secondary)', ...itemBodyStyle }}>
                                Selección de barra bienestar · cantidad fija
                            </p>
                            <p className="text-[22px] font-bold md:text-[28px]" style={{ color: 'var(--soft-terracotta, #C85A41)' }}>
                                ${itemTotal.toLocaleString('es-MX')}
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                            <div className="flex items-center rounded-full border p-1" style={{ borderColor: 'rgba(88, 55, 34, 0.18)', background: 'rgba(255, 252, 245, 0.94)' }}>
                                <button
                                    type="button"
                                    onClick={() => onQuantityChange(Math.max(1, item.quantity - 1))}
                                    className="flex h-10 w-10 items-center justify-center rounded-full text-2xl font-semibold transition active:scale-[0.98]"
                                    style={{ background: 'rgba(255, 241, 232, 0.92)', color: 'var(--text-primary)' }}
                                    aria-label="Disminuir cantidad"
                                >
                                    -
                                </button>

                                <input
                                    type="number"
                                    min={1}
                                    value={item.quantity}
                                    onChange={(event) => onQuantityChange(Math.max(1, Number(event.target.value) || 1))}
                                    className="w-14 border-none bg-transparent text-center text-base font-bold outline-none"
                                    style={{ color: 'var(--text-primary)', ...itemBodyStyle }}
                                    aria-label="Cantidad del producto"
                                />

                                <button
                                    type="button"
                                    onClick={() => onQuantityChange(item.quantity + 1)}
                                    className="flex h-10 w-10 items-center justify-center rounded-full text-2xl font-semibold transition active:scale-[0.98]"
                                    style={{ background: 'rgba(255, 241, 232, 0.92)', color: 'var(--text-primary)' }}
                                    aria-label="Aumentar cantidad"
                                >
                                    +
                                </button>
                            </div>

                            <p className="sm:ml-auto text-[22px] font-bold md:text-[28px]" style={{ color: 'var(--soft-terracotta, #C85A41)' }}>
                                ${itemTotal.toLocaleString('es-MX')}
                            </p>
                        </div>
                    )}

                    <div>
                        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-tertiary)' }}>
                            Extras
                        </p>

                        {availableExtras.length > 0 ? (
                            <ExtrasChips
                                extras={availableExtras}
                                selectedExtras={selectedExtras}
                                onToggleExtra={toggleExtra}
                            />
                        ) : (
                                    <p className="text-sm leading-5" style={{ color: 'var(--text-tertiary)', ...itemBodyStyle }}>
                                No hay extras configurados para este producto.
                            </p>
                        )}
                    </div>

                    {item.extras.length > 0 ? (
                        <ul className="space-y-1 text-sm" style={{ color: 'var(--text-secondary)', ...itemBodyStyle }}>
                            {item.extras.map((extra) => (
                                <li key={getExtraKey(item.sku, extra)} className="flex items-center justify-between gap-3">
                                    <span>{extra.label}</span>
                                    <span>+${extra.price.toLocaleString('es-MX')}</span>
                                </li>
                            ))}
                        </ul>
                    ) : null}
                </div>
            </div>
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
                        className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200 ease-out active:scale-[0.98]"
                        style={{
                            borderColor: isSelected ? 'var(--text-primary)' : 'rgba(88, 55, 34, 0.2)',
                            background: isSelected ? 'var(--text-primary)' : 'var(--surface-1)',
                            color: isSelected ? 'white' : 'var(--text-primary)',
                            transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                            ...(isSelected ? { boxShadow: '0 8px 16px rgba(42, 23, 16, 0.15)' } : {})
                        }}
                    >
                        <span>{extra.label}</span>
                        <span style={{ opacity: isSelected ? 0.8 : 0.6 }}>
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
            <dt style={{ color: 'var(--text-tertiary)' }}>{label}</dt>
            <dd
                className={`font-semibold ${
                    highlight ? "text-lg" : ""
                }`}
                style={{ color: highlight ? 'var(--gold)' : 'var(--text-primary)' }}
            >
                ${value.toLocaleString("es-MX")}
            </dd>
        </div>
    )
}
