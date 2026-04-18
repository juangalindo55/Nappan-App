import Hero from '@/components/Hero'
import CardGrid from '@/components/CardGrid'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-900 via-amber-800 to-amber-100">
      <Hero />
      <section className="py-12 px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-amber-50 mb-4">
            ¿Qué buscas hoy?
          </h2>
          <div className="w-12 h-1 bg-yellow-300 mx-auto mb-4"></div>
          <p className="text-amber-100 text-lg">Elige tu experiencia Nappan</p>
        </div>
        <CardGrid />
      </section>
      <Footer />
    </main>
  )
}
