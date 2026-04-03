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
| **Base de Datos** | Supabase (PostgreSQL) vía CDN |
| **Autenticación** | Supabase Auth (email/password para admin) |
| **Pedidos** | Captura en BD + integración directa con WhatsApp Business API |
| **Chatbot** | Chatbot embebido con calculadora de envío vía Google Maps Distance Matrix API |
| **Deploy** | GitHub Pages (frontend) + Supabase (backend) |
| **Control de versiones** | Git & GitHub |
| **IA Partner** | Claude Code (Anthropic) — Vibe Coding methodology |

> 🧠 **Vibe Coding:** Este proyecto se desarrolla mediante una metodología de programación asistida por IA, donde la dirección creativa y de negocio es humana, y la implementación técnica se realiza en colaboración con Claude Code.

---

## 📐 Arquitectura

Arquitectura **multi-página modular** — cada línea de negocio es una página HTML independiente que comparte un design system global.

```
📁 Nappan App/
├── index.html              ← Landing page / Hub de navegación
├── nappan-lunchbox.html    ← Lunch Box (eventos y cumpleaños) — precios dinámicos
├── nappan-box.html         ← Nappan Box + Premium Box (arte personalizado) — precios y extras dinámicos
├── nappan-fitbar.html      ← Protein Fit Bar (coffee, shots, pancakes, combos) — precios dinámicos
├── nappan-eventos.html     ← Eventos en Vivo (pancake art en tu evento) — galería dinámica
├── nappan-admin-v2.html    ← Dashboard Admin privado (auth-gated)
│
├── styles.css              ← Design system global (~2,680 líneas)
├── script.js               ← Router de navegación goTo() + toast notifications
├── utils.js                ← Constantes compartidas (WA_NUMBER)
├── chatbot.js              ← Chatbot embebido con calculadora de envío (Google Maps API)
├── supabase-client.js      ← Inicialización cliente Supabase y API window.NappanDB
├── supabase-schema.sql     ← DDL: tablas, RLS policies, triggers, seed data
│
├── images/
│   ├── logo-dorado.webp        ← Logo principal (usado en headers dark)
│   ├── logo-white-solo.webp    ← Logo blanco (hero Fit Bar)
│   ├── logo.png                ← Logo negro (referencia)
│   ├── bg-*.jpg                ← Backgrounds de secciones
│   ├── nappanbox-gallery-*.jpg
│   ├── cold-protein-latte.webp
│   ├── cold-brew.webp
│   └── black-coffee.webp
│
├── CLAUDE.md               ← Guía arquitectónica para Claude Code
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
Hub central con cards de navegación a las 4 líneas de negocio. Diseño dark con gradientes radiales y animaciones CSS.

### 📦 Lunch Box (`nappan-lunchbox.html`)
- **2 opciones** de Lunch Box ($125 y $130)
- Selector de PancakeART (Osito, Capibara, Pollito)
- **Selector de Fruta o Gelatina** con custom checkboxes marrón (#8B5E3C)
  - Validación obligatoria (toast si no se selecciona)
  - Palomilla blanca visible solo cuando está seleccionado
- Extras seleccionables con precio dinámico
- Carrito lateral con panel deslizante
- Restricción: un tipo de box y una figura por pedido
- Envío de pedido pre-formateado a WhatsApp

### 🎨 Nappan Box (`nappan-box.html`)
- **Nappan Box** ($450) — Arte con personaje a elección
- **Premium Box** ($850) — Arte ultra-detallado con foto de referencia
- Tabs para cambiar entre versiones
- Extras de PancakeART pequeño ($150 c/u)
- Formulario completo con validaciones
- Fecha mínima: 1 semana de anticipación

### 💪 Protein Fit Bar (`nappan-fitbar.html`)
- **Coffee Bar:** Cold Protein Latte, Cold Brew, Black Coffee (con imágenes WebP reales)
- **Boost Shots:** Detox Glow, Energy Boost, Golden Power (con imágenes WebP)
- **Signature Pancakes:** Power Pancakes, Protein Minis
- **Combos:** Combo Fit, Combo Shots
- Carrito con agrupación por producto y thumbnails
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

1. Crear un nuevo archivo `nappan-[seccion].html` en la raíz
2. Importar `styles.css` y `utils.js`
3. Agregar la ruta en `script.js` dentro de `goTo()`
4. Crear una card de navegación en `index.html`
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

### Fase 2 — Supabase Integration ✅
- [x] **Fase 1 — Captura de Órdenes**
  - [x] Tabla `orders` + `order_items` en Supabase
  - [x] Función `NappanDB.saveOrder()` para persistencia
  - [x] Integración en las 4 secciones (fire-and-forget después de WhatsApp)
  - [x] Trigger automático para generar `order_number` secuencial
  
- [x] **Fase 2 — Dashboard Admin** 
  - [x] `nappan-admin-v2.html` con authentication (email/password)
  - [x] Tab **Pedidos** — tabla con filtros, status editable, expand para ver detalles
  - [x] Tab **Productos** — visualización de productos
  - [x] Tab **Configuración** — edición de config, extras de productos, galería
  - [x] Row Level Security (RLS) policies configuradas

- [x] **Fase 3 — Configuración Dinámica**
  - [x] Tabla `app_config` para almacenar valores editables
  - [x] Número WhatsApp dinámico (cargado desde DB)
  - [x] Tarifas de envío dinámicas (5 tiers configurables)
  - [x] Galería de eventos dinámica (reemplaza `GALLERY_PHOTOS`)
  - [x] Admin: Tab para editar configuración y galería

- [x] **Fase 4 — Productos y Precios Dinámicos**
  - [x] Tabla `products` con SKU y precios base
  - [x] Tabla `product_extras` para add-ons (ej. PancakeART pequeño extra)
  - [x] Precios dinámicos en **Lunch Box** (2 opciones)
  - [x] Precios dinámicos en **Nappan Box** (Nappan + Premium) + extras separados
  - [x] Precios dinámicos en **Fit Bar** (10 productos + 2 combos)
  - [x] Admin: Tab **Productos** para editar precios y extras
  - [x] Carrito refleja precios actualizados en tiempo real

### Fase 5+ — Futuro
- [ ] Tabla `pricing_rules` para promociones temporales y descuentos por volumen
- [ ] Tabla `customers` para tracking de clientes recurrentes con tiers (Individual/Premium/Business)
- [ ] Detección automática de clientes por teléfono + gestión de membership tiers
- [ ] Analytics — dashboard con gráficos (revenue, top productos, repeat rate)
- [ ] PWA / Service Worker
- [ ] Google Analytics / tracking avanzado

---

## 🗄️ Integración Supabase

La app usa **Supabase** (PostgreSQL hosted) para persistencia de datos, autenticación del admin y configuración dinámica.

### Setup Inicial

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Copiar credenciales (`Proyecto URL` y `Anon Key`)
3. Actualizar en `supabase-client.js` (líneas 6-7)
4. Ejecutar DDL desde `supabase-schema.sql` en Supabase SQL Editor

### Tablas principales

| Tabla | Propósito | RLS |
|---|---|---|
| `orders` | Cada pedido (WhatsApp + admin) | INSERT abierto, SELECT/UPDATE admin |
| `order_items` | Items normalizados por orden | INSERT abierto, SELECT admin |
| `app_config` | Key-value (WA_NUMBER, tarifas, etc) | SELECT abierto, UPDATE admin |
| `products` | Catálogo dinámico (SKU, base_price) | SELECT abierto, CRUD admin |
| `product_extras` | Add-ons con precio por producto | SELECT abierto, CRUD admin |
| `event_gallery` | Fotos galería eventos | SELECT abierto, CRUD admin |
| `customers` | Info de clientes (futuro Phase 5) | SELECT/UPDATE admin |
| `pricing_rules` | Reglas de descuento temporales (futuro) | SELECT abierto, CRUD admin |

### API: `window.NappanDB`

**Funciones públicas (anon):**
```javascript
NappanDB.saveOrder(payload)        // → {order_id, order_number}
NappanDB.loadProducts(section)     // → products[]
NappanDB.loadExtras(productId)     // → extras[]
NappanDB.loadGalleryPhotos()       // → grouped by event_type_key
NappanDB.loadAppConfig()           // → {key: value, ...}
```

**Funciones admin (requieren sesión autenticada):**
```javascript
NappanDB.signIn(email, password)
NappanDB.signOut()
NappanDB.getSession()
NappanDB.loadAllOrders(filters)
NappanDB.updateOrderStatus(id, status)
NappanDB.updateConfigValue(key, value)
NappanDB.updateGalleryPhoto(eventType, slot, imageUrl)
NappanDB.updateProductPrice(productId, newPrice)
NappanDB.updateExtraPrice(extraId, newPrice)
```

### Acceso Admin

**URL:** `http://localhost:8080/nappan-admin-v2.html`

**Credenciales:** Email + password configurados en Supabase Auth

**Tabs:**
- 📦 **Pedidos** — Historial, filtros, status editable
- 📊 **Productos** — Edición de precios por sección
- ⚙️ **Configuración** — WhatsApp, envío, extras, galería

---

## 📱 Integración WhatsApp

Todos los pedidos se envían vía WhatsApp Business. El número se almacena en `app_config` (editable desde admin):

```javascript
// Cargado dinámicamente desde Supabase
const WA_NUMBER = await NappanDB.getConfigValue('whatsapp_number', '528123509768');
```

Fallback si Supabase no está disponible:
```javascript
// utils.js
const WA_NUMBER = '528123509768';
```

**Nota:** El número se almacena en la BD para permitir cambios sin modificar código.

---

## 📞 Contacto

**Nappan — Pancake & Art**
📍 Monterrey, Nuevo León, México
💬 WhatsApp: +52 812 350 9768

---

*Este proyecto es propiedad de [@juangalindo55](https://github.com/juangalindo55). Desarrollado con 🥞 y Vibe Coding en Monterrey.*
