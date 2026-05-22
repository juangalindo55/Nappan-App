'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useCartStore } from '@/store/cart.store'
import type { CartExtra } from '@/domain/cart.domain'

type ArtisticVariant = 'nappan-box' | 'premium-box'
type ArtisticExtra = 'pancake-extra' | 'mensaje'

type ArtisticDraft = {
  variant: ArtisticVariant
  ideaText: string
  designLink: string
  extras: ArtisticExtra[]
  quantity: number
}

const MIN_QUANTITY = 1

const variants: Record<ArtisticVariant, { label: string; price: number; note: string }> = {
  'nappan-box': {
    label: 'Caja Nappan',
    price: 450,
    note: 'El cliente comparte una idea en texto y nosotros la convertimos en diseño.',
  },
  'premium-box': {
    label: 'Caja premium',
    price: 850,
    note: 'El cliente comparte un enlace de referencia o diseño para personalización.',
  },
}

const extras: Record<ArtisticExtra, { label: string; price: number }> = {
  'pancake-extra': {
    label: 'Pancake pequeño artístico extra',
    price: 200,
  },
  mensaje: {
    label: 'Mensaje personalizado',
    price: 30,
  },
}

const initialDraft: ArtisticDraft = {
  variant: 'nappan-box',
  ideaText: '',
  designLink: '',
  extras: [],
  quantity: 1,
}

const availableExtras = (Object.keys(extras) as ArtisticExtra[]).map((extra) => ({
  id: extra,
  label: extras[extra].label,
  price: extras[extra].price,
}))

function getValidationError(draft: ArtisticDraft) {
  if (draft.quantity < MIN_QUANTITY) {
    return 'La cantidad mínima es 1 caja.'
  }

  if (draft.variant === 'nappan-box' && !draft.ideaText.trim()) {
    return 'Escribe la idea del diseño para continuar.'
  }

  if (draft.variant === 'premium-box' && !draft.designLink.trim()) {
    return 'Agrega el enlace de diseño o referencia para continuar.'
  }

  return null
}

export default function ArtisticBoxConfiguratorScreen() {
  const [draft, setDraft] = useState<ArtisticDraft>(initialDraft)
  const [error, setError] = useState('')
  const [addedMessage, setAddedMessage] = useState('')
  const addItem = useCartStore((state) => state.addItem)

  const extrasTotal = useMemo(
    () => draft.extras.reduce((total, extra) => total + extras[extra].price, 0),
    [draft.extras],
  )
  const unitPrice = variants[draft.variant].price + extrasTotal
  const orderTotal = unitPrice * draft.quantity

  function clearFeedback() {
    setError('')
    setAddedMessage('')
  }

  function updateVariant(variant: ArtisticVariant) {
    setDraft((current) => ({
      ...current,
      variant,
      ideaText: variant === 'nappan-box' ? current.ideaText : '',
      designLink: variant === 'premium-box' ? current.designLink : '',
    }))
    clearFeedback()
  }

  function toggleExtra(extra: ArtisticExtra) {
    setDraft((current) => ({
      ...current,
      extras: current.extras.includes(extra)
        ? current.extras.filter((item) => item !== extra)
        : [...current.extras, extra],
    }))
    clearFeedback()
  }

  function updateQuantity(nextQuantity: number) {
    setDraft((current) => ({
      ...current,
      quantity: Number.isFinite(nextQuantity) && nextQuantity >= MIN_QUANTITY ? nextQuantity : MIN_QUANTITY,
    }))
    clearFeedback()
  }

  function addToCart() {
    const validationError = getValidationError(draft)

    if (validationError) {
      setError(validationError)
      setAddedMessage('')
      return
    }

    setError('')
    addItem({
      type: 'artistic',
      sku: draft.variant,
      name: variants[draft.variant].label,
      quantity: draft.quantity,
      base_price: variants[draft.variant].price,
      config: {
        variant: draft.variant,
        ideaText: draft.ideaText,
        designLink: draft.designLink,
        availableExtras,
      },
      includes: [],
      extras: draft.extras.map((extra) => ({
        id: extra,
        label: extras[extra].label,
        price: extras[extra].price,
      })) as CartExtra[],
    })
    setAddedMessage(`${draft.quantity} ${variants[draft.variant].label} agregada al carrito.`)
    setDraft(initialDraft)
  }

  return (
    <main
      className="hide-scrollbar min-h-dvh overflow-y-auto pb-8"
      style={{
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        paddingBottom: 'calc(96px + env(safe-area-inset-bottom, 0px))'
      }}
    >
      <header className="px-4 pt-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex-1" />
          <Link
            href="/order"
            className="inline-flex shrink-0 items-center justify-center rounded-lg border px-3 py-2 text-sm font-semibold transition active:scale-[0.98]"
            style={{ background: 'var(--surface-1)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            title="Regresar a categorías"
          >
            ← Volver
          </Link>
        </div>
        <section className="overflow-hidden rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}>
          <div className="relative min-h-[152px] bg-[radial-gradient(circle_at_20%_18%,#D89B2B_0%,#7A2440_38%,#FFF8EA_78%)] p-4">
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t" style={{ color: 'var(--bg-primary)' }} />
            <div className="relative flex min-h-[120px] flex-col justify-between">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: 'var(--text-primary)' }}>
                Caja artística
              </p>
              <div>
                <h1 className="text-4xl font-semibold leading-none">
                  Caja artística
                </h1>
                <p className="mt-2 max-w-[300px] text-sm leading-5" style={{ color: 'var(--text-secondary)' }}>
                  Configura una caja personalizada con una idea escrita o con un enlace de diseño.
                </p>
              </div>
            </div>
          </div>
        </section>
      </header>

      <section className="sticky top-0 z-20 mt-4 border-y px-4 py-3 backdrop-blur-xl" style={{ borderColor: 'var(--border)', background: 'rgba(255, 248, 234, 0.95)' }}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-secondary)' }}>
              Resumen
            </p>
            <p className="mt-1 text-sm font-semibold">
              {draft.quantity} cajas · ${unitPrice} c/u
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-secondary)' }}>
              Total
            </p>
            <p className="mt-1 text-2xl font-bold" style={{ color: 'var(--gold)' }}>
              ${orderTotal.toLocaleString('es-MX')}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={addToCart}
          style={{ background: 'var(--gold)', color: 'var(--bg-primary)' }}
          className="mt-3 w-full rounded-md px-4 py-3 text-sm font-bold transition active:scale-[0.99]"
        >
          Agregar al carrito
        </button>

        {error ? (
          <p className="mt-3 rounded-md border border-red-400/25 bg-red-500/10 px-3 py-2 text-sm leading-5 text-red-700">
            {error}
          </p>
        ) : null}

        {addedMessage ? (
          <div className="mt-3 space-y-2">
            <p className="rounded-md border px-3 py-2 text-sm leading-5" style={{ borderColor: 'var(--gold-light)', background: 'var(--gold-dim)', color: 'var(--gold)' }}>
              {addedMessage}
            </p>
            <Link
              href="/cart"
              className="inline-flex w-full items-center justify-center rounded-md border px-4 py-3 text-sm font-semibold transition active:scale-[0.99]"
              style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              Ir al carrito
            </Link>
          </div>
        ) : null}
      </section>

      <section className="space-y-3 px-4 pt-4">
        <ConfigSection eyebrow="1" title="Tipo de caja">
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(variants) as ArtisticVariant[]).map((variant) => (
              <button
                key={variant}
                type="button"
                onClick={() => updateVariant(variant)}
                className="min-h-[124px] rounded-lg border p-3 text-left transition active:scale-[0.99]"
                style={{
                  borderColor: draft.variant === variant ? 'var(--gold)' : 'var(--border)',
                  background: draft.variant === variant ? 'var(--gold-dim)' : 'var(--surface-2)',
                }}
              >
                <span className="block text-lg font-semibold leading-5">
                  {variants[variant].label}
                </span>
                <span className="mt-2 block text-sm font-bold" style={{ color: 'var(--gold)' }}>
                  ${variants[variant].price} MXN
                </span>
                <span className="mt-2 block text-xs leading-4" style={{ color: 'var(--text-secondary)' }}>
                  {variants[variant].note}
                </span>
              </button>
            ))}
          </div>
        </ConfigSection>

        <ConfigSection eyebrow="2" title="Idea del diseño">
          {draft.variant === 'nappan-box' ? (
            <>
              <label className="block text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-secondary)' }}>
                Idea requerida
              </label>
              <textarea
                rows={5}
                value={draft.ideaText}
                onChange={(event) => {
                  setDraft((current) => ({ ...current, ideaText: event.target.value }))
                  clearFeedback()
                }}
                placeholder="Ej: oso astronauta con colores pastel y nombre de la cumpleañera."
                style={{
                  background: 'var(--surface-2)',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--gold-light)',
                }}
                className="mt-2 w-full rounded-md border px-4 py-3 text-sm leading-6 outline-none transition placeholder:opacity-50 focus:border-[var(--gold)]"
              />
              <p className="mt-2 text-sm leading-5" style={{ color: 'var(--text-secondary)' }}>
                Cuéntanos la idea en texto. Nosotros la convertimos en diseño.
              </p>
            </>
          ) : (
            <>
              <label className="block text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-secondary)' }}>
                Enlace requerido
              </label>
              <input
                type="url"
                value={draft.designLink}
                onChange={(event) => {
                  setDraft((current) => ({ ...current, designLink: event.target.value }))
                  clearFeedback()
                }}
                placeholder="https://..."
                style={{
                  background: 'var(--surface-2)',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--gold-light)',
                }}
                className="mt-2 w-full rounded-md border px-4 py-3 text-sm outline-none transition placeholder:opacity-50 focus:border-[var(--gold)]"
              />
              <p className="mt-2 text-sm leading-5" style={{ color: 'var(--text-secondary)' }}>
                Comparte un enlace de referencia o un diseño base para personalizar.
              </p>
            </>
          )}
        </ConfigSection>

        <ConfigSection eyebrow="3" title="Extras">
          <div className="space-y-2">
            {(Object.keys(extras) as ArtisticExtra[]).map((extra) => {
              const isSelected = draft.extras.includes(extra)

              return (
                <button
                  key={extra}
                  type="button"
                  onClick={() => toggleExtra(extra)}
                  className="flex min-h-[64px] w-full items-center justify-between gap-3 rounded-lg border px-3 py-3 text-left transition active:scale-[0.99]"
                  style={{
                    borderColor: isSelected ? 'var(--gold)' : 'var(--border)',
                    background: isSelected ? 'var(--gold-dim)' : 'var(--surface-2)',
                  }}
                >
                  <span>
                    <span className="block text-sm font-semibold leading-5">
                      {extras[extra].label}
                    </span>
                    <span className="mt-1 block text-xs" style={{ color: 'var(--text-secondary)' }}>
                      +${extras[extra].price} MXN por caja
                    </span>
                  </span>
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded border"
                    style={{
                      borderColor: isSelected ? 'var(--gold)' : 'var(--text-secondary)',
                      background: isSelected ? 'var(--gold)' : 'transparent',
                    }}
                  >
                    {isSelected ? (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--bg-primary)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    ) : null}
                  </span>
                </button>
              )
            })}
          </div>
        </ConfigSection>

        <ConfigSection eyebrow="4" title="Cantidad">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => updateQuantity(Math.max(MIN_QUANTITY, draft.quantity - 1))}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border text-2xl font-semibold active:scale-[0.98]"
              style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              aria-label="Restar una caja"
            >
              -
            </button>
            <input
              type="number"
              min={MIN_QUANTITY}
              value={draft.quantity}
              onChange={(event) => updateQuantity(Number(event.target.value))}
              className="h-12 min-w-0 flex-1 rounded-md border px-4 text-center text-lg font-bold outline-none"
              style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              aria-label="Cantidad de cajas"
            />
            <button
              type="button"
              onClick={() => updateQuantity(draft.quantity + 1)}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border text-2xl font-semibold active:scale-[0.98]"
              style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              aria-label="Agregar una caja"
            >
              +
            </button>
          </div>
          <p className="mt-2 text-sm leading-5" style={{ color: 'var(--text-secondary)' }}>
            La cantidad mínima es {MIN_QUANTITY}. Los extras se calculan por unidad.
          </p>
        </ConfigSection>

        <section className="rounded-lg border p-4" style={{ background: 'var(--surface-1)', borderColor: 'var(--border)' }}>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-secondary)' }}>
            Detalle final
          </p>
          <dl className="mt-3 space-y-2 text-sm">
            <SummaryRow label="Caja" value={variants[draft.variant].label} />
            <SummaryRow
              label="Entrada"
              value={draft.variant === 'nappan-box' ? 'Idea en texto' : 'Enlace de diseño'}
            />
            <SummaryRow
              label="Contenido"
              value={
                draft.variant === 'nappan-box'
                  ? draft.ideaText.trim() || 'Pendiente'
                  : draft.designLink.trim() || 'Pendiente'
              }
              muted={
                draft.variant === 'nappan-box'
                  ? !draft.ideaText.trim()
                  : !draft.designLink.trim()
              }
            />
            <SummaryRow
              label="Extras"
              value={draft.extras.length ? draft.extras.map((extra) => extras[extra].label).join(', ') : 'Sin extras'}
            />
            <SummaryRow label="Cantidad" value={`${draft.quantity} piezas`} />
          </dl>
        </section>
      </section>
    </main>
  )
}

function ConfigSection({
  children,
  eyebrow,
  title,
}: {
  children: React.ReactNode
  eyebrow: string
  title: string
}) {
  return (
    <section className="rounded-lg border p-4" style={{ background: 'var(--surface-1)', borderColor: 'var(--border)' }}>
      <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-secondary)' }}>
        Paso {eyebrow}
      </p>
      <h2 className="mt-1 text-xl font-semibold">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  )
}

function SummaryRow({
  label,
  muted = false,
  value,
}: {
  label: string
  muted?: boolean
  value: string
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt style={{ color: 'var(--text-secondary)' }}>{label}</dt>
      <dd
        className="max-w-[210px] text-right font-semibold leading-5"
        style={{ color: muted ? 'var(--error)' : 'var(--text-primary)' }}
      >
        {value}
      </dd>
    </div>
  )
}
