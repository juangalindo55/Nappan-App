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
      <main className="desktop-nav-offset min-h-dvh px-4 pb-32 pt-5" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          <header className="rounded-lg border p-4" style={{ borderColor: 'rgba(216, 155, 43, 0.2)', background: 'var(--surface-1)' }}>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-tertiary)' }}>
              Confirmar pedido
            </p>
            <h1 className="mt-1 text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>Checkout</h1>
          </header>
          <section className="rounded-lg border p-4" style={{ borderColor: 'rgba(216, 155, 43, 0.2)', background: 'var(--surface-1)' }}>
            <p className="text-sm leading-5" style={{ color: 'var(--text-secondary)' }}>
              Tu carrito está vacío. Agrega productos antes de continuar.
            </p>
            <div className="mt-4">
              <Link
                href="/order"
                className="inline-flex w-full items-center justify-center rounded-md px-4 py-3 text-sm font-bold transition active:scale-[0.99]"
                style={{ background: 'var(--gold)', color: 'var(--text-primary)' }}
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
      <main className="desktop-nav-offset min-h-dvh px-4 pb-32 pt-5" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          <header className="rounded-lg border p-4" style={{ borderColor: 'rgba(216, 155, 43, 0.2)', background: 'var(--surface-1)' }}>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-tertiary)' }}>
              Pedido enviado
            </p>
            <h1 className="mt-1 text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>Confirmado</h1>
          </header>
          <section className="rounded-lg border p-4" style={{ borderColor: 'rgba(216, 155, 43, 0.2)', background: 'var(--surface-1)' }}>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-tertiary)' }}>
              Número de pedido
            </p>
            <p className="mt-2 text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{confirmedOrderNumber}</p>
            <p className="mt-2 text-sm leading-5" style={{ color: 'var(--text-secondary)' }}>
              Tu pedido fue recibido. En breve nos comunicamos contigo para confirmar los detalles.
            </p>
            <div className="mt-5">
              <button
                type="button"
                onClick={() => router.push('/order')}
                className="inline-flex w-full items-center justify-center rounded-md px-4 py-3 text-sm font-bold transition active:scale-[0.99]"
                style={{ background: 'var(--gold)', color: 'var(--text-primary)' }}
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
    <main className="desktop-nav-offset min-h-dvh px-4 pb-32 pt-5" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <header className="rounded-lg border p-4" style={{ borderColor: 'rgba(216, 155, 43, 0.2)', background: 'var(--surface-1)' }}>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-tertiary)' }}>
            Confirmar pedido
          </p>
          <h1 className="mt-1 text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>Checkout</h1>
          <p className="mt-2 text-sm leading-5" style={{ color: 'var(--text-secondary)' }}>
            Revisa tu pedido y confirma tus datos para enviarlo.
          </p>
        </header>

        {cartErrors.length > 0 ? (
          <section className="rounded-lg border p-4" style={{ borderColor: 'rgba(216, 155, 43, 0.2)', background: 'var(--surface-1)' }}>
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

        <section className="rounded-lg border p-4" style={{ borderColor: 'rgba(216, 155, 43, 0.2)', background: 'var(--surface-1)' }}>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-tertiary)' }}>
            Resumen del pedido
          </p>
          <ul className="mt-3 space-y-2">
            {cart.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <span>
                  {item.name}
                  <span className="ml-1" style={{ opacity: 0.6 }}>×{item.quantity}</span>
                </span>
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {moneyFormat(item.base_price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1 pt-3" style={{ borderTop: '1px solid rgba(216, 155, 43, 0.2)' }}>
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
        </section>

        <section className="rounded-lg border p-4" style={{ borderColor: 'rgba(216, 155, 43, 0.2)', background: 'var(--surface-1)' }}>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-tertiary)' }}>
            Datos del cliente
          </p>
          <form onSubmit={handleSubmit} className="mt-3 space-y-3">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Nombre</span>
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
              <span className="mb-1 block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Teléfono</span>
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

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Quién recibe</span>
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
                <span className="mb-1 block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Dirección</span>
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

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Día de entrega</span>
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
                <span className="mb-1 block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Hora de entrega</span>
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
              <span className="mb-1 block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Notas especiales</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Instrucciones adicionales..."
                className="min-h-[60px] w-full rounded-md border p-4 text-sm outline-none transition"
                style={{
                  borderColor: 'rgba(216, 155, 43, 0.2)',
                  background: 'var(--surface-2)',
                  color: 'var(--text-primary)',
                }}
              />
            </label>

            <div className="space-y-2">
              <span className="block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Método de pago</span>
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
            <button
              type="submit"
              disabled={loading || !valid}
              className="inline-flex w-full items-center justify-center rounded-md px-4 py-3 text-sm font-bold transition active:scale-[0.99] disabled:opacity-60"
              style={{ background: 'var(--gold)', color: 'var(--text-primary)' }}
            >
              {loading ? 'Enviando pedido...' : 'Confirmar pedido'}
            </button>
          </form>
        </section>

        <div className="pb-4">
          <Link
            href="/cart"
            className="inline-flex w-full items-center justify-center rounded-md border px-4 py-3 text-sm font-semibold transition active:scale-[0.99]"
            style={{ borderColor: 'rgba(216, 155, 43, 0.2)', background: 'var(--surface-2)', color: 'var(--text-primary)' }}
          >
            Volver al carrito
          </Link>
        </div>
      </div>
    </main>
  )
}
