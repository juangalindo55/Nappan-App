# GEMINI.md - Nappan App Architecture & Guidelines

Este archivo proporciona las directrices y estándares para trabajar con el repositorio **Nappan** utilizando Gemini CLI.

## Resumen del Proyecto

**Nappan** es una aplicación de marca de estilo de vida (Lunch Box, Nappan Box, Protein Fit Bar y Eventos en Vivo) construida con HTML5 puro, CSS3 y JavaScript Vanilla.
**Estado Actual:** Sitio público modular multi-página. Fases 1-7 completadas, incluyendo integración con Supabase, captura de pedidos, precios dinámicos, panel de administración modular, seguridad RLS y migración de analíticas a funciones RPC.

## Ejecución Local

Para iniciar el servidor estático local en el puerto 8080:

```bash
# Desde la raíz del proyecto (Windows)
.claude\serve.bat
```
Luego abrir http://localhost:8080 en el navegador.

## Arquitectura y Estructura de Archivos

El proyecto utiliza una estructura **modular multi-página**. Cada línea de negocio es un archivo HTML independiente.

### Puntos de Entrada
- `index.html`: Landing page principal y hub de navegación.
- `pages/nappan-index.html`: Alias de redirección utilizado por el logo de administración.

### Recursos Compartidos
- `css/styles.css`: Sistema de diseño global, variables CSS y reglas compartidas.
- `js/script.js`: Router de navegación (`goTo(page)`) y notificaciones.
- `js/utils.js`: Constantes compartidas (ej. `WA_NUMBER`).
- `js/supabase-client.js`: Cliente de Supabase y API `window.NappanDB`.

### Páginas de Sección (en carpeta `pages/`)
| Archivo | Sección |
|---|---|
| `pages/nappan-lunchbox.html` | Lunch Box - eventos y cumpleaños |
| `pages/nappan-box.html` | Nappan Box + Premium Box - pancake art personalizado |
| `pages/nappan-fitbar.html` | Protein Fit Bar - café, shots, pancakes, combos |
| `pages/nappan-eventos.html` | Eventos en Vivo - pancake art en vivo |

## Sistema de Diseño (Marca NAPPAN)

### Tipografía
- **Montserrat**: Exclusivamente para encabezados H1.
- **Inter**: H2, H3, cuerpo, etiquetas, botones y precios.
*Ver `TYPOGRAPHY_SYSTEM.md` para especificaciones completas.*

### Colores Principales
- `--gold` (#DAA520): Color de marca primario.
- `--yellow` (#FFD93D): Acentos, CTAs, precios.
- `--dark` (#1A1008): Fondos oscuros.
- `--cream` (#FFF8ED): Fondos claros, texto sobre oscuro.

## Integración con Supabase

Backend basado en **PostgreSQL + Auth + RLS**.

### API del Cliente: `window.NappanDB`
- **Público:** `saveOrder()`, `loadProducts()`, `loadExtras()`, `loadAppConfig()`.
- **Admin:** Gestión de clientes, actualización de pedidos y métodos del dashboard.
- **Analíticas (Fase 7):** Orquestación de funciones RPC (`getStatsKpis`, `getTopProducts`, etc.).

## Configuración de Entorno & Orden de Carga de Scripts (Despliegue en Vercel)

**Crítico:** El despliegue en Vercel utiliza funciones serverless para inyectar variables de entorno de forma segura. El orden de carga de scripts es esencial y no debe modificarse.

### Arquitectura

1. **`/api/config.js`** (Función serverless de Vercel)
   - Retorna JSON con 4 variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `GOOGLE_MAPS_API_KEY`, `WHATSAPP_NUMBER`
   - Lee desde Environment Variables de Vercel (no desde archivos .env)
   - Desactiva caching para garantizar valores frescos en cada despliegue

2. **`js/config.js`** (Bootstrap del lado del cliente)
   - Inicializa `window.NappanConfig` con valores por defecto (localhost)
   - Llama a `loadConfig()` que hace fetch a `/api/config` de forma asíncrona
   - Establece `window.NappanConfig.READY = true` al completar (éxito o fallback)
   - Llama a `window.reinitializeSupabase()` para inicializar el cliente de Supabase con credenciales reales
   - Llama a `initGoogleMapsAPI()` para cargar Google Maps (solo una vez globalmente)
   - **Guard:** Si ya está READY o cargando, retorna early para evitar ejecuciones duplicadas

3. **`js/supabase-client.js`** (Inicialización del cliente de Supabase)
   - Exporta `window.reinitializeSupabase()` que `config.js` llama
   - **Guard:** Salta init si la URL es localhost Y config.READY !== true
   - Solo expone `window.NappanDB` después de crear el cliente exitosamente con credenciales reales

4. **Scripts de página** (Todas las secciones + admin)
   - Incluir `js/config.js` primero (carga y hace fetch de configuración)
   - Incluir `js/supabase-client.js` segundo
   - Hacer polling de `window.NappanDB` (máx 10 segundos) antes de usarlo

5. **Módulos de admin** (`js/admin-modules/`)
   - Módulo de auth (`auth.js`) tiene `getDb()` asíncrono que espera a `window.NappanDB`
   - Módulo principal (`nappan-admin-v2.js`) también tiene `getDb()` asíncrono

6. **Google Maps** (`js/config.js` + `js/chatbot.js`)
   - `config.js` carga Google Maps (guard previene duplicados)
   - `chatbot.js` espera a `window.google.maps` en lugar de cargar su propio script

### Por Qué Es Importante

- Las variables de entorno de Vercel solo están disponibles en tiempo de request
- Las condiciones de carrera ocurren cuando la carga de config compite con la inicialización síncrona
- El timing de module scripts causa que `window.Auth` se exponga de forma asíncrona
- La navegación entre páginas recarga config.js múltiples veces; los guards previenen inyecciones duplicadas

## Panel de Administración (`nappan-admin-v2.html`)

El panel está modularizado en `admin-modules/`:
- `state.js`: Store centralizado del estado.
- `auth.js`: Manejo de sesiones y login.
- `orders.js`, `products.js`, `customers.js`: Módulos CRUD.
- `config.js`: Configuración global (WhatsApp, envíos, descuentos).
- `stats.js`: Analíticas optimizadas mediante RPC.

## Reglas de Desarrollo

1. **Clean CSS:** No añadir estilos redundantes. Consultar `styles.css` antes de crear nuevas clases. Estilos específicos de página van en el scope `body.page-*`.
2. **Modular Growth:** Para añadir una nueva línea de negocio, crear un nuevo `nappan-[seccion].html`.
3. **Navegación:** Actualizar `goTo()` en `script.js` al añadir páginas.
4. **Imágenes:** Preferir formato **WebP** para nuevos productos.
5. **WhatsApp:** Usar siempre la constante `WA_NUMBER` cargada desde la configuración, nunca hardcodear el número.
6. **Encabezado Unificado:** Mantener el patrón de header (Grid 1fr auto 1fr) en todas las secciones.
7. **Seguridad Admin:** Las mutaciones de base de datos sensibles deben usar funciones RPC con `SECURITY DEFINER` para evitar violaciones de RLS por parte de usuarios anónimos.
8. **Rendimiento Admin:** Evitar bucles de carga secuenciales; preferir cargas en paralelo o batches.
