"use client"

import Footer from '@/components/Footer'
import { useHomeData } from '@/features/home/hooks/useHomeData'
import { HomeTopBar } from '@/features/home/components/HomeTopBar'
import { HomeGreeting } from '@/features/home/components/HomeGreeting'
import { HomeSectionHeader } from '@/features/home/components/HomeSectionHeader'
import { FeaturedProductCard } from '@/features/home/components/FeaturedProductCard'
import { ProductGrid } from '@/features/home/components/ProductGrid'
import { EventPromo } from '@/features/home/components/EventPromo'
import { HomeTestimonials } from '@/features/home/components/HomeTestimonials'
import { HomeFaq } from '@/features/home/components/HomeFaq'

export default function HomeScreen() {
  const { featuredProduct, greeting, products, loading, error } = useHomeData()

  return (
    <main className="desktop-nav-offset mx-auto min-h-dvh w-full overflow-x-hidden pb-[calc(120px+env(safe-area-inset-bottom,0px))] pt-16 md:pt-24">
      <HomeTopBar />
      <HomeGreeting greeting={greeting} />

      {error ? (
        <section className="mx-auto max-w-3xl px-5 py-16 sm:px-8 lg:px-10">
          <div className="rounded-[1.8rem] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        </section>
      ) : loading ? (
        <section className="mx-auto max-w-3xl px-5 py-16 sm:px-8 lg:px-10">
          <div className="rounded-[1.8rem] border border-[rgba(88,55,34,0.12)] bg-[rgba(255,252,245,0.82)] px-5 py-4 text-sm text-[#765E4B]">
            Cargando experiencias Nappan...
          </div>
        </section>
      ) : (
        <>
          {featuredProduct ? (
            <section id="historia" className="mx-auto w-full max-w-6xl px-5 py-6 sm:px-8 lg:px-10 anim-up d2">
              <FeaturedProductCard product={featuredProduct} />
            </section>
          ) : null}

          {products.length > 0 ? (
            <section id="productos" className="py-10 sm:py-14">
              <HomeSectionHeader />
              <ProductGrid products={products} />
            </section>
          ) : null}

          <section id="eventos">
            <EventPromo />
          </section>

          <HomeTestimonials />
          <HomeFaq />
          <Footer />
        </>
      )}
    </main>
  )
}
