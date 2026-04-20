import { NextResponse } from 'next/server'
import { fetchAppConfig } from '@/services/config.service'
import { parseConfig } from '@/lib/config.parser'
import { quoteShippingByDistanceKm } from '@/domain/shipping.quote'

type QuoteRequest = {
  destinationPostalCode?: string
}

async function geocodePostalCode(postalCode: string, apiKey: string) {
  const attempts = [
    {
      address: postalCode,
      components: `postal_code:${postalCode}|country:MX`,
    },
    {
      address: `${postalCode}, Monterrey, Nuevo León, México`,
    },
    {
      address: `Código postal ${postalCode}, Nuevo León, México`,
    },
  ]

  for (const attempt of attempts) {
    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json')
    url.searchParams.set('address', attempt.address)
    url.searchParams.set('region', 'mx')
    url.searchParams.set('language', 'es')
    url.searchParams.set('key', apiKey)

    if (attempt.components) {
      url.searchParams.set('components', attempt.components)
    }

    const response = await fetch(url.toString(), { cache: 'no-store' })
    const payload = await response.json()
    const location = payload.results?.[0]?.geometry?.location

    if (payload.status === 'OK' && location) {
      return {
        lat: location.lat,
        lng: location.lng,
      }
    }
  }

  throw new Error(`No se pudo geocodificar el código postal ${postalCode}.`)
}

async function getDrivingDistanceKm(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  apiKey: string,
) {
  const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json')
  url.searchParams.set('origins', `${origin.lat},${origin.lng}`)
  url.searchParams.set('destinations', `${destination.lat},${destination.lng}`)
  url.searchParams.set('mode', 'driving')
  url.searchParams.set('units', 'metric')
  url.searchParams.set('key', apiKey)

  const response = await fetch(url.toString(), { cache: 'no-store' })
  const payload = await response.json()

  const element = payload.rows?.[0]?.elements?.[0]

  if (payload.status !== 'OK' || element?.status !== 'OK' || !element?.distance?.value) {
    throw new Error('No se pudo calcular la distancia entre los códigos postales.')
  }

  return element.distance.value / 1000
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as QuoteRequest
    const destinationPostalCode = body.destinationPostalCode?.trim()
    const originPostalCode = process.env.SHIPPING_ORIGIN_POSTAL_CODE?.trim()
    const googleMapsKey =
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || ''

    if (!googleMapsKey) {
      return NextResponse.json(
        { error: 'Falta configurar la clave de Google Maps.' },
        { status: 500 },
      )
    }

    if (!originPostalCode) {
      return NextResponse.json(
        { error: 'Falta configurar el código postal fijo de origen.' },
        { status: 500 },
      )
    }

    if (!destinationPostalCode) {
      return NextResponse.json(
        { error: 'Debes indicar el código postal de destino.' },
        { status: 400 },
      )
    }

    const [origin, destination, appConfig] = await Promise.all([
      geocodePostalCode(originPostalCode, googleMapsKey),
      geocodePostalCode(destinationPostalCode, googleMapsKey),
      fetchAppConfig(),
    ])

    const distanceKm = await getDrivingDistanceKm(origin, destination, googleMapsKey)
    const parsedConfig = parseConfig(appConfig)
    const shippingQuote = quoteShippingByDistanceKm(distanceKm, parsedConfig.shipping)

    return NextResponse.json({
      distanceKm,
      price: shippingQuote.price,
      tierKm: shippingQuote.tierKm,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo cotizar el envío.'

    return NextResponse.json({ error: message }, { status: 400 })
  }
}
