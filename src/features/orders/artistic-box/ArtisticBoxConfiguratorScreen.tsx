'use client'

import { useMemo, useState } from 'react'

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
    setAddedMessage(`${draft.quantity} ${variants[draft.variant].label} agregada al carrito.`)
  }

  return (
    <main
      className="hide-scrollbar min-h-dvh overflow-y-auto bg-[#0C0806] pb-8 text-[#F0E4CC]"
      style={{ paddingBottom: 'calc(96px + env(safe-area-inset-bottom, 0px))' }}
    >
      <header className="px-4 pt-5">
        <section className="overflow-hidden rounded-lg border border-[#E8A420]/12 bg-[#181209]">
          <div className="relative min-h-[152px] bg-[radial-gradient(circle_at_20%_18%,#F3C35B_0%,#7A2440_38%,#181209_78%)] p-4">
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#181209] to-transparent" />
            <div className="relative flex min-h-[120px] flex-col justify-between">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#FFE3A0]">
                Caja artística
              </p>
              <div>
                <h1 className="text-4xl font-semibold leading-none text-[#FFF6E5]">
                  Caja artística
                </h1>
                <p className="mt-2 max-w-[300px] text-sm leading-5 text-[#F0E4CC]/72">
                  Configura una caja personalizada con una idea escrita o con un enlace de diseño.
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
          <p className="mt-3 rounded-md border border-[#E8A420]/25 bg-[#E8A420]/10 px-3 py-2 text-sm leading-5 text-[#FFE3A0]">
            {addedMessage}
          </p>
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
                className={`min-h-[124px] rounded-lg border p-3 text-left transition active:scale-[0.99] ${
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

        <ConfigSection eyebrow="2" title="Idea del diseño">
          {draft.variant === 'nappan-box' ? (
            <>
              <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-[#7A6A55]">
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
                className="mt-2 w-full rounded-md border border-[#E8A420]/14 bg-[#100B07] px-4 py-3 text-sm leading-6 text-[#FFF6E5] outline-none transition placeholder:text-[#F0E4CC]/35 focus:border-[#E8A420]/60"
              />
              <p className="mt-2 text-sm leading-5 text-[#F0E4CC]/58">
                Cuéntanos la idea en texto. Nosotros la convertimos en diseño.
              </p>
            </>
          ) : (
            <>
              <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-[#7A6A55]">
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
                className="mt-2 w-full rounded-md border border-[#E8A420]/14 bg-[#100B07] px-4 py-3 text-sm text-[#FFF6E5] outline-none transition placeholder:text-[#F0E4CC]/35 focus:border-[#E8A420]/60"
              />
              <p className="mt-2 text-sm leading-5 text-[#F0E4CC]/58">
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
                  className={`flex min-h-[64px] w-full items-center justify-between gap-3 rounded-lg border px-3 py-3 text-left transition active:scale-[0.99] ${
                    isSelected
                      ? 'border-[#E8A420]/75 bg-[#E8A420]/12'
                      : 'border-[#E8A420]/10 bg-[#100B07]'
                  }`}
                >
                  <span>
                    <span className="block text-sm font-semibold leading-5 text-[#FFF6E5]">
                      {extras[extra].label}
                    </span>
                    <span className="mt-1 block text-xs text-[#F0E4CC]/54">
                      +${extras[extra].price} MXN por caja
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

        <ConfigSection eyebrow="4" title="Cantidad">
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
            La cantidad mínima es {MIN_QUANTITY}. Los extras se calculan por unidad.
          </p>
        </ConfigSection>

        <section className="rounded-lg border border-[#E8A420]/10 bg-[#181209] p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7A6A55]">
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
    <section className="rounded-lg border border-[#E8A420]/10 bg-[#181209] p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7A6A55]">
        Paso {eyebrow}
      </p>
      <h2 className="mt-1 text-xl font-semibold text-[#FFF6E5]">{title}</h2>
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
