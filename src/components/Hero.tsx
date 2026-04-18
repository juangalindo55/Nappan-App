'use client'

import { useState, useEffect } from 'react'

const heroProducts = [
  { title: 'Lunch Box', subtitle: 'Cajas artísticas para eventos' },
  { title: 'Protein Fit Bar', subtitle: 'Pancakes proteicos premium' },
  { title: 'Nappan Box', subtitle: 'Ultra realismo personalizado' },
  { title: 'Eventos en Vivo', subtitle: 'Experiencia gastronómica' }
]

export default function Hero() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % heroProducts.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-900 via-amber-800 to-amber-700"></div>

      {/* Spotlight effect - rotates through products */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-yellow-300 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-1000"
          style={{ opacity: current === 0 ? 0.4 : 0 }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-12 text-center">
        {/* Brand mark */}
        <div className="mb-8 inline-block">
          <span className="text-sm font-semibold uppercase tracking-widest text-yellow-300">
            Nappan Studio
          </span>
        </div>

        {/* Main title */}
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-cream mb-6 leading-tight tracking-tight">
          Pancakes
          <br />
          <span className="text-yellow-300">& Art</span>
        </h1>

        {/* Rotating product showcase */}
        <div className="min-h-24 flex flex-col items-center justify-center mb-12">
          {heroProducts.map((product, idx) => (
            <div
              key={idx}
              className="transition-all duration-700 absolute"
              style={{
                opacity: current === idx ? 1 : 0,
                transform: current === idx ? 'scale(1)' : 'scale(0.95)'
              }}
            >
              <p className="text-xl md:text-2xl text-cream mb-2">{product.title}</p>
              <p className="text-sm md:text-base text-yellow-200">{product.subtitle}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button className="inline-block px-8 py-3 bg-yellow-300 text-amber-900 font-semibold rounded-lg hover:bg-yellow-200 transition-colors">
          Explorar Ahora
        </button>

        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mt-12">
          {heroProducts.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                current === idx ? 'bg-yellow-300 w-6' : 'bg-cream/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Decorative element */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-terracotta/20 to-transparent rounded-tl-full blur-2xl"></div>
    </div>
  )
}
