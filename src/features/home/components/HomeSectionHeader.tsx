import Link from 'next/link'

export function HomeSectionHeader() {
  return (
    <div className="flex items-end justify-between gap-4 px-5 mb-5 anim-up d2">
      <h2
        style={{
          fontFamily: 'var(--font-cormorant)',
          fontWeight: 600,
          fontSize: '22px',
          lineHeight: 1.1,
          color: '#F0E4CC',
        }}
      >
        Nuestros productos
      </h2>
      <Link
        href="/explorar"
        className="inline-flex items-center rounded-full border border-[#E8A420]/18 bg-[#181209] px-3 py-2 text-xs font-semibold text-[#E8A420] transition active:scale-95"
        style={{ fontFamily: 'var(--font-dm-sans)' }}
      >
        Ver todos
        <span aria-hidden="true" className="ml-1.5">
          →
        </span>
      </Link>
    </div>
  )
}
