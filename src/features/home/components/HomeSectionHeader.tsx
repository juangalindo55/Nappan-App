import Link from 'next/link'

export function HomeSectionHeader() {
  return (
    <div className="mx-auto mb-6 flex w-full max-w-6xl items-end justify-between gap-4 px-5 sm:px-8 lg:px-10 anim-up d2">
      <div>
        <p
          className="mb-2 text-xs font-extrabold uppercase tracking-[0.22em]"
          style={{ color: '#A87325', fontFamily: 'var(--font-dm-sans)' }}
        >
          Escoge tu camino
        </p>
        <h2
          className="text-4xl leading-none tracking-[-0.04em] sm:text-5xl"
          style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontWeight: 500, color: '#2A1710' }}
        >
          Nuestros productos
        </h2>
      </div>
      <Link
        href="/explorar"
        className="hidden rounded-full border px-4 py-2.5 text-xs font-extrabold transition active:scale-95 sm:inline-flex"
        style={{ fontFamily: 'var(--font-dm-sans)', background: 'rgba(255,252,245,0.78)', borderColor: 'rgba(88,55,34,0.16)', color: '#2A1710' }}
      >
        Ver todos →
      </Link>
    </div>
  )
}
