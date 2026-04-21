'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { loadCustomerProfileSession } from '@/lib/customer-profile-session'

export default function LiveEventScreen() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [guestCount, setGuestCount] = useState('')
  const [eventDate, setEventDate] = useState('')

  useEffect(() => {
    const session = loadCustomerProfileSession()
    if (session) {
      if (session.name) setName(session.name)
      if (session.phone) setPhone(session.phone)
    }
  }, [])

  function handleWhatsAppInquiry() {
    const digitsOnly = phone.replace(/\D/g, '')
    const trimmedName = name.trim()

    if (!trimmedName || digitsOnly.length < 10 || !guestCount || !eventDate) {
      return
    }

    const message = `Hola, me gustaría cotizar un evento en vivo de pancake art. ${trimmedName}, ${digitsOnly}. Necesito para ${guestCount} personas el ${eventDate}.`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const isValid = name.trim() && phone.replace(/\D/g, '').length >= 10 && guestCount && eventDate

  return (
    <main className="min-h-dvh bg-[#0C0806] px-4 pb-32 pt-5 text-[#F0E4CC]">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <header className="rounded-lg border border-[#E8A420]/10 bg-[#181209] p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7A6A55]">
            Servicio especial
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-[#FFF6E5]">Evento en Vivo</h1>
          <p className="mt-2 text-sm leading-5 text-[#F0E4CC]/60">
            Estación de pancake art preparada en vivo para tus invitados. Cuéntanos detalles de tu evento.
          </p>
        </header>

        <section className="rounded-lg border border-[#E8A420]/10 bg-[#181209] p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7A6A55]">
            Detalles del evento
          </p>
          <div className="mt-4 space-y-3">
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

            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-[#F0E4CC]/60">Cantidad de invitados</span>
              <input
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
                type="number"
                inputMode="numeric"
                placeholder="50"
                className="h-11 w-full rounded-md border border-[#E8A420]/14 bg-[#100B07] px-4 text-sm text-[#FFF6E5] outline-none transition placeholder:text-[#F0E4CC]/35 focus:border-[#E8A420]/60"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-[#F0E4CC]/60">Fecha del evento</span>
              <input
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                type="date"
                className="h-11 w-full rounded-md border border-[#E8A420]/14 bg-[#100B07] px-4 text-sm text-[#FFF6E5] outline-none transition placeholder:text-[#F0E4CC]/35 focus:border-[#E8A420]/60"
              />
            </label>

            <button
              type="button"
              onClick={handleWhatsAppInquiry}
              disabled={!isValid}
              className="inline-flex w-full items-center justify-center rounded-md bg-[#E8A420] px-4 py-3 text-sm font-bold text-[#0C0806] transition active:scale-[0.99] disabled:opacity-60"
            >
              Cotizar por WhatsApp
            </button>
          </div>
        </section>

        <div className="pb-4">
          <Link
            href="/order"
            className="inline-flex w-full items-center justify-center rounded-md border border-[#E8A420]/14 bg-[#100B07] px-4 py-3 text-sm font-semibold text-[#FFF6E5] transition active:scale-[0.99]"
          >
            Volver a categorías
          </Link>
        </div>
      </div>
    </main>
  )
}
