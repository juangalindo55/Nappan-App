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
    <div
      className="hide-scrollbar overflow-y-auto overflow-x-hidden"
      style={{
        minHeight: '100dvh',
        paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <HomeTopBar />
      <HomeGreeting greeting={greeting} />

      {error ? (
        <div className="mx-4 rounded-lg border border-red-400/25 bg-red-500/10 p-4 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      {loading ? (
        <>
          <div className="px-4 mb-6">
            <div className="h-40 rounded-lg bg-[#181209] animate-pulse" />
          </div>
          <div className="px-4">
            <div className="h-8 w-32 bg-[#181209] rounded mb-4 animate-pulse" />
            <div className="grid grid-cols-1 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 rounded-lg bg-[#181209] animate-pulse" />
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {featuredProduct ? (
            <div className="px-4 mb-6">
              <FeaturedProductCard
                key={featuredProduct.id}
                product={featuredProduct}
              />
            </div>
          ) : null}

          <HomeSectionHeader />
          <ProductGrid products={products} />
          <EventPromo />
        </>
      )}
    </div>
  )
}
