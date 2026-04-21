# Nappan App (rewrite)

Aplicacion web de pedidos para Nappan, construida con Next.js App Router, Supabase y Zustand.

Incluye:
- catalogo y flujo de pedido por categorias (`Lunch Box`, `Fit Bar`, `Artistic Box`, etc.)
- carrito editable con calculo de totales
- perfil de cliente por telefono
- reconocimiento de `membership_tier` y descuento dinamico desde `app_config`
- cotizador de envio por codigo postal usando Google Maps APIs

## Stack

- `Next.js 16` + `React 19`
- `TypeScript`
- `Tailwind CSS v4`
- `Supabase` (DB + API)
- `Zustand` (estado del carrito)

## Requisitos

- Node.js 20+
- npm 10+
- Proyecto Supabase configurado
- API key de Google Maps (Geocoding + Distance Matrix) para cotizar envio

## Instalacion local

1. Clona el repositorio
2. Instala dependencias

```bash
npm install
```

3. Crea tu archivo `.env.local` en la raiz
4. Ejecuta el proyecto

```bash
npm run dev
```

Abre `http://localhost:3000`.

## Variables de entorno

Configura estas variables en `.env.local` (y en Vercel):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Opcional: tabla(s) de clientes a consultar (coma separadas)
# Si no se define, usa "customers"
NEXT_PUBLIC_CUSTOMER_TABLES=customers

# Envio / Google Maps
SHIPPING_ORIGIN_POSTAL_CODE=
GOOGLE_MAPS_API_KEY=

# Opcional (si ya lo usan en frontend)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

## Configuracion de datos (Supabase)

### 1) Tabla de clientes

La app espera una tabla `public.customers` con al menos:
- `phone` (telefono del cliente)
- `name` (nombre)
- `membership_tier` (ej. `business`, `premium`)

El lookup de telefono es flexible (`10 digitos`, `52`, `+52`, `521`, `+521` y variantes con separadores).

### 2) Descuentos por tier en `app_config`

La fuente de verdad para descuento esta en `app_config`:
- `key = tier_business_discount`, `value = 15`
- `key = tier_premium_discount`, `value = 10`

Cuando el cliente tiene `membership_tier`, la app busca `tier_<membership_tier>_discount` y aplica ese porcentaje.

### 3) Politicas RLS

Si usas cliente anonimo desde frontend, necesitas politicas de lectura/escritura acordes para `customers` y lectura para `app_config`.

## Scripts disponibles

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Estructura del proyecto

```text
src/
  app/                      # rutas (App Router)
    api/shipping/quote/     # cotizador de envio
    cart/                   # carrito
    profile/                # perfil de cliente
  features/                 # pantallas por dominio
  domain/                   # logica pura (pricing, validaciones, quote)
  services/                 # integraciones con Supabase y config
  store/                    # Zustand stores
  hooks/                    # hooks de UI y datos
  lib/                      # utilidades compartidas (supabase, parser, session)
```

## Flujo de perfil y descuento

1. En `Perfil`, se busca cliente por telefono en `customers`.
2. Se lee `membership_tier`.
3. Se consulta `app_config` para obtener el descuento (`tier_<tier>_discount`).
4. Se persiste el perfil del cliente en `localStorage`.
5. En `Carrito`, se lee esa sesion y se aplica el `%` al total.

## Cotizacion de envio

Endpoint: `POST /api/shipping/quote`

Entrada:
- `destinationPostalCode`

Proceso:
- Geocodifica CP origen (fijo) y destino con Google Geocoding API
- Calcula distancia con Google Distance Matrix API
- Lee tiers de envio desde `app_config`
- Devuelve `distanceKm`, `price`, `tierKm`

## Deploy en Vercel

1. Importa el repo en Vercel
2. Configura todas las variables de entorno
3. Deploy de la rama deseada (`rewrite/nappan`)

Recomendado:
- Mantener `Production`, `Preview` y `Development` con variables separadas
- Validar `npm run lint` y `npm run build` antes de merge

## Troubleshooting rapido

- **No encuentra cliente por telefono**
  - Verifica columna `phone` en `customers`
  - Revisa politicas RLS de `SELECT`
  - Confirma formato real almacenado

- **Muestra tier pero no aplica descuento**
  - Verifica `membership_tier` del cliente
  - Revisa `app_config.key` (`tier_<tier>_discount`) y `value` numerico
  - Asegura acceso de lectura a `app_config`

- **Error en cotizar envio**
  - Revisa `GOOGLE_MAPS_API_KEY`
  - Habilita Geocoding API y Distance Matrix API
  - Verifica `SHIPPING_ORIGIN_POSTAL_CODE`

## Contribucion

1. Crea una rama desde `rewrite/nappan`
2. Haz cambios pequenos y enfocados
3. Corre `npm run lint` y `npm run build`
4. Abre PR con resumen y plan de pruebas
