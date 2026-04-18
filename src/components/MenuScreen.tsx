'use client'

import { useState } from 'react'

/* ─── Data ──────────────────────────────────────────────────────────── */

const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.9'/%3E%3C/svg%3E")`

type FieldType = 'text' | 'tel' | 'textarea' | 'number' | 'date' | 'time' | 'select' | 'radio' | 'checkbox'

type Field = {
  id: string
  label: string
  type: FieldType
  placeholder?: string
  options?: string[]
  required?: boolean
  min?: string | number
  help?: string
}

type Variant = {
  id: string
  name: string
  price: number
  note?: string
}

type Product = {
  id: string
  tabLabel: string
  name: string
  tagline: string
  description: string
  tag: string
  priceLabel: string
  gradient: string
  glow: string
  accentColor: string
  variants?: Variant[]
  fields: Field[]
  footnote?: string
}

const products: Product[] = [
  {
    id: 'nappanbox',
    tabLabel: 'Nappan Box',
    name: 'Nappan Box',
    tagline: 'Ultra realismo personalizado',
    description: 'Pancakes artísticos que son una experiencia. Cada caja, una obra de arte única.',
    tag: 'Exclusivo',
    priceLabel: 'Desde $450',
    gradient: 'radial-gradient(ellipse at 38% 42%, #1A3D28 0%, #0A1E14 55%, #040E09 100%)',
    glow: 'rgba(40,160,90,0.3)',
    accentColor: '#4ADE80',
    variants: [
      { id: 'nappan', name: 'Nappan Box', price: 450 },
      { id: 'premium', name: 'Premium Box', price: 850, note: 'Diseño ultra realista a tu medida' },
    ],
    fields: [
      { id: 'variant', label: 'Tipo de caja', type: 'radio', options: ['Nappan Box · $450', 'Premium Box · $850'], required: true },
      { id: 'personaje', label: '¿Qué personaje o diseño quieres?', type: 'text', placeholder: 'Ej: Bluey, logo de empresa, mascota…', required: true },
      { id: 'referencia', label: 'Imagen de referencia (link opcional)', type: 'text', placeholder: 'Pega un link o describe la foto' },
      { id: 'detalles', label: 'Detalles de personalización', type: 'textarea', placeholder: 'Colores, estilo, texto en la caja…' },
      { id: 'fecha', label: 'Fecha deseada', type: 'date', required: true, help: 'Mínimo 7 días de anticipación' },
      { id: 'paraQuien', label: '¿Es para quién?', type: 'text', placeholder: 'Nombre del festejado (opcional)' },
      { id: 'cp', label: 'Código postal (para envío)', type: 'text', placeholder: '64000' },
      { id: 'pago', label: 'Método de pago', type: 'select', options: ['Efectivo', 'Transferencia SPEI'], required: true },
    ],
    footnote: 'Requiere 50% de anticipo. Confirmamos diseño por WhatsApp antes de producir.',
  },
  {
    id: 'lunchbox',
    tabLabel: 'Lunch Box',
    name: 'Lunch Box',
    tagline: 'Cajas artísticas para eventos',
    description: 'Pancakes de arte, sabor y creatividad. Perfecto para cumpleaños y eventos. Incluye pancake de regalo para el festejado.',
    tag: 'Eventos',
    priceLabel: 'Desde $125',
    gradient: 'radial-gradient(ellipse at 42% 38%, #3A1220 0%, #1C0810 55%, #0C0408 100%)',
    glow: 'rgba(190,50,80,0.3)',
    accentColor: '#F87171',
    variants: [
      { id: 'box1', name: 'Lunch Box 1', price: 125 },
      { id: 'box2', name: 'Lunch Box 2', price: 130 },
    ],
    fields: [
      { id: 'variant', label: 'Tipo de Lunch Box', type: 'radio', options: ['Lunch Box 1 · $125', 'Lunch Box 2 · $130'], required: true },
      { id: 'cantidad', label: 'Cantidad de cajas', type: 'number', placeholder: '20', min: 20, required: true, help: 'Mínimo 20 unidades por pedido' },
      { id: 'fruta', label: 'Fruta o gelatina', type: 'radio', options: ['Fruta (uva, durazno, fresa)', 'Gelatina'], required: true },
      { id: 'diseno', label: 'Diseño del PancakeART', type: 'radio', options: ['Osito', 'Capibara', 'Pollito'], required: true },
      { id: 'extras', label: 'Extras (opcional)', type: 'checkbox', options: ['Salchipulpos + catsup (+$25)', 'Upgrade a Nucolato (+$5)', 'Upgrade a croissant completo (+$20)'] },
      { id: 'fecha', label: 'Fecha de entrega', type: 'date', required: true },
      { id: 'hora', label: 'Hora aproximada', type: 'time' },
      { id: 'direccion', label: 'Dirección / notas de entrega', type: 'textarea', placeholder: 'Dirección completa, referencias…' },
      { id: 'cp', label: 'Código postal', type: 'text', placeholder: '64000' },
      { id: 'pago', label: 'Método de pago', type: 'select', options: ['Efectivo', 'Transferencia SPEI'], required: true },
    ],
    footnote: 'Incluye pancake de regalo para el festejado.',
  },
  {
    id: 'fitbar',
    tabLabel: 'Fit Bar',
    name: 'Protein Fit Bar',
    tagline: 'Eat clean. Feel strong.',
    description: 'Proteína funcional. Lista para llevar. Hecha con amor. Pedido mínimo $1,000 MXN.',
    tag: 'Proteína',
    priceLabel: 'Desde $29',
    gradient: 'radial-gradient(ellipse at 55% 35%, #3A2210 0%, #1C1008 55%, #0C0804 100%)',
    glow: 'rgba(220,140,40,0.3)',
    accentColor: '#FBBF24',
    variants: [
      { id: 'cpl', name: 'Cold Protein Latte', price: 75 },
      { id: 'cb', name: 'Cold Brew', price: 75 },
      { id: 'bc', name: 'Black Coffee', price: 35 },
      { id: 'detox', name: 'Detox Glow', price: 29 },
      { id: 'energy', name: 'Energy Boost', price: 29 },
      { id: 'golden', name: 'Golden Power', price: 29 },
      { id: 'power', name: 'Power Pancakes', price: 110 },
      { id: 'minis', name: 'Protein Minis', price: 55 },
    ],
    fields: [
      { id: 'producto', label: '¿Qué te late?', type: 'select', options: [
        'Cold Protein Latte · $75',
        'Cold Brew · $75',
        'Black Coffee · $35',
        'Detox Glow · $29',
        'Energy Boost · $29',
        'Golden Power · $29',
        'Power Pancakes · $110',
        'Protein Minis · $55',
      ], required: true },
      { id: 'cantidad', label: 'Cantidad', type: 'number', placeholder: '1', min: 1, required: true },
      { id: 'notas', label: 'Alergias o preferencias', type: 'textarea', placeholder: 'Sin lactosa, extra proteína…' },
      { id: 'fecha', label: 'Fecha de entrega', type: 'date', required: true },
      { id: 'hora', label: 'Hora aproximada', type: 'time' },
      { id: 'cp', label: 'Código postal', type: 'text', placeholder: '64000' },
      { id: 'pago', label: 'Método de pago', type: 'select', options: ['Efectivo', 'Transferencia SPEI'], required: true },
    ],
    footnote: 'Pedido mínimo $1,000 MXN para servicio a eventos.',
  },
  {
    id: 'eventos',
    tabLabel: 'Eventos',
    name: 'Eventos en Vivo',
    tagline: 'Experiencia gastronómica en tu celebración',
    description: 'Llevamos el arte del pancake a tu evento. Cada invitado recibe un pancake artístico hecho al momento frente a ellos. Precio por cotización.',
    tag: 'Premium',
    priceLabel: 'Por cotización',
    gradient: 'radial-gradient(ellipse at 48% 42%, #251040 0%, #120820 55%, #080410 100%)',
    glow: 'rgba(130,60,200,0.3)',
    accentColor: '#C084FC',
    fields: [
      { id: 'tipo', label: 'Tipo de evento', type: 'select', options: [
        '🎂 Cumpleaños',
        '💪 Wellness',
        '🏢 Evento corporativo',
        '👶 Baby shower',
        '🎓 Graduación',
        '🎪 Feria / Festival',
        '🎄 Posada / Fiesta navideña',
        '✨ Otro',
      ], required: true },
      { id: 'invitados', label: 'Número de invitados', type: 'number', placeholder: '50', min: 1, required: true },
      { id: 'fecha', label: 'Fecha del evento', type: 'date', required: true, help: 'Mínimo 14 días de anticipación' },
      { id: 'horario', label: 'Horario aproximado', type: 'text', placeholder: '4:00 PM – 7:00 PM' },
      { id: 'lugar', label: 'Lugar del evento', type: 'text', placeholder: 'Salón, casa, oficina…', required: true },
      { id: 'tematica', label: 'Temática o preferencias', type: 'textarea', placeholder: 'Colores, estilo, sabores preferidos…' },
      { id: 'notas', label: 'Notas adicionales', type: 'textarea', placeholder: 'Estacionamiento, acceso, montaje…' },
    ],
    footnote: 'Requiere 50% de anticipo. Servicio en Monterrey y área metropolitana.',
  },
]

/* ─── Order form ─────────────────────────────────────────────────────── */

function OrderForm({ product }: { product: Product }) {
  const [values, setValues] = useState<Record<string, string | string[]>>({})
  const [sent, setSent] = useState(false)

  const set = (id: string, val: string | string[]) => setValues(v => ({ ...v, [id]: val }))

  const inputBase = {
    width: '100%',
    background: '#1A1209',
    border: '1px solid rgba(232,164,32,0.12)',
    borderRadius: '12px',
    padding: '12px 14px',
    color: '#F0E4CC',
    fontSize: '14px',
    fontFamily: 'var(--font-dm-sans)',
    outline: 'none',
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 anim-up">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5" style={{ background: 'rgba(232,164,32,0.12)', border: '1px solid rgba(232,164,32,0.25)' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E8A420" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <p style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: '26px', color: '#F0E4CC', marginBottom: '8px', textAlign: 'center' }}>
          ¡Pedido recibido!
        </p>
        <p style={{ fontSize: '13px', fontFamily: 'var(--font-dm-sans)', color: '#5A4A38', textAlign: 'center', lineHeight: 1.6 }}>
          Te contactaremos por WhatsApp para confirmar detalles.
        </p>
      </div>
    )
  }

  return (
    <div className="px-4 pt-4 pb-4 anim-up">
      {/* Product banner */}
      <div className="relative rounded-2xl overflow-hidden mb-5" style={{ height: '150px', background: product.gradient }}>
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 35% 50%, ${product.glow} 0%, transparent 60%)` }} />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: GRAIN, backgroundSize: '150px 150px', mixBlendMode: 'overlay' as const }} />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(232,164,32,0.3), transparent)' }} />
        <div className="absolute bottom-0 left-0 right-0" style={{ height: '70%', background: 'linear-gradient(to top, rgba(4,6,4,0.92) 0%, transparent 100%)' }} />
        <div className="absolute top-3 right-3">
          <span style={{
            fontSize: '11px', fontFamily: 'var(--font-dm-sans)', fontWeight: 700,
            background: 'rgba(12,8,6,0.65)', backdropFilter: 'blur(8px)',
            padding: '4px 12px', borderRadius: '999px',
            border: `1px solid ${product.accentColor}30`, color: product.accentColor,
          }}>{product.priceLabel}</span>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <p style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontWeight: 600, fontSize: '30px', color: '#F0E4CC', lineHeight: 1 }}>{product.name}</p>
          <p style={{ fontSize: '11px', fontFamily: 'var(--font-dm-sans)', color: product.accentColor, opacity: 0.85, marginTop: '4px', letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>{product.tagline}</p>
        </div>
      </div>

      {/* Description */}
      <p style={{ fontSize: '13px', fontFamily: 'var(--font-dm-sans)', color: 'rgba(240,228,204,0.6)', lineHeight: 1.6, marginBottom: '24px' }}>
        {product.description}
      </p>

      {/* Fields */}
      <div className="flex flex-col gap-4">
        {product.fields.map(field => (
          <div key={field.id}>
            <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-dm-sans)', fontWeight: 600, color: '#7A6A55', letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginBottom: '8px' }}>
              {field.label}{field.required && <span style={{ color: product.accentColor, marginLeft: '4px' }}>*</span>}
            </label>

            {field.type === 'textarea' && (
              <textarea rows={3} placeholder={field.placeholder} value={(values[field.id] as string) || ''} onChange={e => set(field.id, e.target.value)} style={{ ...inputBase, resize: 'none' as const }} />
            )}

            {field.type === 'select' && (
              <select value={(values[field.id] as string) || ''} onChange={e => set(field.id, e.target.value)} style={{ ...inputBase }}>
                <option value="" disabled>Seleccionar…</option>
                {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            )}

            {field.type === 'radio' && (
              <div className="flex flex-col gap-2">
                {field.options?.map(o => {
                  const checked = values[field.id] === o
                  return (
                    <button
                      key={o}
                      type="button"
                      onClick={() => set(field.id, o)}
                      className="text-left transition-all"
                      style={{
                        ...inputBase,
                        cursor: 'pointer',
                        background: checked ? `${product.accentColor}14` : '#1A1209',
                        border: checked ? `1px solid ${product.accentColor}66` : '1px solid rgba(232,164,32,0.12)',
                        color: checked ? '#F0E4CC' : 'rgba(240,228,204,0.75)',
                      }}
                    >
                      {o}
                    </button>
                  )
                })}
              </div>
            )}

            {field.type === 'checkbox' && (
              <div className="flex flex-col gap-2">
                {field.options?.map(o => {
                  const arr = (values[field.id] as string[]) || []
                  const checked = arr.includes(o)
                  return (
                    <button
                      key={o}
                      type="button"
                      onClick={() => set(field.id, checked ? arr.filter(x => x !== o) : [...arr, o])}
                      className="text-left transition-all flex items-center gap-3"
                      style={{
                        ...inputBase,
                        cursor: 'pointer',
                        background: checked ? `${product.accentColor}14` : '#1A1209',
                        border: checked ? `1px solid ${product.accentColor}66` : '1px solid rgba(232,164,32,0.12)',
                        color: checked ? '#F0E4CC' : 'rgba(240,228,204,0.75)',
                      }}
                    >
                      <span style={{
                        width: '16px', height: '16px', borderRadius: '4px',
                        border: `1.5px solid ${checked ? product.accentColor : '#5A4A38'}`,
                        background: checked ? product.accentColor : 'transparent',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        {checked && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0C0806" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>}
                      </span>
                      {o}
                    </button>
                  )
                })}
              </div>
            )}

            {(field.type === 'text' || field.type === 'tel' || field.type === 'number' || field.type === 'date' || field.type === 'time') && (
              <input
                type={field.type}
                placeholder={field.placeholder}
                min={field.min as never}
                value={(values[field.id] as string) || ''}
                onChange={e => set(field.id, e.target.value)}
                style={{ ...inputBase }}
              />
            )}

            {field.help && (
              <p style={{ fontSize: '11px', fontFamily: 'var(--font-dm-sans)', color: '#5A4A38', marginTop: '6px' }}>{field.help}</p>
            )}
          </div>
        ))}

        {/* Contact (name + phone) */}
        <div className="mt-2 pt-5" style={{ borderTop: '1px solid rgba(232,164,32,0.08)' }}>
          <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-dm-sans)', fontWeight: 600, color: '#7A6A55', letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginBottom: '8px' }}>
            Tu nombre<span style={{ color: product.accentColor, marginLeft: '4px' }}>*</span>
          </label>
          <input
            type="text"
            placeholder="Nombre completo"
            value={(values['nombre'] as string) || ''}
            onChange={e => set('nombre', e.target.value)}
            style={{ ...inputBase, marginBottom: '16px' }}
          />

          <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-dm-sans)', fontWeight: 600, color: '#7A6A55', letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginBottom: '8px' }}>
            WhatsApp<span style={{ color: product.accentColor, marginLeft: '4px' }}>*</span>
          </label>
          <input
            type="tel"
            placeholder="+52 81 0000 0000"
            value={(values['telefono'] as string) || ''}
            onChange={e => set('telefono', e.target.value)}
            style={{ ...inputBase }}
          />
        </div>

        {/* Submit */}
        <button
          onClick={() => setSent(true)}
          className="w-full py-4 rounded-xl mt-3"
          style={{
            background: `linear-gradient(135deg, ${product.accentColor} 0%, #C07810 140%)`,
            color: '#0C0806',
            fontSize: '15px',
            fontFamily: 'var(--font-dm-sans)',
            fontWeight: 700,
            letterSpacing: '0.02em',
            boxShadow: `0 4px 20px ${product.accentColor}40`,
          }}
        >
          Enviar pedido
        </button>

        {product.footnote && (
          <p style={{ fontSize: '11px', fontFamily: 'var(--font-dm-sans)', color: '#5A4A38', textAlign: 'center' as const, lineHeight: 1.5 }}>
            {product.footnote}
          </p>
        )}
      </div>
    </div>
  )
}

/* ─── Main ───────────────────────────────────────────────────────────── */

export default function MenuScreen() {
  const [active, setActive] = useState(products[0].id)
  const activeProduct = products.find(p => p.id === active)!

  return (
    <div
      className="hide-scrollbar overflow-y-auto overflow-x-hidden"
      style={{ minHeight: '100dvh', paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))' }}
    >
      {/* ── Sticky header ─────────────────────────── */}
      <div
        className="sticky top-0 z-10 px-5"
        style={{
          paddingTop: 'calc(18px + env(safe-area-inset-top, 0px))',
          paddingBottom: '14px',
          background: 'rgba(12,8,6,0.94)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(232,164,32,0.06)',
        }}
      >
        <h1
          className="mb-4"
          style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontWeight: 600, fontSize: '28px', color: '#F0E4CC' }}
        >
          {activeProduct.name}
        </h1>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar" style={{ paddingBottom: '2px' }}>
          {products.map(p => {
            const isActive = active === p.id
            return (
              <button
                key={p.id}
                onClick={() => setActive(p.id)}
                className="flex-shrink-0 rounded-full transition-all duration-200"
                style={{
                  padding: '7px 16px',
                  fontSize: '12px',
                  fontFamily: 'var(--font-dm-sans)',
                  fontWeight: isActive ? 600 : 400,
                  background: isActive ? p.accentColor : '#181209',
                  color: isActive ? '#0C0806' : '#5A4A38',
                  border: isActive ? 'none' : '1px solid #261E10',
                }}
              >
                {p.tabLabel}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Form ───────────────────────────────────── */}
      <OrderForm key={active} product={activeProduct} />
    </div>
  )
}
