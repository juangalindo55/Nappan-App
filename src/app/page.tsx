import Hero from '@/components/Hero'
import CardGrid from '@/components/CardGrid'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-900 via-amber-800 to-amber-700">
      <Hero />

      {/* Products Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-amber-700 to-amber-800">
        <div className="max-w-7xl mx-auto mb-16">
          <div className="text-center">
            <span className="text-xs uppercase tracking-widest text-yellow-300 font-bold">
              Nuestras Creaciones
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-cream mt-4 mb-6 font-serif">
              ¿Qué buscas hoy?
            </h2>
            <div className="flex justify-center gap-2 mb-6">
              <div className="w-8 h-1 bg-yellow-300 rounded"></div>
              <div className="w-8 h-1 bg-yellow-300/50 rounded"></div>
            </div>
            <p className="text-cream/80 text-lg max-w-2xl mx-auto">
              Elige tu experiencia Nappan. Cada creación es una obra de arte hecha con pasión.
            </p>
          </div>
        </div>

        <CardGrid />
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-amber-800 to-amber-900">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-cream mb-4 font-serif">¿Tienes una idea especial?</h3>
          <p className="text-cream/80 mb-8">Contáctanos para personalizaciones y eventos exclusivos.</p>
          <button className="px-8 py-4 bg-yellow-300 text-amber-900 font-bold rounded-lg hover:bg-yellow-200 transition-colors">
            Solicitar Cotización
          </button>
        </div>
      </section>

      <Footer />
    </main>
  )
}
