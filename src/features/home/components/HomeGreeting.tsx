import Image from 'next/image'
import Link from 'next/link'

type HomeGreetingProps = {
  greeting: string
}

export function HomeGreeting({ greeting }: HomeGreetingProps) {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 pb-10 pt-2 sm:px-8 md:pb-14 lg:px-10 anim-up d1">
      <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
        <div className="max-w-3xl">
          {greeting ? (
            <p
              className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.24em]"
              style={{ color: '#A87325', fontFamily: 'var(--font-dm-sans)' }}
            >
              {greeting} · Pancakes & Art Studio
            </p>
          ) : null}

          <h1
            className="max-w-3xl text-[clamp(3.35rem,8.8vw,6.85rem)] leading-[0.9] tracking-[-0.07em]"
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontStyle: 'italic',
              fontWeight: 500,
              color: '#2A1710',
            }}
          >
            Arte comestible, listo para disfrutar.
          </h1>

          <p
            className="mt-5 max-w-xl text-base leading-8 sm:text-lg"
            style={{ color: '#765E4B', fontFamily: 'var(--font-dm-sans)' }}
          >
            Pancake art artesanal para regalos inolvidables, brunchs que se recuerdan y eventos con alma.
            Llevamos la textura, el color y el detalle de Nappan directo a tu mesa.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/order"
              className="inline-flex items-center justify-center rounded-full px-6 py-3.5 text-sm font-extrabold shadow-[0_20px_42px_rgba(62,35,19,0.18)] transition active:scale-95 md:hover:-translate-y-0.5"
              style={{ fontFamily: 'var(--font-dm-sans)', background: '#2A1710', color: '#FFF8EA' }}
            >
              Armar pedido
            </Link>
            <Link
              href="/order/live-event"
              className="inline-flex items-center justify-center rounded-full border px-6 py-3.5 text-sm font-extrabold shadow-[0_12px_30px_rgba(62,35,19,0.08)] transition active:scale-95 md:hover:-translate-y-0.5"
              style={{
                fontFamily: 'var(--font-dm-sans)',
                background: 'rgba(255,252,245,0.78)',
                borderColor: 'rgba(88,55,34,0.18)',
                color: '#2A1710',
              }}
            >
              Cotizar evento
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {[
              'Hecho a mano',
              'Pedidos para eventos',
              'Regalos personalizados',
            ].map((item) => (
              <span
                key={item}
                className="rounded-full px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.16em]"
                style={{
                  background: 'rgba(247, 238, 220, 0.8)',
                  color: '#765E4B',
                  border: '1px solid rgba(88,55,34,0.10)',
                  fontFamily: 'var(--font-dm-sans)',
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="relative">
          <div
            className="absolute -right-4 top-6 hidden h-24 w-24 rounded-full blur-3xl lg:block"
            style={{ background: 'rgba(216,155,43,0.18)' }}
          />
          <div
            className="relative overflow-hidden rounded-[2rem] border"
            style={{
              minHeight: '420px',
              background: 'linear-gradient(135deg, rgba(255,252,245,0.98) 0%, rgba(247,238,220,0.9) 100%)',
              borderColor: 'rgba(88,55,34,0.12)',
              boxShadow: '0 28px 70px rgba(62,35,19,0.12)',
            }}
          >
            <Image
              src="/images/nappan/hero-banner.webp"
              alt="Mesa de ingredientes para pancake art Nappan"
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, rgba(42,23,16,0.05) 0%, rgba(42,23,16,0.18) 100%), linear-gradient(90deg, rgba(255,252,245,0.12) 0%, rgba(255,252,245,0) 45%)',
              }}
            />

            <div className="absolute left-4 top-4 rounded-full border border-white/30 bg-[#FFF8EA]/88 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#2A1710] shadow-[0_16px_28px_rgba(62,35,19,0.08)] backdrop-blur-sm">
              Nappan Studio
            </div>

            <div className="absolute bottom-4 left-4 right-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.35rem] border border-white/30 bg-white/70 px-4 py-3 shadow-[0_16px_30px_rgba(62,35,19,0.08)] backdrop-blur-sm">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#A87325]" style={{ fontFamily: 'var(--font-dm-sans)' }}>
                  100% artesanal
                </p>
                <p className="mt-1 text-sm leading-6 text-[#2A1710]" style={{ fontFamily: 'var(--font-dm-sans)' }}>
                  Hecho al momento, con detalle premium y presentación lista para regalar.
                </p>
              </div>

              <div className="rounded-[1.35rem] border border-white/30 bg-[#2A1710]/88 px-4 py-3 text-[#FFF8EA] shadow-[0_16px_30px_rgba(62,35,19,0.10)] backdrop-blur-sm">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#F3C766]" style={{ fontFamily: 'var(--font-dm-sans)' }}>
                  Entrega local
                </p>
                <p className="mt-1 text-sm leading-6" style={{ fontFamily: 'var(--font-dm-sans)' }}>
                  Diseñado para Monterrey y pedidos que necesitan verse tan bien como saben.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
