'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useCartStore } from '@/store/cart.store'
import type { CartExtra } from '@/domain/cart.domain'

type LunchboxVariant = 'lunchbox1' | 'lunchbox2'
type LunchboxDesign = 'osito' | 'capibara'
type LunchboxComplement = 'fruta' | 'gelatina'
type FruitType = 'uva' | 'durazno' | 'fresa'
type LunchboxExtra = 'salchipulpos' | 'nucolato' | 'croissant'

type LunchboxDraft = {
  variant: LunchboxVariant
  design: LunchboxDesign
  complement: LunchboxComplement
  fruitType: FruitType | ''
  extras: LunchboxExtra[]
  quantity: number
}

const MIN_QUANTITY = 20

const variants: Record<LunchboxVariant, { label: string; price: number; note: string }> = {
  lunchbox1: {
    label: 'Lunchbox 1',
    price: 125,
    note: 'Caja base para eventos. Permite agregar salchipulpos.',
  },
  lunchbox2: {
    label: 'Lunchbox 2',
    price: 130,
    note: 'Caja con más antojo. Permite cambio a croissant.',
  },
}

const designs: Record<LunchboxDesign, string> = {
  osito: 'Osito',
  capibara: 'Capibara',
}

const complements: Record<LunchboxComplement, string> = {
  fruta: 'Fruta',
  gelatina: 'Gelatina',
}

const fruitTypes: Record<FruitType, string> = {
  uva: 'Uva',
  durazno: 'Durazno',
  fresa: 'Fresa',
}

const extras: Record<LunchboxExtra, { label: string; price: number; allowedVariant: LunchboxVariant | 'both' }> = {
  salchipulpos: {
    label: 'Salchipulpos + catsup',
    price: 25,
    allowedVariant: 'lunchbox1',
  },
  nucolato: {
    label: 'Cambio a Nucolato',
    price: 5,
    allowedVariant: 'both',
  },
  croissant: {
    label: 'Croissant completo',
    price: 20,
    allowedVariant: 'lunchbox2',
  },
}

const initialDraft: LunchboxDraft = {
  variant: 'lunchbox1',
  design: 'osito',
  complement: 'fruta',
  fruitType: '',
  extras: [],
  quantity: MIN_QUANTITY,
}

function isExtraAllowed(extra: LunchboxExtra, variant: LunchboxVariant) {
  const allowedVariant = extras[extra].allowedVariant
  return allowedVariant === 'both' || allowedVariant === variant
}

function getAvailableExtras(variant: LunchboxVariant): CartExtra[] {
  return (Object.keys(extras) as LunchboxExtra[])
    .filter((extra) => isExtraAllowed(extra, variant))
    .map((extra) => ({
      id: extra,
      label: extras[extra].label,
      price: extras[extra].price,
    }))
}

function getValidationError(draft: LunchboxDraft) {
  if (draft.quantity < MIN_QUANTITY) {
    return `El pedido mínimo es de ${MIN_QUANTITY} lunchboxes.`
  }

  if (draft.complement === 'fruta' && !draft.fruitType) {
    return 'Elige el tipo de fruta para continuar.'
  }

  const invalidExtra = draft.extras.find((extra) => !isExtraAllowed(extra, draft.variant))
  if (invalidExtra) {
    return `${extras[invalidExtra].label} no está disponible para ${variants[draft.variant].label}.`
  }

  return null
}

export default function LunchboxConfiguratorScreen() {
  const [draft, setDraft] = useState<LunchboxDraft>(initialDraft)
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

  function updateVariant(variant: LunchboxVariant) {
    setDraft((current) => ({
      ...current,
      variant,
      extras: current.extras.filter((extra) => isExtraAllowed(extra, variant)),
    }))
    clearFeedback()
  }

  function updateComplement(complement: LunchboxComplement) {
    setDraft((current) => ({
      ...current,
      complement,
      fruitType: complement === 'fruta' ? current.fruitType : '',
    }))
    clearFeedback()
  }

  function toggleExtra(extra: LunchboxExtra) {
    if (!isExtraAllowed(extra, draft.variant)) {
      return
    }

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
      quantity: Number.isFinite(nextQuantity) ? nextQuantity : MIN_QUANTITY,
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
      type: 'lunchbox',
      sku: draft.variant,
      name: variants[draft.variant].label,
      quantity: draft.quantity,
      base_price: variants[draft.variant].price,
      config: {
        variant: draft.variant,
        design: draft.design,
        complement: draft.complement,
        fruitType: draft.fruitType,
        availableExtras: getAvailableExtras(draft.variant),
      },
      includes: [],
      extras: draft.extras.map((extra) => ({
        id: extra,
        label: extras[extra].label,
        price: extras[extra].price,
      })) as CartExtra[],
    })
    setAddedMessage(
      `${draft.quantity} ${variants[draft.variant].label} agregadas al carrito.`,
    )
    setDraft(initialDraft)
  }

  return (
    <main
      className="hide-scrollbar min-h-dvh overflow-y-auto bg-[#0C0806] pb-8 text-[#F0E4CC]"
      style={{ paddingBottom: 'calc(96px + env(safe-area-inset-bottom, 0px))' }}
    >
      <header className="px-4 pt-5">
        <section className="overflow-hidden rounded-lg border border-[#E8A420]/12 bg-[#181209]">
          <div className="relative min-h-[148px] bg-[radial-gradient(circle_at_24%_18%,#F6C45B_0%,#8E2C20_36%,#181209_76%)] p-4">
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#181209] to-transparent" />
            <div className="relative flex h-full min-h-[116px] flex-col justify-between">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#FFE3A0]">
                Pedido para eventos
              </p>
              <div>
                <h1 className="text-4xl font-semibold leading-none text-[#FFF6E5]">
                  Caja Lunchbox
                </h1>
                <p className="mt-2 max-w-[300px] text-sm leading-5 text-[#F0E4CC]/72">
                  Configura cajas para cumpleaños, colegios y celebraciones. Mínimo 20 piezas.
                </p>
              </div>
            </div>
          </div>
        </section>
      </header>

      <section className="sticky top-0 z-20 mt-4 border-y border-[#E8A420]/10 bg-[#100B07]/95 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7A6A55]">
              Resumen
            </p>
            <p className="mt-1 text-sm font-semibold text-[#FFF6E5]">
              {draft.quantity} cajas · ${unitPrice} c/u
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7A6A55]">
              Total
            </p>
            <p className="mt-1 text-2xl font-bold text-[#E8A420]">
              ${orderTotal.toLocaleString('es-MX')}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={addToCart}
          className="mt-3 w-full rounded-md bg-[#E8A420] px-4 py-3 text-sm font-bold text-[#0C0806] transition active:scale-[0.99]"
        >
          Agregar al carrito
        </button>

        {error ? (
          <p className="mt-3 rounded-md border border-red-400/25 bg-red-500/10 px-3 py-2 text-sm leading-5 text-red-100">
            {error}
          </p>
        ) : null}

        {addedMessage ? (
          <div className="mt-3 space-y-2">
            <p className="rounded-md border border-[#E8A420]/25 bg-[#E8A420]/10 px-3 py-2 text-sm leading-5 text-[#FFE3A0]">
              {addedMessage}
            </p>
            <Link
              href="/cart"
              className="inline-flex w-full items-center justify-center rounded-md border border-[#E8A420]/14 bg-[#100B07] px-4 py-3 text-sm font-semibold text-[#FFF6E5] transition active:scale-[0.99]"
            >
              Ir al carrito
            </Link>
          </div>
        ) : null}
      </section>

      <section className="space-y-3 px-4 pt-4">
        <ConfigSection eyebrow="1" title="Tipo de caja">
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(variants) as LunchboxVariant[]).map((variant) => (
              <button
                key={variant}
                type="button"
                onClick={() => updateVariant(variant)}
                className={`min-h-[126px] rounded-lg border p-3 text-left transition active:scale-[0.99] ${
                  draft.variant === variant
                    ? 'border-[#E8A420]/75 bg-[#E8A420]/12'
                    : 'border-[#E8A420]/10 bg-[#100B07]'
                }`}
              >
                <span className="block text-lg font-semibold leading-5 text-[#FFF6E5]">
                  {variants[variant].label}
                </span>
                <span className="mt-2 block text-sm font-bold text-[#E8A420]">
                  ${variants[variant].price} MXN
                </span>
                <span className="mt-2 block text-xs leading-4 text-[#F0E4CC]/58">
                  {variants[variant].note}
                </span>
              </button>
            ))}
          </div>
        </ConfigSection>

        <ConfigSection eyebrow="2" title="Diseño del pancake">
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(designs) as LunchboxDesign[]).map((design) => (
              <ChoiceButton
                key={design}
                label={designs[design]}
                selected={draft.design === design}
                onClick={() => {
                  setDraft((current) => ({ ...current, design }))
                  clearFeedback()
                }}
              />
            ))}
          </div>
        </ConfigSection>

        <ConfigSection eyebrow="3" title="Complemento">
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(complements) as LunchboxComplement[]).map((complement) => (
              <ChoiceButton
                key={complement}
                label={complements[complement]}
                selected={draft.complement === complement}
                onClick={() => updateComplement(complement)}
              />
            ))}
          </div>

          {draft.complement === 'fruta' ? (
            <div className="mt-3 rounded-md border border-[#E8A420]/10 bg-[#0C0806] p-3">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#7A6A55]">
                Tipo de fruta
              </p>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(fruitTypes) as FruitType[]).map((fruitType) => (
                  <ChoiceButton
                    key={fruitType}
                    label={fruitTypes[fruitType]}
                    selected={draft.fruitType === fruitType}
                    onClick={() => {
                      setDraft((current) => ({ ...current, fruitType }))
                      clearFeedback()
                    }}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </ConfigSection>

        <ConfigSection eyebrow="4" title="Extras">
          <div className="space-y-2">
            {(Object.keys(extras) as LunchboxExtra[]).map((extra) => {
              const isAllowed = isExtraAllowed(extra, draft.variant)
              const isSelected = draft.extras.includes(extra)
              const unavailableText =
                extras[extra].allowedVariant === 'both'
                  ? ''
                  : `Solo para ${variants[extras[extra].allowedVariant].label}`

              return (
                <button
                  key={extra}
                  type="button"
                  disabled={!isAllowed}
                  onClick={() => toggleExtra(extra)}
                  className={`flex min-h-[68px] w-full items-center justify-between gap-3 rounded-lg border px-3 py-3 text-left transition ${
                    isSelected
                      ? 'border-[#E8A420]/75 bg-[#E8A420]/12'
                      : 'border-[#E8A420]/10 bg-[#100B07]'
                  } ${isAllowed ? 'active:scale-[0.99]' : 'cursor-not-allowed opacity-45'}`}
                >
                  <span>
                    <span className="block text-sm font-semibold leading-5 text-[#FFF6E5]">
                      {extras[extra].label}
                    </span>
                    <span className="mt-1 block text-xs text-[#F0E4CC]/54">
                      {isAllowed ? `+$${extras[extra].price} MXN por caja` : unavailableText}
                    </span>
                  </span>
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                      isSelected
                        ? 'border-[#E8A420] bg-[#E8A420]'
                        : 'border-[#7A6A55]'
                    }`}
                  >
                    {isSelected ? (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#0C0806"
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

        <ConfigSection eyebrow="5" title="Cantidad">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => updateQuantity(Math.max(MIN_QUANTITY, draft.quantity - 1))}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-[#E8A420]/14 bg-[#100B07] text-2xl font-semibold text-[#FFF6E5] active:scale-[0.98]"
              aria-label="Restar una caja"
            >
              -
            </button>
            <input
              type="number"
              min={MIN_QUANTITY}
              value={draft.quantity}
              onChange={(event) => updateQuantity(Number(event.target.value))}
              className="h-12 min-w-0 flex-1 rounded-md border border-[#E8A420]/14 bg-[#100B07] px-4 text-center text-lg font-bold text-[#FFF6E5] outline-none focus:border-[#E8A420]/60"
              aria-label="Cantidad de cajas"
            />
            <button
              type="button"
              onClick={() => updateQuantity(draft.quantity + 1)}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-[#E8A420]/14 bg-[#100B07] text-2xl font-semibold text-[#FFF6E5] active:scale-[0.98]"
              aria-label="Agregar una caja"
            >
              +
            </button>
          </div>
          <p className="mt-2 text-sm leading-5 text-[#F0E4CC]/58">
            El mínimo para Lunchbox es de {MIN_QUANTITY} piezas.
          </p>
        </ConfigSection>

        <section className="rounded-lg border border-[#E8A420]/10 bg-[#181209] p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7A6A55]">
            Detalle final
          </p>
          <dl className="mt-3 space-y-2 text-sm">
            <SummaryRow label="Caja" value={variants[draft.variant].label} />
            <SummaryRow label="Diseño" value={designs[draft.design]} />
            <SummaryRow label="Complemento" value={complements[draft.complement]} />
            {draft.complement === 'fruta' ? (
              <SummaryRow
                label="Fruta"
                value={draft.fruitType ? fruitTypes[draft.fruitType] : 'Pendiente'}
                muted={!draft.fruitType}
              />
            ) : null}
            <SummaryRow
              label="Extras"
              value={
                draft.extras.length
                  ? draft.extras.map((extra) => extras[extra].label).join(', ')
                  : 'Sin extras'
              }
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
    <section className="rounded-lg border border-[#E8A420]/10 bg-[#181209] p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7A6A55]">
        Paso {eyebrow}
      </p>
      <h2 className="mt-1 text-xl font-semibold text-[#FFF6E5]">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  )
}

function ChoiceButton({
  label,
  onClick,
  selected,
}: {
  label: string
  onClick: () => void
  selected: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-12 rounded-md border px-3 py-2 text-center text-sm font-semibold leading-5 transition active:scale-[0.99] ${
        selected
          ? 'border-[#E8A420]/75 bg-[#E8A420]/12 text-[#FFF6E5]'
          : 'border-[#E8A420]/10 bg-[#100B07] text-[#F0E4CC]/68'
      }`}
    >
      {label}
    </button>
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
      <dt className="text-[#F0E4CC]/52">{label}</dt>
      <dd
        className={`max-w-[210px] text-right font-semibold leading-5 ${
          muted ? 'text-red-100' : 'text-[#FFF6E5]'
        }`}
      >
        {value}
      </dd>
    </div>
  )
}
