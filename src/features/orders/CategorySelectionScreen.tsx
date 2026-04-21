'use client'

import { useRouter } from 'next/navigation'
import {
  type OrderCategory,
  useOrderFlowStore,
} from './order-flow.store'

type CategoryCard = {
  id: OrderCategory
  title: string
  description: string
  constraints: string
  cta: string
  href: string
}

const categories: CategoryCard[] = [
  {
    id: 'lunchbox',
    title: 'Caja Lunchbox',
    description: 'Cajas para cumpleaños, colegios y eventos privados.',
    constraints: 'Mínimo 20 piezas · cajas configurables',
    cta: 'Configurar lunchbox',
    href: '/order/lunchbox',
  },
  {
    id: 'artistic-box',
    title: 'Caja artística',
    description: 'Cajas de pancake art personalizadas para regalos y celebraciones.',
    constraints: 'Desde 1 pieza · diseño personalizado',
    cta: 'Personalizar caja',
    href: '/order/artistic-box',
  },
  {
    id: 'wellness-bar',
    title: 'Barra bienestar',
    description: 'Pancakes con proteína, bebidas y opciones ligeras para eventos.',
    constraints: 'Mínimo $1000 MXN · productos de menú',
    cta: 'Armar pedido bienestar',
    href: '/order/fitbar',
  },
  {
    id: 'live-event',
    title: 'Evento en Vivo',
    description: 'Estación de pancake art preparada en vivo para tus invitados.',
    constraints: 'Servicio por cotización · sin carrito',
    cta: 'Cotizar evento',
    href: '/menu?category=live-event',
  },
]

export default function CategorySelectionScreen() {
  const router = useRouter()
  const setOrderCategory = useOrderFlowStore((state) => state.setOrderCategory)

  function selectCategory(category: CategoryCard) {
    setOrderCategory(category.id)
    router.push(category.href)
  }

  return (
    <main
      className="hide-scrollbar min-h-dvh overflow-y-auto bg-[#0C0806] px-4 pb-8 pt-6 text-[#F0E4CC]"
      style={{ paddingBottom: 'calc(32px + env(safe-area-inset-bottom, 0px))' }}
    >
      <section className="mb-6 px-1">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#E8A420]">
          Pedido rápido
        </p>
        <h1 className="max-w-xs text-4xl font-semibold leading-tight">
          Elige lo que necesitas.
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-6 text-[#F0E4CC]/65">
          Primero selecciona una categoría para mostrarte el flujo correcto.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-3">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => selectCategory(category)}
            className="rounded-lg border border-[#E8A420]/10 bg-[#181209] p-4 text-left transition active:scale-[0.99] active:border-[#E8A420]/35"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-[#FFF6E5]">
                  {category.title}
                </h2>
                <p className="mt-2 text-sm leading-5 text-[#F0E4CC]/65">
                  {category.description}
                </p>
              </div>
              <span className="rounded-full bg-[#E8A420]/10 px-2.5 py-1 text-xs font-semibold text-[#E8A420]">
                {category.id === 'live-event' ? 'Evento' : 'Catering'}
              </span>
            </div>

            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-[#7A6A55]">
              {category.constraints}
            </p>

            <span className="mt-5 inline-flex items-center rounded-md bg-[#E8A420] px-4 py-2.5 text-sm font-bold text-[#0C0806]">
              {category.cta}
              <svg
                className="ml-2"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </button>
        ))}
      </section>
    </main>
  )
}
