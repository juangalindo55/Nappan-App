'use client'

import Card from './Card'

const cards = [
  {
    id: 'lunchbox' as const,
    tag: 'Eventos · Cumpleaños',
    title: 'Lunch Box',
    description: 'Cajas con pancakes artísticos para eventos. Presentación premium.',
    cta: 'Pedir',
    href: '/products/lunchbox',
    bgColor: 'from-rose-400 to-rose-500',
    size: 'lg'
  },
  {
    id: 'fitbar',
    tag: 'Fit · Proteína',
    title: 'Protein Fit Bar',
    description: 'Pancakes proteicos premium. Eat clean. Feel strong.',
    cta: 'Explorar',
    href: '/products/fitbar',
    bgColor: 'from-amber-400 to-amber-500',
    size: 'sm'
  },
  {
    id: 'eventos',
    tag: 'Experiencia',
    title: 'Eventos en Vivo',
    description: 'Hacemos pancakes artísticos en tu evento. Experiencia gastronómica.',
    cta: 'Cotizar',
    href: '/products/eventos',
    bgColor: 'from-purple-400 to-purple-500',
    size: 'sm'
  },
  {
    id: 'nappanbox',
    tag: 'Ultra Realismo',
    title: 'Nappan Box',
    description: 'Pancakes con arte ultra realista. Completamente personalizado para ti.',
    cta: 'Descubrir',
    href: '/products/nappanbox',
    bgColor: 'from-emerald-400 to-emerald-500',
    size: 'lg'
  }
] as const

export default function CardGrid() {
  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-max">
        {/* Large card - left */}
        <div className="md:col-span-2 md:row-span-2">
          <Card {...cards[0]} />
        </div>

        {/* Small cards - right */}
        <div>
          <Card {...cards[1]} />
        </div>
        <div>
          <Card {...cards[2]} />
        </div>

        {/* Large card - bottom right */}
        <div className="md:col-span-2">
          <Card {...cards[3]} />
        </div>
      </div>
    </div>
  )
}
