'use client'

import Card from './Card'

const cards = [
  {
    id: 'lunchbox',
    tag: 'Eventos · Cumpleaños',
    title: 'Lunch Box',
    description: 'Cajas con pancakes artísticos para eventos y cumpleaños. Mínimo 20 piezas.',
    cta: 'Pedir ahora',
    href: '/products/lunchbox',
    bgColor: 'from-pink-500 to-pink-600'
  },
  {
    id: 'eventos',
    tag: 'Experiencia · En vivo',
    title: 'Eventos en Vivo',
    description: 'Hacemos pancakes artísticos en tu evento. Cada invitado recibe uno completo, hecho al momento.',
    cta: 'Cotizar',
    href: '/products/eventos',
    bgColor: 'from-purple-500 to-purple-600'
  },
  {
    id: 'fitbar',
    tag: 'Fit · Proteína · Café',
    title: 'Protein Fit Bar',
    description: 'Coffee bar proteico, Power Pancakes, Protein Minis y Boost Shots. Eat clean. Feel strong.',
    cta: 'Ver menú',
    href: '/products/fitbar',
    bgColor: 'from-yellow-500 to-amber-600',
    ctaStyle: 'bg-amber-400 text-amber-900'
  },
  {
    id: 'nappanbox',
    tag: 'Ultra personalizado · Realismo',
    title: 'Nappan Box',
    description: 'Cajas de pancakes con arte de ultra realismo. Completamente personalizadas para ti.',
    cta: 'Explorar',
    href: '/products/nappanbox',
    bgColor: 'from-emerald-500 to-emerald-600',
    ctaStyle: 'bg-amber-400 text-amber-900'
  }
]

export default function CardGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
      {cards.map(card => (
        <Card key={card.id} {...card} />
      ))}
    </div>
  )
}
