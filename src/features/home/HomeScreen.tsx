'use client'

import { EventPromo } from './components/EventPromo'
import { FeaturedProductCard } from './components/FeaturedProductCard'
import { HomeGreeting } from './components/HomeGreeting'
import { HomeSectionHeader } from './components/HomeSectionHeader'
import { HomeTopBar } from './components/HomeTopBar'
import { ProductGrid } from './components/ProductGrid'
import { useHomeData } from './hooks/useHomeData'

export default function HomeScreen() {
  const { featuredProduct, greeting, products, loading, error } = useHomeData()

  return (
    <main className="desktop-nav-offset hide-scrollbar min-h-dvh overflow-x-hidden pb-[calc(88px+env(safe-area-inset-bottom,0px))] md:pb-0">
      <div className="md:hidden">
        <HomeTopBar />
      </div>
      <HomeGreeting greeting={greeting} />

      {error ? (
        <div className="mx-auto mb-6 max-w-6xl px-5 sm:px-8 lg:px-10">
          <div className="rounded-2xl border border-red-300/50 bg-red-50/80 p-4 text-sm text-red-900">
            {error}
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
          <div className="h-72 animate-pulse rounded-[2rem] bg-[#F7EEDC]" />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-44 animate-pulse rounded-[1.6rem] bg-[#F7EEDC]" />
            ))}
          </div>
        </div>
      ) : (
        <>
          {featuredProduct ? (
            <section className="mx-auto w-full max-w-6xl px-5 pb-12 sm:px-8 md:pb-16 lg:px-10">
              <FeaturedProductCard
                key={featuredProduct.id}
                product={featuredProduct}
              />
            </section>
          ) : null}

          <section className="pb-4 md:pb-8">
            <HomeSectionHeader />
            <ProductGrid products={products} />
          </section>

          <EventPromo />
        </>
      )}
    </main>
  )
}
