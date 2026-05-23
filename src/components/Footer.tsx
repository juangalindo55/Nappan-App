import Link from 'next/link'

export default function Footer() {
  return (
    <footer
      className="border-t"
      style={{
        marginTop: '4rem',
        backgroundColor: '#352216',
        borderColor: 'rgba(255,252,245,0.12)',
      }}
    >
      <div className="mx-auto w-full max-w-6xl px-5 pt-12 pb-36 md:pt-8 md:pb-6 sm:px-8 lg:px-10">
        <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.24em]" style={{ color: '#E8A345', fontFamily: 'var(--font-dm-sans)' }}>
              Nappan
            </p>
            <h3
              className="mt-2 text-4xl leading-none tracking-[-0.04em]"
              style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontWeight: 500, color: '#FFFCF5' }}
            >
              Pancakes & Art Studio
            </h3>

          </div>

          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.24em]" style={{ color: '#E8A345', fontFamily: 'var(--font-dm-sans)' }}>
              Explorar
            </p>
            <ul className="mt-4 space-y-3 text-xs" style={{ fontFamily: 'var(--font-dm-sans)' }}>
              <li><Link href="/products/lunchbox" className="transition md:hover:text-[#E8A345]" style={{ color: '#FFFCF5' }}>Lunch Box</Link></li>
              <li><Link href="/products/fitbar" className="transition md:hover:text-[#E8A345]" style={{ color: '#FFFCF5' }}>Protein Fit Bar</Link></li>
              <li><Link href="/products/eventos" className="transition md:hover:text-[#E8A345]" style={{ color: '#FFFCF5' }}>Eventos en vivo</Link></li>
              <li><Link href="/order" className="transition md:hover:text-[#E8A345]" style={{ color: '#FFFCF5' }}>Armar pedido</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.24em]" style={{ color: '#E8A345', fontFamily: 'var(--font-dm-sans)' }}>
              Contacto
            </p>
            <div className="mt-4 space-y-3 text-xs" style={{ color: '#FFFCF5', fontFamily: 'var(--font-dm-sans)' }}>
              <p>Monterrey, Nuevo León</p>
              <p>Pedidos y eventos personalizados</p>
              <div className="pt-2">
                <a
                  href="https://wa.me/528123509768"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-fit items-center gap-2 rounded-full px-4 py-2 font-medium transition active:scale-95"
                  style={{
                    backgroundColor: 'rgba(37, 211, 102, 0.1)',
                    border: '1px solid rgba(37, 211, 102, 0.3)',
                    color: '#25D366',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                  </svg>
                  WhatsApp
                </a>
              </div>
              <div className="pt-4">
                <Link href="/admin" className="inline-block border-b border-[#E8A345]/40 pb-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#FFFCF5] transition md:hover:border-[#E8A345] md:hover:text-[#E8A345]">
                  Admin
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t pt-4" style={{ borderColor: 'rgba(255,252,245,0.10)' }}>
          <p className="text-center text-[11px] opacity-70" style={{ color: '#FFFCF5', fontFamily: 'var(--font-dm-sans)' }}>
            © 2025 Nappan Studio · Hecho con cariño en Monterrey
          </p>
        </div>

        {/* Explicit spacer to absolutely guarantee BottomNav clearance on mobile */}
        <div className="md:hidden w-full" style={{ height: '110px' }} />
      </div>
    </footer>
  )
}
