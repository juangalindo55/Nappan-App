import Link from 'next/link'

export default function Footer() {
  return (
    <footer
      className="mt-8 border-t"
      style={{
        background: 'linear-gradient(180deg, rgba(255,252,245,0.45) 0%, rgba(247,238,220,0.92) 100%)',
        borderColor: 'rgba(88,55,34,0.12)',
      }}
    >
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 lg:px-10">
        <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.24em]" style={{ color: '#A87325', fontFamily: 'var(--font-dm-sans)' }}>
              Nappan
            </p>
            <h3
              className="mt-2 text-4xl leading-none tracking-[-0.04em]"
              style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontWeight: 500, color: '#2A1710' }}
            >
              Pancakes & Art Studio
            </h3>
            <p className="mt-4 max-w-md text-sm leading-7" style={{ color: '#765E4B', fontFamily: 'var(--font-dm-sans)' }}>
              Creamos pancake art premium para regalos, brunchs, mesas de celebración y experiencias en vivo que se recuerdan.
            </p>
          </div>

          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.24em]" style={{ color: '#A87325', fontFamily: 'var(--font-dm-sans)' }}>
              Explorar
            </p>
            <ul className="mt-4 space-y-3 text-sm" style={{ fontFamily: 'var(--font-dm-sans)' }}>
              <li><Link href="/products/lunchbox" className="transition md:hover:text-[#A87325]" style={{ color: '#2A1710' }}>Lunch Box</Link></li>
              <li><Link href="/products/fitbar" className="transition md:hover:text-[#A87325]" style={{ color: '#2A1710' }}>Protein Fit Bar</Link></li>
              <li><Link href="/products/eventos" className="transition md:hover:text-[#A87325]" style={{ color: '#2A1710' }}>Eventos en vivo</Link></li>
              <li><Link href="/order" className="transition md:hover:text-[#A87325]" style={{ color: '#2A1710' }}>Armar pedido</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.24em]" style={{ color: '#A87325', fontFamily: 'var(--font-dm-sans)' }}>
              Contacto
            </p>
            <div className="mt-4 space-y-3 text-sm" style={{ color: '#2A1710', fontFamily: 'var(--font-dm-sans)' }}>
              <p>Monterrey, Nuevo León</p>
              <p>Pedidos y eventos personalizados</p>
              <Link href="/admin" className="inline-flex rounded-full border px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] transition md:hover:-translate-y-0.5" style={{ borderColor: 'rgba(88,55,34,0.14)', background: 'rgba(255,252,245,0.72)' }}>
                Admin
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t pt-6" style={{ borderColor: 'rgba(88,55,34,0.10)' }}>
          <p className="text-center text-xs" style={{ color: '#765E4B', fontFamily: 'var(--font-dm-sans)' }}>
            © 2025 Nappan Studio · Hecho con cariño en Monterrey
          </p>
        </div>
      </div>
    </footer>
  )
}
