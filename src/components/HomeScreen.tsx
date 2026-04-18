'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

/* ─── Data ─────────────────────────────────────────────────────────── */

const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.9'/%3E%3C/svg%3E")`

const products = [
  {
    id: 'nappanbox',
    name: 'Nappan Box',
    subtitle: 'Ultra realismo personalizado',
    tag: 'Exclusivo',
    href: '/products/nappanbox',
    gradient: 'radial-gradient(ellipse at 38% 42%, #1A3D28 0%, #0A1E14 55%, #040E09 100%)',
    glow: 'rgba(40,160,90,0.28)',
    category: 'Nappan Box',
  },
  {
    id: 'lunchbox',
    name: 'Lunch Box',
    subtitle: 'Cajas artísticas para eventos',
    tag: 'Eventos',
    href: '/products/lunchbox',
    gradient: 'radial-gradient(ellipse at 42% 38%, #3A1220 0%, #1C0810 55%, #0C0408 100%)',
    glow: 'rgba(190,50,80,0.28)',
    category: 'Lunch Box',
  },
  {
    id: 'fitbar',
    name: 'Fit Bar',
    subtitle: 'Eat clean. Feel strong.',
    tag: 'Proteína',
    href: '/products/fitbar',
    gradient: 'radial-gradient(ellipse at 55% 35%, #3A2210 0%, #1C1008 55%, #0C0804 100%)',
    glow: 'rgba(220,140,40,0.28)',
    category: 'Fit Bar',
  },
  {
    id: 'eventos',
    name: 'Eventos',
    subtitle: 'Experiencia gastronómica en vivo',
    tag: 'Premium',
    href: '/products/eventos',
    gradient: 'radial-gradient(ellipse at 48% 42%, #251040 0%, #120820 55%, #080410 100%)',
    glow: 'rgba(130,60,200,0.28)',
    category: 'Eventos',
  },
]

const categories = ['Todos', 'Lunch Box', 'Fit Bar', 'Eventos', 'Nappan Box']

/* ─── Helpers ───────────────────────────────────────────────────────── */

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

/* ─── Sub-components ────────────────────────────────────────────────── */

function GrainLayer({ opacity = 0.18 }: { opacity?: number }) {
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

function GoldShimmer() {
  return (
    <div
      className="absolute top-0 left-0 right-0 h-px pointer-events-none"
      style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(232,164,32,0.35) 50%, transparent 100%)' }}
    />
  )
}

function FeaturedCard({ product }: { product: typeof products[0] }) {
  return (
    <Link href={product.href}>
      <div
        className="relative rounded-2xl overflow-hidden anim-scale d1"
        style={{ height: '270px', background: product.gradient }}
      >
        {/* Warm glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 35% 50%, ${product.glow} 0%, transparent 60%)` }}
        />

        <GrainLayer opacity={0.22} />
        <GoldShimmer />

        {/* Bottom vignette */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{ height: '65%', background: 'linear-gradient(to top, rgba(4,8,6,0.92) 0%, transparent 100%)' }}
        />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <span
            className="inline-block mb-3 px-2 py-1 rounded-full"
            style={{
              fontSize: '10px',
              fontFamily: 'var(--font-dm-sans)',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              background: 'rgba(232,164,32,0.12)',
              border: '1px solid rgba(232,164,32,0.22)',
              color: '#E8A420',
            }}
          >
            {product.tag}
          </span>

          <h2
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontStyle: 'italic',
              fontWeight: 600,
              fontSize: '42px',
              lineHeight: 1.05,
              color: '#F0E4CC',
              marginBottom: '6px',
            }}
          >
            {product.name}
          </h2>

          <p style={{ fontSize: '13px', color: 'rgba(240,228,204,0.55)', fontFamily: 'var(--font-dm-sans)', marginBottom: '14px' }}>
            {product.subtitle}
          </p>

          <div className="flex items-center gap-1.5">
            <span style={{ fontSize: '13px', color: '#E8A420', fontFamily: 'var(--font-dm-sans)', fontWeight: 500 }}>
              Explorar
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E8A420" strokeWidth="2.2" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Featured badge top-right */}
        <div
          className="absolute top-4 right-4 px-2.5 py-1 rounded-full"
          style={{
            background: 'rgba(14,10,6,0.65)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(232,164,32,0.15)',
          }}
        >
          <span style={{ fontSize: '10px', color: '#E8A420', fontFamily: 'var(--font-dm-sans)', fontWeight: 600, letterSpacing: '0.05em' }}>
            DESTACADO
          </span>
        </div>
      </div>
    </Link>
  )
}

function ProductCard({ product, delay }: { product: typeof products[0]; delay: string }) {
  return (
    <Link href={product.href}>
      <div
        className={`relative rounded-xl overflow-hidden anim-up`}
        style={{ height: '155px', background: product.gradient, animationDelay: delay }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 40% 40%, ${product.glow} 0%, transparent 65%)` }}
        />

        <GrainLayer opacity={0.15} />
        <GoldShimmer />

        {/* Bottom vignette */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{ height: '70%', background: 'linear-gradient(to top, rgba(4,6,4,0.9) 0%, transparent 100%)' }}
        />

        <div className="absolute bottom-0 left-0 right-0 p-3">
          <span style={{
            display: 'block',
            fontSize: '9px',
            fontFamily: 'var(--font-dm-sans)',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'rgba(232,164,32,0.55)',
            marginBottom: '2px',
          }}>
            {product.tag}
          </span>
          <h3 style={{
            fontFamily: 'var(--font-cormorant)',
            fontStyle: 'italic',
            fontWeight: 600,
            fontSize: '22px',
            lineHeight: 1.1,
            color: '#F0E4CC',
          }}>
            {product.name}
          </h3>
        </div>
      </div>
    </Link>
  )
}

/* ─── Main Component ─────────────────────────────────────────────────── */

export default function HomeScreen() {
  const [greeting, setGreeting] = useState('')
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [featuredIndex, setFeaturedIndex] = useState(0)

  useEffect(() => {
    setGreeting(getGreeting())
    const timer = setInterval(() => {
      setFeaturedIndex(i => (i + 1) % products.length)
    }, 7000)
    return () => clearInterval(timer)
  }, [])

  const featured = products[featuredIndex]
  const grid = activeCategory === 'Todos'
    ? products
    : products.filter(p => p.category === activeCategory)

  return (
    <div
      className="hide-scrollbar overflow-y-auto overflow-x-hidden"
      style={{ minHeight: '100dvh', paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))' }}
    >
      {/* ── Top Bar ────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-5 anim-up"
        style={{
          paddingTop: 'calc(18px + env(safe-area-inset-top, 0px))',
          paddingBottom: '10px',
        }}
      >
        <div className="flex items-baseline gap-1.5">
          <span style={{
            fontFamily: 'var(--font-cormorant)',
            fontStyle: 'italic',
            fontWeight: 700,
            fontSize: '26px',
            color: '#E8A420',
            letterSpacing: '-0.01em',
          }}>
            Nappan
          </span>
          <span style={{ fontSize: '11px', color: '#5A4A38', fontFamily: 'var(--font-dm-sans)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Studio
          </span>
        </div>

        <button
          className="relative w-10 h-10 flex items-center justify-center rounded-full"
          style={{ background: '#1A1209', border: '1px solid rgba(232,164,32,0.08)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F0E4CC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          <span
            className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center"
            style={{ background: '#E8A420', fontSize: '8px', fontWeight: 700, color: '#0C0806' }}
          >
            0
          </span>
        </button>
      </div>

      {/* ── Greeting ──────────────────────────────── */}
      <div className="px-5 mb-6 anim-up d1">
        {greeting && (
          <p style={{ fontSize: '12px', color: '#5A4A38', fontFamily: 'var(--font-dm-sans)', marginBottom: '4px', letterSpacing: '0.03em' }}>
            {greeting}
          </p>
        )}
        <h1 style={{
          fontFamily: 'var(--font-cormorant)',
          fontStyle: 'italic',
          fontWeight: 400,
          fontSize: '34px',
          lineHeight: 1.15,
          color: '#F0E4CC',
        }}>
          ¿Qué se te<br />antoja hoy?
        </h1>
      </div>

      {/* ── Featured Card ─────────────────────────── */}
      <div className="px-4 mb-6">
        <FeaturedCard key={featuredIndex} product={featured} />
      </div>

      {/* ── Section Header ────────────────────────── */}
      <div className="flex items-center justify-between px-5 mb-4 anim-up d2">
        <h2 style={{
          fontFamily: 'var(--font-cormorant)',
          fontWeight: 600,
          fontSize: '20px',
          color: '#F0E4CC',
        }}>
          Nuestros productos
        </h2>
        <span style={{ fontSize: '12px', color: '#E8A420', fontFamily: 'var(--font-dm-sans)' }}>
          Ver todos →
        </span>
      </div>

      {/* ── Category Rail ─────────────────────────── */}
      <div
        className="flex gap-2 overflow-x-auto hide-scrollbar px-5 mb-5 anim-up d2"
        style={{ paddingBottom: '2px' }}
      >
        {categories.map(cat => {
          const active = activeCategory === cat
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="flex-shrink-0 rounded-full transition-all duration-200"
              style={{
                padding: '7px 16px',
                fontSize: '12px',
                fontFamily: 'var(--font-dm-sans)',
                fontWeight: active ? 600 : 400,
                background: active ? '#E8A420' : '#181209',
                color: active ? '#0C0806' : '#5A4A38',
                border: active ? 'none' : '1px solid #261E10',
                letterSpacing: '0.02em',
              }}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {/* ── Product Grid ──────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 px-4 anim-up d3">
        {grid.map((product, i) => (
          <ProductCard
            key={product.id}
            product={product}
            delay={`${0.18 + i * 0.06}s`}
          />
        ))}
      </div>

      {/* ── Divider + Promo ───────────────────────── */}
      <div className="px-4 mt-8 anim-up d4">
        <div
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1A1209 0%, #0E0907 100%)',
            border: '1px solid rgba(232,164,32,0.08)',
          }}
        >
          <GoldShimmer />
          <p style={{ fontSize: '11px', fontFamily: 'var(--font-dm-sans)', color: '#5A4A38', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>
            ¿Tienes un evento?
          </p>
          <p style={{ fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontSize: '22px', color: '#F0E4CC', marginBottom: '14px' }}>
            Hacemos pancakes artísticos en tu celebración
          </p>
          <Link href="/products/eventos">
            <span
              className="inline-flex items-center gap-1.5 rounded-lg"
              style={{
                padding: '9px 18px',
                background: 'rgba(232,164,32,0.1)',
                border: '1px solid rgba(232,164,32,0.2)',
                fontSize: '12px',
                fontFamily: 'var(--font-dm-sans)',
                fontWeight: 600,
                color: '#E8A420',
              }}
            >
              Cotizar evento
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E8A420" strokeWidth="2.2" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}
