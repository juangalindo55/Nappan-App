import Link from 'next/link'

type HomeGreetingProps = {
  greeting: string
}

export function HomeGreeting({ greeting }: HomeGreetingProps) {
  return (
    <div className="px-5 mb-8 anim-up d1">
      {greeting ? (
        <p
          style={{
            fontSize: '12px',
            color: '#A58B69',
            fontFamily: 'var(--font-dm-sans)',
            marginBottom: '6px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          {greeting}
        </p>
      ) : null}
      <h1
        style={{
          fontFamily: 'var(--font-cormorant)',
          fontStyle: 'italic',
          fontWeight: 400,
          fontSize: 'clamp(30px, 8vw, 38px)',
          lineHeight: 1.08,
          color: '#F0E4CC',
          letterSpacing: '-0.03em',
          maxWidth: '11ch',
        }}
      >
        ¿Qué se te
        <br />
        antoja hoy?
      </h1>
      <p
        style={{
          marginTop: '12px',
          maxWidth: '24ch',
          fontSize: '14px',
          lineHeight: 1.6,
          color: 'rgba(240,228,204,0.62)',
          fontFamily: 'var(--font-dm-sans)',
        }}
      >
        Explora lo destacado y arma tu pedido en segundos.
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href="/explorar"
          className="inline-flex items-center rounded-full border border-[#E8A420]/18 bg-[#181209] px-4 py-2 text-xs font-semibold text-[#F0E4CC] transition active:scale-95"
          style={{ fontFamily: 'var(--font-dm-sans)' }}
        >
          Explorar
        </Link>
        <Link
          href="/cart"
          className="inline-flex items-center rounded-full border border-[#E8A420]/22 bg-[#E8A420]/12 px-4 py-2 text-xs font-semibold text-[#E8A420] transition active:scale-95"
          style={{ fontFamily: 'var(--font-dm-sans)' }}
        >
          Ver carrito
        </Link>
      </div>
    </div>
  )
}
