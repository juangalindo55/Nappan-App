export function HomeTopBar() {
  return (
    <div
      className="flex items-center justify-between px-5 anim-up"
      style={{
        paddingTop: 'calc(18px + env(safe-area-inset-top, 0px))',
        paddingBottom: '10px',
      }}
    >
      <div className="flex items-baseline gap-1.5">
        <span
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontStyle: 'italic',
            fontWeight: 700,
            fontSize: '26px',
            color: '#E8A420',
            letterSpacing: '-0.01em',
          }}
        >
          Nappan
        </span>
        <span
          style={{
            fontSize: '11px',
            color: '#5A4A38',
            fontFamily: 'var(--font-dm-sans)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          Studio
        </span>
      </div>

      <button
        className="relative w-10 h-10 flex items-center justify-center rounded-full"
        style={{
          background: '#1A1209',
          border: '1px solid rgba(232,164,32,0.08)',
        }}
        aria-label="Ver pedido"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#F0E4CC"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
        <span
          className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center"
          style={{
            background: '#E8A420',
            fontSize: '8px',
            fontWeight: 700,
            color: '#0C0806',
          }}
        >
          0
        </span>
      </button>
    </div>
  )
}
