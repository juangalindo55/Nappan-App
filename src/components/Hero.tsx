export default function Hero() {
  return (
    <div
      className="relative min-h-[80vh] md:min-h-[85vh] flex items-center justify-center text-center px-4 py-20 bg-cover bg-center"
      style={{
        backgroundImage: `url('/images/brunchtime.jpeg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 bg-black/30"></div>
      <div className="relative z-10 max-w-2xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold text-amber-50 mb-6 tracking-tight">
          Pancakes & Art
        </h1>
        <p className="text-lg md:text-xl text-amber-100">
          Experiencia única de arte comestible
        </p>
      </div>
    </div>
  )
}
