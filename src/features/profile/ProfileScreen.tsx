"use client"

import Link from "next/link"
import { useState, type FormEvent } from "react"
import BottomNav from "@/components/BottomNav"
import {
  createBasicCustomerProfile,
  lookupCustomerProfile,
  type CustomerOrder,
  type CustomerProfile,
} from "@/services/customer.service"
import {
  clearCustomerProfileSession,
  loadCustomerProfileSession,
  saveCustomerProfileSession,
} from "@/lib/customer-profile-session"

function getFriendlyErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim() !== "") {
    return error.message
  }

  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === "string" && message.trim() !== "") {
      return message
    }
  }

  return fallback
}

function moneyFormat(value: number | null) {
  if (value === null) return "—"
  return `$${value.toLocaleString("es-MX")}`
}

function dateFormat(value: string | null) {
  if (!value) return "Fecha no disponible"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
  }).format(date)
}

function orderStatusLabel(status: string | null) {
  if (!status) return "Pendiente"

  const normalized = status.toLowerCase()

  if (normalized.includes("cancel")) return "Cancelado"
  if (normalized.includes("complete") || normalized.includes("entreg")) return "Completado"
  if (normalized.includes("process")) return "En proceso"
  return status
}

function ProfilePill({ label }: { label: string }) {
  return (
    <span className="rounded-full border px-3 py-1 text-xs font-semibold" style={{ borderColor: 'rgba(216, 155, 43, 0.2)', background: 'var(--surface-2)', color: 'var(--gold)' }}>
      {label}
    </span>
  )
}

function EmptyOrders() {
  return (
    <div className="rounded-lg border px-4 py-4 text-sm leading-5" style={{ borderColor: 'rgba(216, 155, 43, 0.2)', background: 'var(--surface-1)', color: 'var(--text-secondary)' }}>
      Aún no hay pedidos registrados para este número.
    </div>
  )
}

function OrdersList({ orders }: { orders: CustomerOrder[] }) {
  if (orders.length === 0) {
    return <EmptyOrders />
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <article
          key={`${order.order_number ?? "pedido"}-${order.created_at ?? "fecha"}`}
          className="rounded-lg border px-4 py-4"
          style={{ borderColor: 'rgba(216, 155, 43, 0.2)', background: 'var(--surface-1)' }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {order.order_number ?? "Pedido"}
              </p>
              <p className="mt-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {dateFormat(order.created_at)}
              </p>
            </div>
            <ProfilePill label={orderStatusLabel(order.status)} />
          </div>

          <p className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Total: <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{moneyFormat(order.total)}</span>
          </p>
        </article>
      ))}
    </div>
  )
}

function getInitialCustomerProfile(): CustomerProfile | null {
  const storedProfile = loadCustomerProfileSession()

  if (!storedProfile) return null

  return {
    id: null,
    name: storedProfile.name,
    phone: storedProfile.phone,
    tierName: storedProfile.tierName,
    tierSlug: storedProfile.tierSlug,
    discountPercent: storedProfile.discountPercent,
    benefits: [],
  }
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<CustomerProfile | null>(() => getInitialCustomerProfile())
  const [phone, setPhone] = useState(() => profile?.phone ?? "")
  const [draftName, setDraftName] = useState(() => profile?.name ?? "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [lookupDone, setLookupDone] = useState(false)
  const [foundExisting, setFoundExisting] = useState<boolean | null>(null)
  const [orders, setOrders] = useState<CustomerOrder[]>([])

  const adminPhones = (process.env.NEXT_PUBLIC_ADMIN_PHONES || "")
    .split(",")
    .map(p => p.trim().replace(/\D/g, ""))
    .filter(Boolean)
  const isAdmin = profile?.phone && adminPhones.includes(profile.phone.replace(/\D/g, ""))


  async function handleLookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const digitsOnly = phone.replace(/\D/g, '')
    if (digitsOnly.length < 10) {
      setError("Ingresa un número de teléfono válido (mínimo 10 dígitos).")
      return
    }

    setLoading(true)
    setError("")
    setLookupDone(false)
    setProfile(null)
    setOrders([])
    setFoundExisting(null)

    try {
      const result = await lookupCustomerProfile(phone)

      if (!result) {
        setLookupDone(true)
        return
      }

      setProfile(result.profile)
      setOrders(result.orders)
      setFoundExisting(result.foundExisting)
      setPhone(result.profile.phone)
      setDraftName(result.profile.name)
      saveCustomerProfileSession({
        name: result.profile.name,
        phone: result.profile.phone,
        tierName: result.profile.tierName,
        tierSlug: result.profile.tierSlug,
        discountPercent: result.profile.discountPercent,
      })
      setLookupDone(true)
    } catch (submitError) {
      setError(getFriendlyErrorMessage(submitError, "No pudimos leer el perfil. Intenta otra vez."))
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const digitsOnly = phone.replace(/\D/g, '')
    if (digitsOnly.length < 10) {
      setError("Ingresa un número de teléfono válido (mínimo 10 dígitos).")
      return
    }

    if (!draftName.trim()) {
      setError("Ingresa tu nombre para continuar.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const result = await createBasicCustomerProfile({
        phone,
        name: draftName,
      })

      setProfile(result.profile)
      setOrders(result.orders)
      setFoundExisting(result.foundExisting)
      setPhone(result.profile.phone)
      setDraftName(result.profile.name)
      saveCustomerProfileSession({
        name: result.profile.name,
        phone: result.profile.phone,
        tierName: result.profile.tierName,
        tierSlug: result.profile.tierSlug,
        discountPercent: result.profile.discountPercent,
      })
      setLookupDone(true)
    } catch (submitError) {
      setError(getFriendlyErrorMessage(submitError, "No pudimos crear el perfil. Intenta otra vez."))
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    clearCustomerProfileSession()
    setPhone("")
    setDraftName("")
    setProfile(null)
    setOrders([])
    setError("")
    setFoundExisting(null)
    setLookupDone(false)
  }

  const discountLabel =
    profile?.discountPercent !== null && profile?.discountPercent !== undefined
      ? `${profile.discountPercent}% de descuento`
      : "Sin descuento asignado"

  return (
    <>
      <main className="min-h-screen px-4 pb-28 pt-5" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          <header className="rounded-lg border p-4" style={{ borderColor: 'rgba(216, 155, 43, 0.2)', background: 'var(--surface-1)' }}>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-tertiary)' }}>
              Cuenta del cliente
            </p>
            <h1 className="mt-1 text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Perfil
            </h1>
            <p className="mt-2 text-sm leading-5" style={{ color: 'var(--text-secondary)' }}>
              Ingresa tu número para que la app reconozca tu perfil, muestre tus pedidos y aplique tus beneficios. Si no existe, te pediremos un nombre mínimo para crearlo.
            </p>
          </header>

          <section className="rounded-lg border p-4" style={{ borderColor: 'rgba(216, 155, 43, 0.2)', background: 'var(--surface-1)' }}>
            <form onSubmit={handleLookup} className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  Teléfono
                </span>
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  inputMode="numeric"
                  placeholder="8112345678"
                  className="h-11 w-full rounded-md border px-4 text-sm outline-none transition"
                  style={{ borderColor: 'rgba(216, 155, 43, 0.2)', background: 'var(--surface-2)', color: 'var(--text-primary)' }}
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-md px-4 py-3 text-sm font-bold transition active:scale-[0.99] disabled:opacity-60"
                style={{ background: 'var(--gold)', color: 'var(--text-primary)' }}
              >
                {loading ? "Buscando perfil..." : "Buscar cliente"}
              </button>
            </form>

            <p className="mt-3 text-xs leading-5" style={{ color: 'var(--text-tertiary)' }}>
              El perfil se administra manualmente desde el dashboard. Aquí solo verificamos el teléfono y, si no existe, creamos el perfil mínimo para continuar.
            </p>

            {error ? (
              <p className="mt-3 rounded-md border border-red-400/25 bg-red-500/10 px-3 py-2 text-sm leading-5 text-red-700">
                {error}
              </p>
            ) : null}
          </section>

          {lookupDone && profile === null ? (
            <section className="rounded-lg border p-4" style={{ borderColor: 'rgba(216, 155, 43, 0.2)', background: 'var(--surface-1)' }}>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-tertiary)' }}>
                Cliente nuevo
              </p>
              <p className="mt-1 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                No encontramos ese teléfono
              </p>
              <p className="mt-2 text-sm leading-5" style={{ color: 'var(--text-secondary)' }}>
                Crea el perfil mínimo para continuar. Después tú puedes ajustar el tier y los beneficios desde el dashboard administrativo.
              </p>

              <form onSubmit={handleCreateProfile} className="mt-4 space-y-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    Nombre
                  </span>
                  <input
                    value={draftName}
                    onChange={(event) => setDraftName(event.target.value)}
                    placeholder="Nombre para el pedido"
                    className="h-11 w-full rounded-md border px-4 text-sm outline-none transition"
                    style={{ borderColor: 'rgba(216, 155, 43, 0.2)', background: 'var(--surface-2)', color: 'var(--text-primary)' }}
                  />
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center rounded-md px-4 py-3 text-sm font-bold transition active:scale-[0.99] disabled:opacity-60"
                  style={{ background: 'var(--gold)', color: 'var(--text-primary)' }}
                >
                  {loading ? "Creando perfil..." : "Crear perfil y continuar"}
                </button>
              </form>
            </section>
          ) : null}

          {profile ? (
            <>
              <section className="rounded-lg border p-4" style={{ borderColor: 'rgba(216, 155, 43, 0.2)', background: 'var(--surface-1)' }}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-tertiary)' }}>
                      {foundExisting ? "Cliente reconocido" : "Perfil creado"}
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {profile.name}
                    </h2>
                    <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {profile.phone}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-md border px-3 py-2 text-xs font-semibold transition active:scale-[0.99]"
                    style={{ borderColor: 'rgba(216, 155, 43, 0.2)', background: 'var(--surface-2)', color: 'var(--text-primary)' }}
                  >
                    Buscar otro número
                  </button>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border p-4" style={{ borderColor: 'rgba(216, 155, 43, 0.2)', background: 'var(--surface-2)' }}>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-tertiary)' }}>
                      Tier
                    </p>
                    <p className="mt-1 text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {profile.tierName ?? "Sin tier asignado"}
                    </p>
                    <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {profile.tierSlug ?? "Se asigna desde Supabase"}
                    </p>
                  </div>

                  <div className="rounded-lg border p-4" style={{ borderColor: 'rgba(216, 155, 43, 0.2)', background: 'var(--surface-2)' }}>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-tertiary)' }}>
                      Beneficio
                    </p>
                    <p className="mt-1 text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {discountLabel}
                    </p>
                    <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Se valida al revisar tu pedido.
                    </p>
                  </div>
                </div>
              </section>

              {profile.benefits.length > 0 ? (
                <section className="rounded-lg border p-4" style={{ borderColor: 'rgba(216, 155, 43, 0.2)', background: 'var(--surface-1)' }}>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-tertiary)' }}>
                    Beneficios activos
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {profile.benefits.map((benefit) => (
                      <ProfilePill key={benefit} label={benefit} />
                    ))}
                  </div>
                </section>
              ) : null}

              <section className="rounded-lg border p-4" style={{ borderColor: 'rgba(216, 155, 43, 0.2)', background: 'var(--surface-1)' }}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-tertiary)' }}>
                      Pedidos
                    </p>
                    <h3 className="mt-1 text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Historial reciente
                    </h3>
                  </div>

                  <Link
                    href="/cart"
                    className="rounded-md border px-3 py-2 text-xs font-semibold transition active:scale-[0.99]"
                    style={{ borderColor: 'rgba(216, 155, 43, 0.2)', background: 'var(--surface-2)', color: 'var(--text-primary)' }}
                  >
                    Ver carrito
                  </Link>
                </div>

                <div className="mt-4">
                  <OrdersList orders={orders} />
                </div>
              </section>

              {isAdmin ? (
                <section className="rounded-lg border p-4" style={{ borderColor: 'rgba(216, 155, 43, 0.2)', background: 'var(--surface-1)' }}>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-tertiary)' }}>
                    Administración
                  </p>
                  <p className="mt-2 text-sm leading-5" style={{ color: 'var(--text-secondary)' }}>
                    Accede al panel administrativo para gestionar productos, precios, configuración y estadísticas.
                  </p>
                  <Link
                    href="/admin"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex w-full items-center justify-center rounded-md px-4 py-3 text-sm font-bold transition active:scale-[0.99]"
                    style={{ background: 'var(--gold)', color: 'var(--text-primary)' }}
                  >
                    Ir al panel
                  </Link>
                </section>
              ) : null}
            </>
          ) : null}
        </div>
      </main>
      <BottomNav />
    </>
  )
}
