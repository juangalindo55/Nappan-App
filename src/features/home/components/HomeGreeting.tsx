type HomeGreetingProps = {
  greeting: string
}

export function HomeGreeting({ greeting }: HomeGreetingProps) {
  return (
    <div className="px-5 mb-6 anim-up d1">
      {greeting ? (
        <p
          style={{
            fontSize: '12px',
            color: '#5A4A38',
            fontFamily: 'var(--font-dm-sans)',
            marginBottom: '4px',
            letterSpacing: '0.03em',
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
          fontSize: '34px',
          lineHeight: 1.15,
          color: '#F0E4CC',
        }}
      >
        ¿Qué se te
        <br />
        antoja hoy?
      </h1>
    </div>
  )
}
