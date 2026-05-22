'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useBookingStore } from '@/store/booking.store'
import { useUserStore } from '@/store/user.store'

export default function LiveEventScreen() {
  const profile = useUserStore((state) => state.profile)
  const liveEventDraft = useBookingStore((state) => state.liveEventDraft)
  const updateLiveEventDraft = useBookingStore((state) => state.updateLiveEventDraft)
  const { name, phone, guestCount, eventDate } = liveEventDraft

  useEffect(() => {
    if (!profile) return

    updateLiveEventDraft({
      name: name || profile.name,
      phone: phone || profile.phone,
    })
  }, [name, phone, profile, updateLiveEventDraft])

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
    <main className="min-h-dvh px-4 pb-32 pt-5 md:pt-[100px]" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <header className="rounded-lg border p-4" style={{ background: 'var(--surface-1)', borderColor: 'var(--border)' }}>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-secondary)' }}>
            Servicio especial
          </p>
          <h1 className="mt-1 text-3xl font-semibold">Evento en Vivo</h1>
          <p className="mt-2 text-sm leading-5" style={{ color: 'var(--text-secondary)' }}>
            Estación de pancake art preparada en vivo para tus invitados. Cuéntanos detalles de tu evento.
          </p>
        </header>

        <section className="rounded-lg border p-4" style={{ background: 'var(--surface-1)', borderColor: 'var(--border)' }}>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-secondary)' }}>
            Detalles del evento
          </p>
          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Nombre</span>
              <input
                value={name}
                onChange={(e) => updateLiveEventDraft({ name: e.target.value })}
                placeholder="Tu nombre"
                style={{
                  background: 'var(--surface-2)',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--gold-light)',
                }}
                className="h-11 w-full rounded-md border px-4 text-sm outline-none transition placeholder:opacity-50 focus:border-[var(--gold)]"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Teléfono</span>
              <input
                value={phone}
                onChange={(e) => updateLiveEventDraft({ phone: e.target.value })}
                inputMode="numeric"
                placeholder="8112345678"
                style={{
                  background: 'var(--surface-2)',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--gold-light)',
                }}
                className="h-11 w-full rounded-md border px-4 text-sm outline-none transition placeholder:opacity-50 focus:border-[var(--gold)]"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Cantidad de invitados</span>
              <input
                value={guestCount}
                onChange={(e) => updateLiveEventDraft({ guestCount: e.target.value })}
                type="number"
                inputMode="numeric"
                placeholder="50"
                style={{
                  background: 'var(--surface-2)',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--gold-light)',
                }}
                className="h-11 w-full rounded-md border px-4 text-sm outline-none transition placeholder:opacity-50 focus:border-[var(--gold)]"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Fecha del evento</span>
              <input
                value={eventDate}
                onChange={(e) => updateLiveEventDraft({ eventDate: e.target.value })}
                type="date"
                style={{
                  background: 'var(--surface-2)',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--gold-light)',
                }}
                className="h-11 w-full rounded-md border px-4 text-sm outline-none transition placeholder:opacity-50 focus:border-[var(--gold)]"
              />
            </label>

            <button
              type="button"
              onClick={handleWhatsAppInquiry}
              disabled={!isValid}
              style={{ background: 'var(--gold)', color: 'var(--bg-primary)' }}
              className="inline-flex w-full items-center justify-center rounded-md px-4 py-3 text-sm font-bold transition active:scale-[0.99] disabled:opacity-60"
            >
              Cotizar por WhatsApp
            </button>
          </div>
        </section>

        <div className="pb-4">
          <Link
            href="/order"
            className="inline-flex w-full items-center justify-center rounded-md border px-4 py-3 text-sm font-semibold transition active:scale-[0.99]"
            style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            Volver a categorías
          </Link>
        </div>
      </div>
    </main>
  )
}
