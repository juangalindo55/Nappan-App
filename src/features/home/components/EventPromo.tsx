import Image from 'next/image'
import Link from 'next/link'

export function EventPromo() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 pb-10 pt-8 sm:px-8 md:pb-14 lg:px-10 anim-up d4">
      <div
        className="relative overflow-hidden rounded-[2rem]"
        style={{
          background: 'linear-gradient(135deg, #2A1710 0%, #5B3924 100%)',
          border: '1px solid rgba(88,55,34,0.16)',
          boxShadow: '0 28px 70px rgba(62,35,19,0.18)',
        }}
      >
        <div className="grid md:grid-cols-[minmax(0,1fr)_360px]">
          <div className="relative z-10 max-w-2xl p-6 sm:p-8 md:p-10">
            <p
              className="mb-4 text-xs font-extrabold uppercase tracking-[0.22em]"
              style={{ color: '#F3C766', fontFamily: 'var(--font-dm-sans)' }}
            >
              Live Pancake Art
            </p>
            <h2
              className="max-w-xl text-4xl leading-[0.95] tracking-[-0.04em] text-[#FFF8EA] sm:text-5xl"
              style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontWeight: 500 }}
            >
              Catering con alma para tus momentos especiales
            </h2>
            <p
              className="mt-5 max-w-lg text-sm leading-7 sm:text-base"
              style={{ color: 'rgba(255,248,234,0.74)', fontFamily: 'var(--font-dm-sans)' }}
            >
              Transformamos tu evento en una experiencia en vivo: una estación de pancake art para bodas,
              lanzamientos, cumpleaños y celebraciones de marca.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 max-w-xl text-sm text-[#FFF8EA]" style={{ fontFamily: 'var(--font-dm-sans)' }}>
              {['Eventos Corporativos', 'Bodas & Brunch', 'Cumpleaños Temáticos', 'Activaciones de Marca'].map((item) => (
                <div
                  key={item}
                  className="rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-3"
                >
                  {item}
                </div>
              ))}
            </div>

            <Link
              href="/order/live-event"
              className="mt-7 inline-flex items-center rounded-full px-5 py-3 text-sm font-extrabold transition active:scale-95 md:hover:-translate-y-0.5"
              style={{ background: '#FFF8EA', color: '#2A1710', fontFamily: 'var(--font-dm-sans)' }}
            >
              Solicitar presupuesto para evento →
            </Link>
          </div>

          <div className="relative min-h-[230px] overflow-hidden md:min-h-full" style={{ background: '#3D2418' }}>
            <Image
              src="/images/nappan/stand.webp"
              alt="Estación de pancake art de Nappan en un evento"
              fill
              sizes="(min-width: 768px) 360px, 100vw"
              className="object-cover"
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: 'linear-gradient(90deg, rgba(42,23,16,0.16) 0%, rgba(42,23,16,0) 52%), linear-gradient(180deg, rgba(42,23,16,0) 48%, rgba(42,23,16,0.35) 100%)' }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
