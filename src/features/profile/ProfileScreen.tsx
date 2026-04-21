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
    <span className="rounded-full border border-[#E8A420]/14 bg-[#100B07] px-3 py-1 text-xs font-semibold text-[#FFE3A0]">
      {label}
    </span>
  )
}

function EmptyOrders() {
  return (
    <div className="rounded-lg border border-[#E8A420]/10 bg-[#100B07] px-4 py-4 text-sm leading-5 text-[#F0E4CC]/62">
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
          className="rounded-lg border border-[#E8A420]/10 bg-[#100B07] px-4 py-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#FFF6E5]">
                {order.order_number ?? "Pedido"}
              </p>
              <p className="mt-1 text-xs text-[#F0E4CC]/55">
                {dateFormat(order.created_at)}
              </p>
            </div>
            <ProfilePill label={orderStatusLabel(order.status)} />
          </div>

          <p className="mt-3 text-sm text-[#F0E4CC]/70">
            Total: <span className="font-semibold text-[#FFF6E5]">{moneyFormat(order.total)}</span>
          </p>
        </article>
      ))}
    </div>
  )
}

export default function ProfileScreen() {
  const [phone, setPhone] = useState("")
  const [draftName, setDraftName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [lookupDone, setLookupDone] = useState(false)
  const [foundExisting, setFoundExisting] = useState<boolean | null>(null)
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [orders, setOrders] = useState<CustomerOrder[]>([])

  const adminPhones = (process.env.NEXT_PUBLIC_ADMIN_PHONES || "").split(",").map(p => p.trim()).filter(Boolean)
  const isAdmin = profile?.phone && adminPhones.includes(profile.phone)

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
      <main className="min-h-screen bg-[#0C0806] px-4 pb-28 pt-5 text-[#F0E4CC]">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          <header className="rounded-lg border border-[#E8A420]/10 bg-[#181209] p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7A6A55]">
              Cuenta del cliente
            </p>
            <h1 className="mt-1 text-3xl font-semibold text-[#FFF6E5]">
              Perfil
            </h1>
            <p className="mt-2 text-sm leading-5 text-[#F0E4CC]/62">
              Ingresa tu número para que la app reconozca tu perfil, muestre tus pedidos y aplique tus beneficios. Si no existe, te pediremos un nombre mínimo para crearlo.
            </p>
          </header>

          <section className="rounded-lg border border-[#E8A420]/10 bg-[#181209] p-4">
            <form onSubmit={handleLookup} className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-[#F0E4CC]/60">
                  Teléfono
                </span>
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  inputMode="numeric"
                  placeholder="8112345678"
                  className="h-11 w-full rounded-md border border-[#E8A420]/14 bg-[#100B07] px-4 text-sm text-[#FFF6E5] outline-none transition placeholder:text-[#F0E4CC]/35 focus:border-[#E8A420]/60"
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-md bg-[#E8A420] px-4 py-3 text-sm font-bold text-[#0C0806] transition active:scale-[0.99] disabled:opacity-60"
              >
                {loading ? "Buscando perfil..." : "Buscar cliente"}
              </button>
            </form>

            <p className="mt-3 text-xs leading-5 text-[#F0E4CC]/50">
              El perfil se administra manualmente desde el dashboard. Aquí solo verificamos el teléfono y, si no existe, creamos el perfil mínimo para continuar.
            </p>

            {error ? (
              <p className="mt-3 rounded-md border border-red-400/25 bg-red-500/10 px-3 py-2 text-sm leading-5 text-red-100">
                {error}
              </p>
            ) : null}
          </section>

          {lookupDone && profile === null ? (
            <section className="rounded-lg border border-[#E8A420]/10 bg-[#181209] p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7A6A55]">
                Cliente nuevo
              </p>
              <p className="mt-1 text-lg font-semibold text-[#FFF6E5]">
                No encontramos ese teléfono
              </p>
              <p className="mt-2 text-sm leading-5 text-[#F0E4CC]/58">
                Crea el perfil mínimo para continuar. Después tú puedes ajustar el tier y los beneficios desde el dashboard administrativo.
              </p>

              <form onSubmit={handleCreateProfile} className="mt-4 space-y-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-[#F0E4CC]/60">
                    Nombre
                  </span>
                  <input
                    value={draftName}
                    onChange={(event) => setDraftName(event.target.value)}
                    placeholder="Nombre para el pedido"
                    className="h-11 w-full rounded-md border border-[#E8A420]/14 bg-[#100B07] px-4 text-sm text-[#FFF6E5] outline-none transition placeholder:text-[#F0E4CC]/35 focus:border-[#E8A420]/60"
                  />
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center rounded-md bg-[#E8A420] px-4 py-3 text-sm font-bold text-[#0C0806] transition active:scale-[0.99] disabled:opacity-60"
                >
                  {loading ? "Creando perfil..." : "Crear perfil y continuar"}
                </button>
              </form>
            </section>
          ) : null}

          {profile ? (
            <>
              <section className="rounded-lg border border-[#E8A420]/10 bg-[#181209] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7A6A55]">
                      {foundExisting ? "Cliente reconocido" : "Perfil creado"}
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold text-[#FFF6E5]">
                      {profile.name}
                    </h2>
                    <p className="mt-1 text-sm text-[#F0E4CC]/58">
                      {profile.phone}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-md border border-[#E8A420]/14 bg-[#100B07] px-3 py-2 text-xs font-semibold text-[#FFF6E5] transition active:scale-[0.99]"
                  >
                    Buscar otro número
                  </button>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-[#E8A420]/10 bg-[#100B07] p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7A6A55]">
                      Tier
                    </p>
                    <p className="mt-1 text-base font-semibold text-[#FFF6E5]">
                      {profile.tierName ?? "Sin tier asignado"}
                    </p>
                    <p className="mt-1 text-sm text-[#F0E4CC]/58">
                      {profile.tierSlug ?? "Se asigna desde Supabase"}
                    </p>
                  </div>

                  <div className="rounded-lg border border-[#E8A420]/10 bg-[#100B07] p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7A6A55]">
                      Beneficio
                    </p>
                    <p className="mt-1 text-base font-semibold text-[#FFF6E5]">
                      {discountLabel}
                    </p>
                    <p className="mt-1 text-sm text-[#F0E4CC]/58">
                      Se valida al revisar tu pedido.
                    </p>
                  </div>
                </div>
              </section>

              {profile.benefits.length > 0 ? (
                <section className="rounded-lg border border-[#E8A420]/10 bg-[#181209] p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7A6A55]">
                    Beneficios activos
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {profile.benefits.map((benefit) => (
                      <ProfilePill key={benefit} label={benefit} />
                    ))}
                  </div>
                </section>
              ) : null}

              <section className="rounded-lg border border-[#E8A420]/10 bg-[#181209] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7A6A55]">
                      Pedidos
                    </p>
                    <h3 className="mt-1 text-xl font-semibold text-[#FFF6E5]">
                      Historial reciente
                    </h3>
                  </div>

                  <Link
                    href="/cart"
                    className="rounded-md border border-[#E8A420]/14 bg-[#100B07] px-3 py-2 text-xs font-semibold text-[#FFF6E5] transition active:scale-[0.99]"
                  >
                    Ver carrito
                  </Link>
                </div>

                <div className="mt-4">
                  <OrdersList orders={orders} />
                </div>
              </section>

              {isAdmin ? (
                <section className="rounded-lg border border-[#E8A420]/10 bg-[#181209] p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7A6A55]">
                    Administración
                  </p>
                  <p className="mt-2 text-sm leading-5 text-[#F0E4CC]/62">
                    Accede al panel administrativo para gestionar productos, precios, configuración y estadísticas.
                  </p>
                  <Link
                    href="/admin"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-[#E8A420] px-4 py-3 text-sm font-bold text-[#0C0806] transition active:scale-[0.99]"
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
