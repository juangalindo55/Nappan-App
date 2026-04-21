export function HomeSectionHeader() {
  return (
    <div className="flex items-center justify-between px-5 mb-4 anim-up d2">
      <h2
        style={{
          fontFamily: 'var(--font-cormorant)',
          fontWeight: 600,
          fontSize: '20px',
          color: '#F0E4CC',
        }}
      >
        Nuestros productos
      </h2>
      <span
        style={{
          fontSize: '12px',
          color: '#E8A420',
          fontFamily: 'var(--font-dm-sans)',
        }}
      >
        Ver todos →
      </span>
    </div>
  )
}
