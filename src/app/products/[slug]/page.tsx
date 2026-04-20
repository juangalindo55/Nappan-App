import { notFound, redirect } from 'next/navigation'

type ProductSlugPageProps = {
  params: { slug: string }
}

export default function ProductSlugPage({ params }: ProductSlugPageProps) {
  const { slug } = params

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
