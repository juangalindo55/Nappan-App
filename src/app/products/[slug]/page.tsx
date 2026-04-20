import { notFound, redirect } from 'next/navigation'

type ProductSlugPageProps = {
  params: Promise<{ slug: string }>
}

export default async function ProductSlugPage({ params }: ProductSlugPageProps) {
  const { slug } = await params

  if (slug === 'lunchbox') {
    redirect('/order/lunchbox')
  }

  if (slug === 'fitbar') {
    redirect('/order/fitbar')
  }

  if (slug === 'eventos') {
    redirect('/menu?category=live-event')
  }

  if (slug === 'nappanbox') {
    redirect('/order/artistic-box')
  }

  notFound()
}
