'use client'

import { useState, type FormEvent } from 'react'
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

  const [name, setName] = useState(() => loadCustomerProfileSession()?.name ?? '')
  const [phone, setPhone] = useState(() => loadCustomerProfileSession()?.phone ?? '')
  const [address, setAddress] = useState('')
  const [receiverName, setReceiverName] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [deliveryTime, setDeliveryTime] = useState('')
  const [notes, setNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('transfer')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmedOrderNumber, setConfirmedOrderNumber] = useState<string | null>(null)
  const cartErrors = validate().errors

  const checkoutCardStyle = {
    borderColor: 'rgba(216, 155, 43, 0.18)',
    background:
      'linear-gradient(180deg, rgba(255, 250, 245, 0.98) 0%, rgba(255, 242, 232, 0.96) 100%)',
    boxShadow: '0 12px 34px -8px rgba(61, 44, 42, 0.10)',
  }

  const checkoutHeadingStyle = {
    fontFamily: 'var(--font-cormorant)',
    color: 'var(--text-primary)',
  }

  const checkoutBodyStyle = {
    fontFamily: 'var(--font-dm-sans)',
  }

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

      const formattedDate = deliveryDate ? deliveryDate.split('-').reverse().join('/') : ''

      const orderNumber = await submitOrder(cart, {
        name: trimmedName,
        phone: digitsOnly,
        address,
        receiverName,
        deliveryDate: formattedDate,
        deliveryTime,
        notes,
        paymentMethod,
      })

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
      <main
        className="desktop-nav-offset min-h-dvh px-4 pb-[calc(160px+env(safe-area-inset-bottom,0px))] pt-5 md:px-8 md:pb-24 lg:px-10"
        style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'var(--font-dm-sans)' }}
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
          <header className="overflow-hidden rounded-[24px] border p-5 md:p-6" style={checkoutCardStyle}>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-tertiary)' }}>
              Confirmar pedido
            </p>
            <h1 className="mt-1 text-[clamp(2.2rem,4vw,3.4rem)] font-semibold leading-none" style={checkoutHeadingStyle}>
              Checkout
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 md:text-[18px] md:leading-7" style={{ color: 'var(--text-secondary)', ...checkoutBodyStyle }}>
              Tu carrito está vacío. Agrega productos antes de continuar.
            </p>
          </header>

          <section className="overflow-hidden rounded-[24px] border p-5 md:p-6" style={checkoutCardStyle}>
            <p className="text-sm leading-6 md:text-[18px] md:leading-7" style={{ color: 'var(--text-secondary)', ...checkoutBodyStyle }}>
              Cuando vuelvas con productos en el carrito, podrás confirmar datos, envío y método de pago desde aquí.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/order"
                className="inline-flex flex-1 items-center justify-center rounded-full px-4 py-3 text-sm font-bold transition active:scale-[0.99]"
                style={{ background: 'var(--gold)', color: 'var(--text-primary)' }}
              >
                Ir a hacer un pedido
              </Link>
              <Link
                href="/cart"
                className="inline-flex flex-1 items-center justify-center rounded-full border px-4 py-3 text-sm font-semibold transition active:scale-[0.99]"
                style={{ borderColor: 'rgba(216, 155, 43, 0.2)', background: 'var(--surface-1)', color: 'var(--text-primary)' }}
              >
                Volver al carrito
              </Link>
            </div>
          </section>
        </div>
      </main>
    )
  }

  if (confirmedOrderNumber !== null) {
    return (
      <main
        className="desktop-nav-offset min-h-dvh px-4 pb-[calc(160px+env(safe-area-inset-bottom,0px))] pt-5 md:px-8 md:pb-24 lg:px-10"
        style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'var(--font-dm-sans)' }}
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
          <header className="overflow-hidden rounded-[24px] border p-5 md:p-6" style={checkoutCardStyle}>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-tertiary)' }}>
              Pedido enviado
            </p>
            <h1 className="mt-1 text-[clamp(2.2rem,4vw,3.4rem)] font-semibold leading-none" style={checkoutHeadingStyle}>
              Confirmado
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 md:text-[18px] md:leading-7" style={{ color: 'var(--text-secondary)', ...checkoutBodyStyle }}>
              Tu pedido fue recibido. En breve nos comunicamos contigo para confirmar los detalles.
            </p>
          </header>

          <section className="overflow-hidden rounded-[24px] border p-5 md:p-6" style={checkoutCardStyle}>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-tertiary)' }}>
              Número de pedido
            </p>
            <p className="mt-2 text-2xl font-semibold" style={checkoutHeadingStyle}>
              {confirmedOrderNumber}
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => router.push('/order')}
                className="inline-flex flex-1 items-center justify-center rounded-full px-4 py-3 text-sm font-bold transition active:scale-[0.99]"
                style={{ background: 'var(--gold)', color: 'var(--text-primary)' }}
              >
                Hacer otro pedido
              </button>
              <Link
                href="/cart"
                className="inline-flex flex-1 items-center justify-center rounded-full border px-4 py-3 text-sm font-semibold transition active:scale-[0.99]"
                style={{ borderColor: 'rgba(216, 155, 43, 0.2)', background: 'var(--surface-1)', color: 'var(--text-primary)' }}
              >
                Volver al carrito
              </Link>
            </div>
          </section>
        </div>
      </main>
    )
  }

  const { valid } = validate()

  return (
    <main
      className="desktop-nav-offset min-h-dvh px-4 pb-[calc(160px+env(safe-area-inset-bottom,0px))] pt-5 md:px-8 md:pb-24 lg:px-10"
      style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'var(--font-dm-sans)' }}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <header className="overflow-hidden rounded-[24px] border p-5 md:p-6" style={checkoutCardStyle}>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-tertiary)' }}>
            Confirmar pedido
          </p>
          <h1 className="mt-1 text-[clamp(2.2rem,4vw,3.4rem)] font-semibold leading-none" style={checkoutHeadingStyle}>
            Checkout
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 md:text-[18px] md:leading-7" style={{ color: 'var(--text-secondary)', ...checkoutBodyStyle }}>
            Revisa tu pedido y confirma tus datos para enviarlo.
          </p>
        </header>

        {cartErrors.length > 0 ? (
          <section className="overflow-hidden rounded-[24px] border p-5 md:p-6" style={checkoutCardStyle}>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-tertiary)' }}>
              Problemas con el carrito
            </p>
            <ul className="mt-3 space-y-2">
              {cartErrors.map((err) => (
                <li
                  key={err}
                  className="rounded-md border border-red-400/25 bg-red-500/10 px-3 py-2 text-sm leading-5 text-red-700"
                >
                  {err}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-12 lg:items-start">
          <section className="overflow-hidden rounded-[24px] border p-5 md:p-6 lg:col-span-5 lg:sticky lg:top-32" style={checkoutCardStyle}>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-tertiary)' }}>
              Resumen del pedido
            </p>
            <ul className="mt-4 space-y-3">
              {cart.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-4 rounded-[18px] border px-4 py-3"
                  style={{ borderColor: 'rgba(216, 155, 43, 0.14)', background: 'rgba(255, 252, 245, 0.85)' }}
                >
                  <span className="min-w-0 text-sm leading-5" style={{ color: 'var(--text-primary)', ...checkoutBodyStyle }}>
                    <span className="block font-semibold">{item.name}</span>
                    <span style={{ color: 'var(--text-tertiary)' }}>×{item.quantity}</span>
                  </span>
                  <span className="shrink-0 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {moneyFormat(item.base_price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 space-y-2 border-t pt-4" style={{ borderColor: 'rgba(216, 155, 43, 0.18)' }}>
              <div className="flex justify-between text-sm" style={{ color: 'var(--text-secondary)' }}>
                <span>Subtotal</span>
                <span>{moneyFormat(cart.summary.subtotal)}</span>
              </div>
              {cart.summary.extras_total > 0 ? (
                <div className="flex justify-between text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <span>Extras</span>
                  <span>{moneyFormat(cart.summary.extras_total)}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-base font-bold">
                <span style={{ color: 'var(--text-primary)' }}>Total</span>
                <span style={{ color: 'var(--gold)' }}>{moneyFormat(cart.summary.total)}</span>
              </div>
            </div>

            <div className="mt-4 rounded-[20px] border p-4" style={{ borderColor: 'rgba(216, 155, 43, 0.14)', background: 'rgba(255, 248, 245, 0.8)' }}>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-tertiary)' }}>
                Antes de confirmar
              </p>
              <p className="mt-2 text-sm leading-6 md:text-[18px] md:leading-7" style={{ color: 'var(--text-secondary)', ...checkoutBodyStyle }}>
                Revisa que nombre, teléfono y dirección estén correctos. Si necesitas ajustar algo, puedes volver al carrito.
              </p>
            </div>
          </section>

          <section className="overflow-hidden rounded-[24px] border p-5 md:p-6 lg:col-span-7" style={checkoutCardStyle}>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-tertiary)' }}>
              Datos del cliente
            </p>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  Nombre
                </span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  className="h-11 w-full rounded-md border px-4 text-sm outline-none transition"
                  style={{
                    borderColor: 'rgba(216, 155, 43, 0.2)',
                    background: 'var(--surface-2)',
                    color: 'var(--text-primary)',
                  }}
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  Teléfono
                </span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="numeric"
                  placeholder="8112345678"
                  className="h-11 w-full rounded-md border px-4 text-sm outline-none transition"
                  style={{
                    borderColor: 'rgba(216, 155, 43, 0.2)',
                    background: 'var(--surface-2)',
                    color: 'var(--text-primary)',
                  }}
                />
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    Quién recibe
                  </span>
                  <input
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    placeholder="Nombre"
                    className="h-11 w-full rounded-md border px-4 text-sm outline-none transition"
                    style={{
                      borderColor: 'rgba(216, 155, 43, 0.2)',
                      background: 'var(--surface-2)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    Dirección
                  </span>
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Calle, #, Col."
                    className="h-11 w-full rounded-md border px-4 text-sm outline-none transition"
                    style={{
                      borderColor: 'rgba(216, 155, 43, 0.2)',
                      background: 'var(--surface-2)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    Día de entrega
                  </span>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="h-11 w-full rounded-md border px-4 text-sm outline-none transition"
                    style={{
                      borderColor: 'rgba(216, 155, 43, 0.2)',
                      background: 'var(--surface-2)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    Hora de entrega
                  </span>
                  <input
                    type="time"
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    className="h-11 w-full rounded-md border px-4 text-sm outline-none transition"
                    style={{
                      borderColor: 'rgba(216, 155, 43, 0.2)',
                      background: 'var(--surface-2)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  Notas especiales
                </span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Instrucciones adicionales..."
                  className="min-h-[88px] w-full rounded-md border p-4 text-sm outline-none transition"
                  style={{
                    borderColor: 'rgba(216, 155, 43, 0.2)',
                    background: 'var(--surface-2)',
                    color: 'var(--text-primary)',
                  }}
                />
              </label>

              <div className="space-y-2">
                <span className="block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  Método de pago
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('transfer')}
                    className="flex h-11 items-center justify-center rounded-md border text-sm font-semibold transition"
                    style={
                      paymentMethod === 'transfer'
                        ? { borderColor: 'var(--gold)', background: 'rgba(216, 155, 43, 0.15)', color: 'var(--gold)' }
                        : { borderColor: 'rgba(216, 155, 43, 0.2)', background: 'var(--surface-2)', color: 'var(--text-secondary)' }
                    }
                  >
                    Transferencia SPEI
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className="flex h-11 items-center justify-center rounded-md border text-sm font-semibold transition"
                    style={
                      paymentMethod === 'cash'
                        ? { borderColor: 'var(--gold)', background: 'rgba(216, 155, 43, 0.15)', color: 'var(--gold)' }
                        : { borderColor: 'rgba(216, 155, 43, 0.2)', background: 'var(--surface-2)', color: 'var(--text-secondary)' }
                    }
                  >
                    Efectivo
                  </button>
                </div>
              </div>

              {error ? (
                <p className="rounded-md border border-red-400/25 bg-red-500/10 px-3 py-2 text-sm leading-5 text-red-700">
                  {error}
                </p>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/cart"
                  className="inline-flex flex-1 items-center justify-center rounded-full border px-4 py-3 text-sm font-semibold transition active:scale-[0.99]"
                  style={{ borderColor: 'rgba(216, 155, 43, 0.2)', background: 'var(--surface-1)', color: 'var(--text-primary)' }}
                >
                  Volver al carrito
                </Link>
                <button
                  type="submit"
                  disabled={loading || !valid}
                  className="inline-flex flex-1 items-center justify-center rounded-full px-4 py-3 text-sm font-bold transition active:scale-[0.99] disabled:opacity-60"
                  style={{ background: 'var(--gold)', color: 'var(--text-primary)' }}
                >
                  {loading ? 'Enviando pedido...' : 'Confirmar pedido'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  )
}
