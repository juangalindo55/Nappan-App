'use client'

import { EventPromo } from './components/EventPromo'
import { FeaturedProductCard } from './components/FeaturedProductCard'
import { HomeGreeting } from './components/HomeGreeting'
import { HomeSectionHeader } from './components/HomeSectionHeader'
import { HomeTopBar } from './components/HomeTopBar'
import { ProductGrid } from './components/ProductGrid'
import { useHomeData } from './hooks/useHomeData'

export default function HomeScreen() {
  const { featuredProduct, greeting, products } = useHomeData()

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
    </div>
  )
}
