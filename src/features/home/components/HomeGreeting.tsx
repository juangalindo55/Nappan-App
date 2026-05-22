import Link from 'next/link'

type HomeGreetingProps = {
  greeting: string
}

export function HomeGreeting({ greeting }: HomeGreetingProps) {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 pb-8 pt-2 sm:px-8 md:pb-10 lg:px-10 anim-up d1">
      <div className="max-w-3xl">
        {greeting ? (
          <p
            className="mb-3 text-xs font-extrabold uppercase tracking-[0.22em]"
            style={{ color: '#A87325', fontFamily: 'var(--font-dm-sans)' }}
          >
            {greeting} · Pancakes & Art Studio
          </p>
        ) : null}
        <h1
          className="max-w-3xl text-[clamp(3.25rem,9vw,6.8rem)] leading-[0.88] tracking-[-0.065em]"
          style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontWeight: 500, color: '#2A1710' }}
        >
          Antojo bonito, pedido claro.
        </h1>
        <p
          className="mt-6 max-w-xl text-base leading-8 sm:text-lg"
          style={{ color: '#765E4B', fontFamily: 'var(--font-dm-sans)' }}
        >
          Cajas personalizadas, lunch boxes, barras fit y pancake art para eventos. Elige la ocasión y te llevamos directo al pedido correcto.
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
            href="/explorar"
            className="inline-flex items-center justify-center rounded-full border px-6 py-3.5 text-sm font-extrabold shadow-[0_12px_30px_rgba(62,35,19,0.08)] transition active:scale-95 md:hover:-translate-y-0.5"
            style={{ fontFamily: 'var(--font-dm-sans)', background: 'rgba(255,252,245,0.78)', borderColor: 'rgba(88,55,34,0.18)', color: '#2A1710' }}
          >
            Explorar productos
          </Link>
        </div>
      </div>
    </section>
  )
}
