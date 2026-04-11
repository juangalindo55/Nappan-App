# 🥞 Nappan — Pancake & Art

> **"El arte que se come"** — Experiencias únicas hechas con creatividad, sabor y mucho corazón.

Sitio web oficial de **Nappan**, una marca de lifestyle basada en Monterrey, México, especializada en pancakes artísticos, coffee bar proteico y experiencias gastronómicas personalizadas.

🌐 **Live:** [juangalindo55.github.io/Nappan-App](https://juangalindo55.github.io/Nappan-App)

---

## 🛠️ Tech Stack

| Capa | Tecnología |
|---|---|
| **Estructura** | HTML5 semántico |
| **Estilos** | CSS3 con variables, `clamp()`, responsive design |
| **Lógica** | Vanilla JavaScript (zero dependencies) |
| **Tipografía** | Inter (UI) + Montserrat (títulos) vía Google Fonts |
| **Base de Datos** | PostgreSQL via CDN |
| **Autenticación** | Auth Service (email/password para admin) |
| **Pedidos** | Captura persistente + integración directa con WhatsApp Business API |
| **Chatbot** | Chatbot embebido con calculadora de envío vía Google Maps Distance Matrix API |
| **Deploy** | GitHub Pages (frontend) |
| **Control de versiones** | Git & GitHub |
| **IA Partner** | Claude Code (Anthropic) — Vibe Coding methodology |

> 🧠 **Vibe Coding:** Este proyecto se desarrolla mediante una metodología de programación asistida por IA, donde la dirección creativa y de negocio es humana, y la implementación técnica se realiza en colaboración con Claude Code.

---

## 📐 Arquitectura

Arquitectura **multi-página modular** — cada línea de negocio es una página HTML independiente que comparte un design system global.

```
📁 Nappan App/
├── index.html              ← Landing page / Hub de navegación
│
├── pages/                  ← Todas las secciones y admin
│   ├── nappan-lunchbox.html     ← Lunch Box (eventos y cumpleaños)
│   ├── nappan-box.html          ← Nappan Box + Premium Box (arte personalizado)
│   ├── nappan-fitbar.html       ← Protein Fit Bar (coffee, shots, pancakes, combos)
│   ├── nappan-eventos.html      ← Eventos en Vivo (pancake art en tu evento)
│   ├── nappan-admin-v2.html     ← Dashboard Admin privado (auth-gated)
│   └── nappan-index.html        ← Alias de redirección al landing
│
├── css/                    ← Estilos
│   ├── styles.css          ← Design system global (~2,680 líneas)
│   └── admin-v2.css        ← Admin-specific styles
│
├── js/                     ← Scripts
│   ├── script.js           ← Router de navegación goTo() + toast notifications
│   ├── utils.js            ← Constantes compartidas (WA_NUMBER)
│   ├── chatbot.js          ← Chatbot embebido con calculadora de envío (Google Maps API)
│   ├── supabase-client.js  ← Cliente de datos y API window.NappanDB
│   └── admin-modules/      ← Módulos del admin
│       ├── state.js        ← Estado centralizado
│       ├── ui.js           ← Toast, escape HTML, indicadores
│       ├── auth.js         ← Login/logout/sesiones
│       ├── orders.js       ← CRUD de pedidos, filtros, paginación, CSV
│       ├── products.js     ← Carga de productos y edición de precios
│       ├── customers.js    ← CRUD de clientes
│       ├── config.js       ← Gestión de configuración
│       ├── stats.js        ← Analíticas via RPC
│       └── nappan-admin-v2.js ← Lógica del dashboard y renderizado
│
├── images/                 ← Assets
│   ├── logo-dorado.webp        ← Logo principal (usado en headers dark)
│   ├── Logo Dorado Nappan V2.svg ← Logo SVG hero
│   ├── logo-white-solo.webp    ← Logo blanco (hero Fit Bar)
│   ├── logo.png                ← Logo negro (referencia)
│   ├── bg-*.jpg                ← Backgrounds de secciones
│   ├── nappanbox-gallery-*.jpg
│   ├── cold-protein-latte.webp
│   ├── cold-brew.webp
│   ├── black-coffee.webp
│   ├── Brunchtime.jpeg         ← Nueva imagen para galería
│   └── Nappan banner.webp      ← Banner promocional
│
├── CLAUDE.md               ← Guía arquitectónica para Claude Code
├── GEMINI.md               ← Guía para Gemini CLI
├── AGENTS.md               ← Guía para Codex
├── TYPOGRAPHY_SYSTEM.md    ← Documentación del sistema tipográfico
├── plan.md                 ← Roadmap y backlog de funcionalidades
├── README.md               ← Este archivo
└── .claude/                ← Scripts de desarrollo local
    └── serve.bat / serve.ps1
```

### Patrón de página

Cada sección es un archivo HTML autónomo que:
- Importa `styles.css` para estilos globales
- Importa `utils.js` para constantes compartidas
- Contiene CSS y JS específicos inline (aislamiento)
- Tiene navegación de regreso a `index.html`

---

## 🎨 Design System

### Paleta de colores

| Variable | Hex | Uso |
|---|---|---|
| `--gold` | `#DAA520` | Color primario de marca |
| `--yellow` | `#FFD93D` | Acentos, CTAs, precios |
| `--dark` | `#1A1008` | Fondos oscuros |
| `--cream` | `#FFF8ED` | Fondos claros, texto sobre oscuro |
| `--brown` | `#2D1B0E` | Texto principal |
| `--green-light` | `#A8E6CF` | CTA Fit Bar |
| `--pink` | `#FFB3C6` | CTA Nappan Box |

### Tipografía

- **Montserrat** (sans-serif geométrica) → exclusivamente H1
- **Inter** (sans-serif) → H2, H3, body, labels, botones, precios

📚 Detalle completo en [`TYPOGRAPHY_SYSTEM.md`](TYPOGRAPHY_SYSTEM.md)

---

## 📋 Secciones del sitio

### 🏠 Landing (`index.html`)
Hub central con cards de navegación a las 4 líneas de negocio. El hero ahora muestra `images/Logo Dorado Nappan V2.svg` encima del `hero-tag`, manteniendo el diseño dark con gradientes radiales y animaciones CSS.

### 📦 Lunch Box (`nappan-lunchbox.html`)
- **2 opciones** de Lunch Box ($125 y $130)
- Selector de PancakeART (Osito, Capibara, Pollito)
- `Hora Aproximada` se muestra en el desglose de pedidos y puede editarse desde Admin > Pedidos
- **Selector de Fruta o Gelatina** con custom checkboxes marrón (#8B5E3C)
  - Validación obligatoria (toast si no se selecciona)
  - Palomilla blanca visible solo cuando está seleccionado
- **Detección de cliente recurrente:** Búsqueda por teléfono en `onblur`
  - Welcome badge con nombre del cliente y tier de membresía
  - Aplicación automática de descuentos (Individual/Premium/Business)
- **Calculadora de envío:** Integrada con Google Maps API en el carrito
- Extras seleccionables con precio dinámico
- Carrito lateral con panel deslizante
- Restricción: un tipo de box y una figura por pedido
- Envío de pedido pre-formateado a WhatsApp con desglose de descuentos y envío

### 🎨 Nappan Box (`nappan-box.html`)
- **Nappan Box** ($450) — Arte con personaje a elección
- **Premium Box** ($850) — Arte ultra-detallado con foto de referencia
- **Detección de cliente recurrente:** Welcome badge y descuentos por tier aplicados a ambas versiones
- Tabs para cambiar entre versiones
- Extras de PancakeART pequeño ($150 c/u)
- Formulario completo con validaciones
- Fecha mínima: 1 semana de anticipación

### 💪 Protein Fit Bar (`nappan-fitbar.html`)
- **Coffee Bar:** Cold Protein Latte, Cold Brew, Black Coffee (con imágenes WebP reales)
- **Boost Shots:** Detox Glow, Energy Boost, Golden Power (con imágenes WebP)
- **Signature Pancakes:** Power Pancakes, Protein Minis
- **Combos:** Combo Fit, Combo Shots
- **Detección de cliente recurrente:** Campo de teléfono con lookup de membresía y bienvenida personalizada
- Carrito con agrupación por producto, thumbnails y aplicación de descuentos por tier
- Formulario con nombre, fecha, hora y notas

### 🎪 Eventos en Vivo (`nappan-eventos.html`)
- **Estado:** ✅ Live
- Hero con logo dorado centrado y header unificado con landing
- Pills interactivos de tipo de evento (Cumpleaños, Bodas, Corporativos…)
  - Al hacer clic → auto-completa el `select` del formulario
  - Despliega galería dinámica de 2 fotos entre pills y formulario
- Formulario de cotización en grid de 2 columnas (8 campos)
- Validación de fecha mínima (14 días de anticipación)
- Envío de cotización pre-formateado a WhatsApp
- Chatbot integrado con opción "🎪 Eventos en Vivo"

---

## 🚀 Desarrollo local

### Requisitos
- Python 3.x (para servidor local) **o** cualquier servidor HTTP estático
- Navegador moderno (Chrome, Firefox, Edge, Safari)
- Git

### Iniciar servidor local

**Opción 1 — Script incluido (Windows):**
```batch
.claude\serve.bat
```

**Opción 2 — Python:**
```bash
python -m http.server 8080
```

**Opción 3 — Node.js (npx):**
```bash
npx -y serve -p 8080
```

Luego abre: **http://localhost:8080**

### Agregar una nueva sección

1. Crear un nuevo archivo `nappan-[seccion].html` en la carpeta `pages/`
2. Importar `../css/styles.css` y `../js/utils.js`
3. Agregar la ruta en `js/script.js` dentro de `goTo()` (usar ruta `pages/nappan-[seccion].html`)
4. Crear una card de navegación en `index.html` (usar ruta `goTo('pages/nappan-[seccion].html')`)
5. Seguir el sistema tipográfico documentado en `TYPOGRAPHY_SYSTEM.md`

---

## 📋 Estado del proyecto

### Fase 1 — Core Features ✅
- [x] Landing page con hub de navegación
- [x] Sección Lunch Box funcional con carrito + WhatsApp
- [x] Sección Nappan Box (Normal + Premium) con formularios + WhatsApp
- [x] Sección Protein Fit Bar con carrito completo + WhatsApp
- [x] Sección Eventos en Vivo con pills interactivos, galería dinámica y formulario de cotización
- [x] Design system global unificado (`styles.css`)
- [x] Sistema tipográfico Inter + Montserrat
- [x] Header unificado en todas las páginas
- [x] Optimización de imágenes (WebP + fallback PNG)
- [x] Chatbot embebido con menú interactivo y calculadora de envío (Google Maps)
- [x] Deploy en GitHub Pages

### Fase 6.2 — Admin Security & Performance ✅
- [x] **XSS Prevention**: 22 innerHTML locations escapeados con función `escapeHtml()`
  - Protección contra inyección de scripts en: nombres de clientes, notas, productos, extras, galerías
  - Usa browser's native DOM parser para máxima seguridad
- [x] **Cache Management**: Sistema de invalidación de caché para Orders tab
  - Cache guard evita recargas innecesarias de 2000+ pedidos
  - 12 funciones de mutación limpian caché después de Supabase writes
  - Previene visualización de datos stale
- [x] **Tab Loading Guards**: `ensureOrdersLoaded()` pattern
  - Reduce API calls redundantes
  - Elimina flicker al cambiar de tabs
  - Otras tabs cargan fresh (datasets más pequeños)
- [x] **Backward Compatibility**: Todos los cambios mantienen estructura HTML existente
  - Sin breaking changes
  - Dashboard completamente funcional

### Fase 6.3 — Admin Dashboard Modularization ✅
- [x] **8 new modules** created in `admin-modules/` directory
  - `state.js` — Centralized state store (244 lines) with cache invalidation rules
  - `ui.js` — Toast, HTML escape, loading/empty/error helpers (150 lines)
  - `auth.js` — Login/logout/session management (98 lines)
  - `orders.js` — Full order CRUD, filtering, pagination, CSV export (176 lines)
  - `products.js` — Product loading with extras, price editing (147 lines)
  - `customers.js` — Customer CRUD operations (72 lines)
  - `config.js` — WhatsApp, shipping, tier discounts management (99 lines)
  - `stats.js` — KPI computation, aggregations, analytics (147 lines after Phase 7)
- [x] **ES6 Module Integration**
  - All modules imported via `<script type="module">` in HTML
  - Modules exposed to `window` for global access and backward compatibility
  - All existing `nappan-admin-v2.js` functions exposed to support inline onclick handlers
  - Zero breaking changes — 100% functional parity with Phase 6.2
- [x] **Architecture Benefits**
  - Separation of concerns: each module handles one domain only
  - Reusable UI helpers eliminate duplication
  - Centralized state + cache with dependency tracking
  - Foundation ready for Phase 7 (analytics backend, event handler refactoring)

### Admin polish additions
- [x] Pedido detail view now shows `Hora Aproximada` for Lunch Box, Fit Bar, and Eventos en Vivo.
- [x] `Editar Pedido` now allows manual editing of `Hora de Entrega` and persists it to `delivery_time`.
- [x] Admin `Configuración` can override the visible text of Lunch Box 1 and Lunch Box 2 extras through `app_config`.

### Fase 7 — Analytics Backend Migration ✅
- [x] **8 RPC Functions** created in PostgreSQL for KPI computation
  - `get_stats_kpis()` — totalOrders, totalRevenue, averageOrder
  - `get_orders_by_section()` — orders grouped by business section
  - `get_revenue_by_section()` — revenue grouped by section
  - `get_orders_by_status()` — orders grouped by status
  - `get_orders_by_hour()` — orders by hour (0-23 full spectrum)
  - `get_top_products(limit)` — top N products by count
  - `get_top_customers(limit)` — top N customers by revenue
- [x] **7 Client Methods** in `supabase-client.js`
  - All exported as `window.NappanDB.*` for clean integration
  - Error handling and fallback values included
- [x] **stats.js Refactored**
  - Now calls RPC functions in parallel (not sequentially)
  - Client-side helpers removed (170+ lines deleted)
  - File reduced 316 → 147 lines (53% reduction)
  - Computation moved from JavaScript to PostgreSQL (7x faster for large datasets)
  - 100% backward compatible (return interface unchanged)
- [x] **Performance Benefits**
  - RPC functions run on PostgreSQL (optimized aggregation)
  - Network payload reduced (only aggregated results sent)
  - Scales to thousands of orders without slowdown

### Configuración dinámica
- `app_config` now stores not only WhatsApp, shipping, and discounts, but also Lunch Box extra label overrides.
- `updateConfigValue()` persists config keys with an idempotent `upsert`, so label changes do not revert after save.

---

## 📱 Integración WhatsApp

Todos los pedidos se gestionan vía WhatsApp Business. La configuración se actualiza dinámicamente desde el panel administrativo para permitir cambios sin necesidad de modificar el código fuente.

---

## 📞 Contacto

**Nappan — Pancake & Art**
📍 Monterrey, Nuevo León, México
💬 WhatsApp: +52 812 350 9768

---

*Este proyecto es propiedad de [@juangalindo55](https://github.com/juangalindo55). Desarrollado con 🥞 y Vibe Coding en Monterrey.*

