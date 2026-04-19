'use client'

import { useEffect, useMemo, useState } from 'react'
import { listFitbarProducts, type FitbarProductRow } from './fitbar.service'

type FitbarCategory = 'coffee' | 'shots' | 'food'

type FitbarQuantityMap = Record<string, number>

type FitbarGroups = Record<
  FitbarCategory,
  {
    title: string
    hint: string
    items: FitbarProductRow[]
  }
>

const MIN_TOTAL = 1000

function getCategory(product: FitbarProductRow): FitbarCategory {
  const token = `${product.sku} ${product.name}`.toLowerCase()

  if (
    token.includes('coffee') ||
    token.includes('latte') ||
    token.includes('brew') ||
    token.includes('cafe') ||
    token.includes('cold')
  ) {
    return 'coffee'
  }

  if (
    token.includes('shot') ||
    token.includes('boost') ||
    token.includes('energy') ||
    token.includes('detox')
  ) {
    return 'shots'
  }

  return 'food'
}

function buildGroups(products: FitbarProductRow[]): FitbarGroups {
  return products.reduce<FitbarGroups>(
    (groups, product) => {
      const category = getCategory(product)
      groups[category].items.push(product)
      return groups
    },
    {
      coffee: {
        title: 'Café',
        hint: 'Bebidas frías y calientes para abrir el pedido.',
        items: [],
      },
      shots: {
        title: 'Impulsos',
        hint: 'Apoyos funcionales y porciones concentradas.',
        items: [],
      },
      food: {
        title: 'Comida',
        hint: 'Opciones sólidas para completar el total.',
        items: [],
      },
    },
  )
}

function getItemTotal(product: FitbarProductRow, quantity: number) {
  return product.base_price * quantity
}

function getSelectedCount(quantities: FitbarQuantityMap) {
  return Object.values(quantities).reduce((sum, quantity) => sum + quantity, 0)
}

export default function FitbarOrderScreen() {
  const [products, setProducts] = useState<FitbarProductRow[]>([])
  const [quantities, setQuantities] = useState<FitbarQuantityMap>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadProducts() {
      try {
        const nextProducts = await listFitbarProducts()

        if (cancelled) {
          return
        }

        setProducts(nextProducts)
        setQuantities(
          nextProducts.reduce<FitbarQuantityMap>((acc, product) => {
            acc[product.sku] = 0
            return acc
          }, {}),
        )
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'No se pudieron cargar los productos de bienestar.',
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadProducts()

    return () => {
      cancelled = true
    }
  }, [])

  const groups = useMemo(() => buildGroups(products), [products])

  const total = useMemo(
    () =>
      products.reduce(
        (sum, product) => sum + getItemTotal(product, quantities[product.sku] ?? 0),
        0,
      ),
    [products, quantities],
  )

  const canSubmit = total >= MIN_TOTAL

  function updateQuantity(sku: string, nextQuantity: number) {
    setQuantities((current) => ({
      ...current,
      [sku]: Math.max(0, Number.isFinite(nextQuantity) ? nextQuantity : 0),
    }))
    setFeedback('')
    setError('')
  }

  function addSelectionToCart() {
    if (!canSubmit) {
      setError(`El pedido mínimo es de $${MIN_TOTAL.toLocaleString('es-MX')} MXN.`)
      setFeedback('')
      return
    }

    setError('')
    setFeedback('La selección completa se agregó como un solo artículo al carrito.')
  }

  return (
    <main
      className="hide-scrollbar min-h-dvh overflow-y-auto bg-[#0C0806] pb-8 text-[#F0E4CC]"
      style={{ paddingBottom: 'calc(96px + env(safe-area-inset-bottom, 0px))' }}
    >
      <header className="px-4 pt-5">
        <section className="overflow-hidden rounded-lg border border-[#E8A420]/12 bg-[#181209]">
          <div className="relative min-h-[150px] bg-[radial-gradient(circle_at_20%_18%,#F6C45B_0%,#3A2210_36%,#181209_80%)] p-4">
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#181209] to-transparent" />
            <div className="relative flex min-h-[118px] flex-col justify-between">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#FFE3A0]">
                Barra bienestar
              </p>
              <div>
                <h1 className="text-4xl font-semibold leading-none text-[#FFF6E5]">
                  Barra de proteína Fitbar
                </h1>
                <p className="mt-2 max-w-[300px] text-sm leading-5 text-[#F0E4CC]/72">
                  Arma un pedido con varios productos, elige cantidades por artículo y llega al mínimo de compra en una sola selección.
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
              {getSelectedCount(quantities)} productos seleccionados
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7A6A55]">
              Total
            </p>
            <p className="mt-1 text-2xl font-bold text-[#E8A420]">
              ${total.toLocaleString('es-MX')}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={addSelectionToCart}
          className={`mt-3 w-full rounded-md px-4 py-3 text-sm font-bold transition active:scale-[0.99] ${
            canSubmit
              ? 'bg-[#E8A420] text-[#0C0806]'
              : 'bg-[#4A3420] text-[#F0E4CC]/55'
          }`}
        >
          Agregar selección al carrito
        </button>

        {error ? (
          <p className="mt-3 rounded-md border border-red-400/25 bg-red-500/10 px-3 py-2 text-sm leading-5 text-red-100">
            {error}
          </p>
        ) : null}

        {feedback ? (
          <p className="mt-3 rounded-md border border-[#E8A420]/25 bg-[#E8A420]/10 px-3 py-2 text-sm leading-5 text-[#FFE3A0]">
            {feedback}
          </p>
        ) : null}
      </section>

      <section className="space-y-3 px-4 pt-4">
        {loading ? (
          <StateCard title="Cargando productos" text="Estamos trayendo la lista desde Supabase." />
        ) : null}

        {!loading && error ? (
          <StateCard title="No se pudo cargar" text={error} />
        ) : null}

        {!loading && !error
          ? (Object.entries(groups) as Array<[FitbarCategory, FitbarGroups[FitbarCategory]]>).map(
              ([key, group]) => (
                <section key={key} className="rounded-lg border border-[#E8A420]/10 bg-[#181209] p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7A6A55]">
                    {group.title}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-[#FFF6E5]">
                    {group.hint}
                  </h2>

                  <div className="mt-4 space-y-3">
                    {group.items.map((product) => {
                      const quantity = quantities[product.sku] ?? 0
                      const lineTotal = getItemTotal(product, quantity)

                      return (
                        <div
                          key={product.sku}
                          className="rounded-lg border border-[#E8A420]/10 bg-[#100B07] p-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-[#FFF6E5]">
                                {product.name}
                              </p>
                              <p className="mt-1 text-xs text-[#F0E4CC]/54">
                                {product.sku}
                              </p>
                            </div>
                            <p className="text-sm font-bold text-[#E8A420]">
                              ${product.base_price.toLocaleString('es-MX')}
                            </p>
                          </div>

                          <div className="mt-3 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateQuantity(product.sku, quantity - 1)}
                              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[#E8A420]/14 bg-[#181209] text-2xl font-semibold text-[#FFF6E5] active:scale-[0.98]"
                              aria-label={`Restar ${product.name}`}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min={0}
                              value={quantity}
                              onChange={(event) =>
                                updateQuantity(product.sku, Number(event.target.value))
                              }
                              className="h-11 min-w-0 flex-1 rounded-md border border-[#E8A420]/14 bg-[#181209] px-4 text-center text-base font-bold text-[#FFF6E5] outline-none focus:border-[#E8A420]/60"
                              aria-label={`Cantidad de ${product.name}`}
                            />
                            <button
                              type="button"
                              onClick={() => updateQuantity(product.sku, quantity + 1)}
                              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[#E8A420]/14 bg-[#181209] text-2xl font-semibold text-[#FFF6E5] active:scale-[0.98]"
                              aria-label={`Sumar ${product.name}`}
                            >
                              +
                            </button>
                          </div>

                          <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                            <span className="text-[#F0E4CC]/58">Subtotal</span>
                            <span className="font-semibold text-[#FFF6E5]">
                              ${lineTotal.toLocaleString('es-MX')}
                            </span>
                          </div>
                        </div>
                      )
                    })}

                    {!group.items.length ? (
                      <p className="text-sm leading-5 text-[#F0E4CC]/58">
                        No hay productos en esta categoría.
                      </p>
                    ) : null}
                  </div>
                </section>
              ),
            )
          : null}

        <section className="rounded-lg border border-[#E8A420]/10 bg-[#181209] p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7A6A55]">
            Selección final
          </p>
          <dl className="mt-3 space-y-2 text-sm">
            <SummaryRow label="Categorías" value="Café, impulsos y comida" />
            <SummaryRow
              label="Productos"
              value={`${getSelectedCount(quantities)} artículos`}
            />
            <SummaryRow label="Total" value={`$${total.toLocaleString('es-MX')} MXN`} />
            <SummaryRow
              label="Estado"
              value={canSubmit ? 'Cumple mínimo de compra' : `Faltan $${(MIN_TOTAL - total).toLocaleString('es-MX')} MXN`}
              muted={!canSubmit}
            />
          </dl>
        </section>
      </section>
    </main>
  )
}

function StateCard({ title, text }: { title: string; text: string }) {
  return (
    <section className="rounded-lg border border-[#E8A420]/10 bg-[#181209] p-4">
      <p className="text-sm font-semibold text-[#FFF6E5]">{title}</p>
      <p className="mt-2 text-sm leading-5 text-[#F0E4CC]/58">{text}</p>
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
