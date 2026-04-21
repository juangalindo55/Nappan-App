'use client'

import { useState, useEffect, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cart.store'
import {
  loadCustomerProfileSession,
  saveCustomerProfileSession,
} from '@/lib/customer-profile-session'
import { resolveCustomerProfile } from '@/services/customer.service'
import { submitOrder } from '@/services/cart.service'

function moneyFormat(value: number) {
  return `$${value.toLocaleString('es-MX')}`
}

function getFriendlyError(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim() !== '') return error.message
  return fallback
}

export default function CheckoutScreen() {
  const router = useRouter()
  const cart = useCartStore((s) => s.cart)
  const validate = useCartStore((s) => s.validate)
  const reset = useCartStore((s) => s.reset)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cartErrors, setCartErrors] = useState<string[]>([])
  const [confirmedOrderNumber, setConfirmedOrderNumber] = useState<string | null>(null)

  useEffect(() => {
    const session = loadCustomerProfileSession()
    if (session) {
      if (session.name) setName(session.name)
      if (session.phone) setPhone(session.phone)
    }
    const { errors } = validate()
    setCartErrors(errors)
  }, [validate])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const trimmedName = name.trim()
    const digitsOnly = phone.replace(/\D/g, '')

    if (!trimmedName) {
      setError('El nombre es obligatorio.')
      return
    }

    if (digitsOnly.length < 10) {
      setError('Ingresa un número de teléfono válido (mínimo 10 dígitos).')
      return
    }

    setLoading(true)

    try {
      const profileResult = await resolveCustomerProfile({ phone: digitsOnly, name: trimmedName })

      const orderNumber = await submitOrder(cart, { name: trimmedName, phone: digitsOnly })

      saveCustomerProfileSession({
        name: profileResult.profile.name || trimmedName,
        phone: profileResult.profile.phone || digitsOnly,
        tierName: profileResult.profile.tierName,
        tierSlug: profileResult.profile.tierSlug,
        discountPercent: profileResult.profile.discountPercent,
      })

      reset()
      setConfirmedOrderNumber(orderNumber)
    } catch (submitError) {
      setError(getFriendlyError(submitError, 'No pudimos procesar tu pedido. Intenta otra vez.'))
    } finally {
      setLoading(false)
    }
  }

  if (cart.items.length === 0 && confirmedOrderNumber === null) {
    return (
      <main className="min-h-dvh bg-[#0C0806] px-4 pb-32 pt-5 text-[#F0E4CC]">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          <header className="rounded-lg border border-[#E8A420]/10 bg-[#181209] p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7A6A55]">
              Confirmar pedido
            </p>
            <h1 className="mt-1 text-3xl font-semibold text-[#FFF6E5]">Checkout</h1>
          </header>
          <section className="rounded-lg border border-[#E8A420]/10 bg-[#181209] p-4">
            <p className="text-sm leading-5 text-[#F0E4CC]/62">
              Tu carrito está vacío. Agrega productos antes de continuar.
            </p>
            <div className="mt-4">
              <Link
                href="/order"
                className="inline-flex w-full items-center justify-center rounded-md bg-[#E8A420] px-4 py-3 text-sm font-bold text-[#0C0806] transition active:scale-[0.99]"
              >
                Ir a hacer un pedido
              </Link>
            </div>
          </section>
        </div>
      </main>
    )
  }

  if (confirmedOrderNumber !== null) {
    return (
      <main className="min-h-dvh bg-[#0C0806] px-4 pb-32 pt-5 text-[#F0E4CC]">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          <header className="rounded-lg border border-[#E8A420]/10 bg-[#181209] p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7A6A55]">
              Pedido enviado
            </p>
            <h1 className="mt-1 text-3xl font-semibold text-[#FFF6E5]">Confirmado</h1>
          </header>
          <section className="rounded-lg border border-[#E8A420]/10 bg-[#181209] p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7A6A55]">
              Número de pedido
            </p>
            <p className="mt-2 text-xl font-semibold text-[#FFF6E5]">{confirmedOrderNumber}</p>
            <p className="mt-2 text-sm leading-5 text-[#F0E4CC]/62">
              Tu pedido fue recibido. En breve nos comunicamos contigo para confirmar los detalles.
            </p>
            <div className="mt-5">
              <button
                type="button"
                onClick={() => router.push('/order')}
                className="inline-flex w-full items-center justify-center rounded-md bg-[#E8A420] px-4 py-3 text-sm font-bold text-[#0C0806] transition active:scale-[0.99]"
              >
                Hacer otro pedido
              </button>
            </div>
          </section>
        </div>
      </main>
    )
  }

  const { valid } = validate()

  return (
    <main className="min-h-dvh bg-[#0C0806] px-4 pb-32 pt-5 text-[#F0E4CC]">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <header className="rounded-lg border border-[#E8A420]/10 bg-[#181209] p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7A6A55]">
            Confirmar pedido
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-[#FFF6E5]">Checkout</h1>
          <p className="mt-2 text-sm leading-5 text-[#F0E4CC]/60">
            Revisa tu pedido y confirma tus datos para enviarlo.
          </p>
        </header>

        {cartErrors.length > 0 ? (
          <section className="rounded-lg border border-[#E8A420]/10 bg-[#181209] p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7A6A55]">
              Problemas con el carrito
            </p>
            <ul className="mt-3 space-y-2">
              {cartErrors.map((err) => (
                <li
                  key={err}
                  className="rounded-md border border-red-400/25 bg-red-500/10 px-3 py-2 text-sm leading-5 text-red-100"
                >
                  {err}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="rounded-lg border border-[#E8A420]/10 bg-[#181209] p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7A6A55]">
            Resumen del pedido
          </p>
          <ul className="mt-3 space-y-2">
            {cart.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-[#F0E4CC]">
                  {item.name}
                  <span className="ml-1 text-[#F0E4CC]/50">×{item.quantity}</span>
                </span>
                <span className="font-semibold text-[#FFF6E5]">
                  {moneyFormat(item.base_price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1 border-t border-[#E8A420]/10 pt-3">
            <div className="flex justify-between text-sm text-[#F0E4CC]/70">
              <span>Subtotal</span>
              <span>{moneyFormat(cart.summary.subtotal)}</span>
            </div>
            {cart.summary.extras_total > 0 ? (
              <div className="flex justify-between text-sm text-[#F0E4CC]/70">
                <span>Extras</span>
                <span>{moneyFormat(cart.summary.extras_total)}</span>
              </div>
            ) : null}
            <div className="flex justify-between text-base font-bold text-[#FFF6E5]">
              <span>Total</span>
              <span className="text-[#E8A420]">{moneyFormat(cart.summary.total)}</span>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-[#E8A420]/10 bg-[#181209] p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7A6A55]">
            Datos del cliente
          </p>
          <form onSubmit={handleSubmit} className="mt-3 space-y-3">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-[#F0E4CC]/60">Nombre</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                className="h-11 w-full rounded-md border border-[#E8A420]/14 bg-[#100B07] px-4 text-sm text-[#FFF6E5] outline-none transition placeholder:text-[#F0E4CC]/35 focus:border-[#E8A420]/60"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-[#F0E4CC]/60">Teléfono</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="numeric"
                placeholder="8112345678"
                className="h-11 w-full rounded-md border border-[#E8A420]/14 bg-[#100B07] px-4 text-sm text-[#FFF6E5] outline-none transition placeholder:text-[#F0E4CC]/35 focus:border-[#E8A420]/60"
              />
            </label>
            {error ? (
              <p className="rounded-md border border-red-400/25 bg-red-500/10 px-3 py-2 text-sm leading-5 text-red-100">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={loading || !valid}
              className="inline-flex w-full items-center justify-center rounded-md bg-[#E8A420] px-4 py-3 text-sm font-bold text-[#0C0806] transition active:scale-[0.99] disabled:opacity-60"
            >
              {loading ? 'Enviando pedido...' : 'Confirmar pedido'}
            </button>
          </form>
        </section>

        <div className="pb-4">
          <Link
            href="/cart"
            className="inline-flex w-full items-center justify-center rounded-md border border-[#E8A420]/14 bg-[#100B07] px-4 py-3 text-sm font-semibold text-[#FFF6E5] transition active:scale-[0.99]"
          >
            Volver al carrito
          </Link>
        </div>
      </div>
    </main>
  )
}
