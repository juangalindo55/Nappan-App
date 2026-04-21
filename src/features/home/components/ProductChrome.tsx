export const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.9'/%3E%3C/svg%3E")`

export function GrainLayer({ opacity = 0.18 }: { opacity?: number }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: GRAIN,
        backgroundSize: '180px 180px',
        opacity,
        mixBlendMode: 'overlay',
      }}
    />
  )
}

export function GoldShimmer() {
  return (
    <div
      className="absolute top-0 left-0 right-0 h-px pointer-events-none"
      style={{
        background:
          'linear-gradient(90deg, transparent 0%, rgba(232,164,32,0.35) 50%, transparent 100%)',
      }}
    />
  )
}
