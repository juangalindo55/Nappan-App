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
| **Pedidos** | Integración directa con WhatsApp Business API |
| **Chatbot** | Chatbot embebido con calculadora de envío vía Google Maps Distance Matrix API |
| **Deploy** | GitHub Pages |
| **Control de versiones** | Git & GitHub |
| **IA Partner** | Claude Code (Anthropic) — Vibe Coding methodology |

> 🧠 **Vibe Coding:** Este proyecto se desarrolla mediante una metodología de programación asistida por IA, donde la dirección creativa y de negocio es humana, y la implementación técnica se realiza en colaboración con Claude Code.

---

## 📐 Arquitectura

Arquitectura **multi-página modular** — cada línea de negocio es una página HTML independiente que comparte un design system global.

```
📁 Nappan App/
├── index.html              ← Landing page / Hub de navegación
├── nappan-lunchbox.html    ← Lunch Box (eventos y cumpleaños)
├── nappan-box.html         ← Nappan Box + Premium Box (arte personalizado)
├── nappan-fitbar.html      ← Protein Fit Bar (coffee, shots, pancakes, combos)
│
├── styles.css              ← Design system global (variables, tipografía, layouts)
├── script.js               ← Router de navegación goTo() + toast notifications
├── utils.js                ← Constantes compartidas (WA_NUMBER)
├── chatbot.js              ← Chatbot embebido con calculadora de envío (Google Maps API)
│
├── images/                 ← Assets de imágenes (logo, backgrounds, galería, productos)
│   ├── logo.jpg
│   ├── bg-*.jpg            ← Backgrounds de secciones
│   ├── nappanbox-gallery-*.jpg
│   ├── pancakeart-capibara.png
│   ├── cold-protein-latte.webp
│   ├── cold-brew.webp
│   └── black-coffee.webp
│
├── *.webp / *.png          ← Imágenes de productos (Boost Shots con WebP + fallback)
│
├── CLAUDE.md               ← Guía arquitectónica para Claude Code
├── TYPOGRAPHY_SYSTEM.md    ← Documentación del sistema tipográfico
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
- **Estado:** En desarrollo (planeada)
- Actualmente muestra toast "Próximamente disponible"

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

- [x] Landing page con hub de navegación
- [x] Sección Lunch Box funcional con carrito + WhatsApp
- [x] Sección Nappan Box (Normal + Premium) con formularios + WhatsApp
- [x] Sección Protein Fit Bar con carrito completo + WhatsApp
- [x] Design system global unificado (`styles.css`)
- [x] Sistema tipográfico Inter + Montserrat
- [x] Optimización de imágenes (WebP + fallback PNG) — Coffee Bar con fotos reales
- [x] Diseño responsive (mobile, tablet, desktop)
- [x] Accesibilidad WCAG AAA (contraste tipográfico)
- [x] Centralización del número WhatsApp en `utils.js`
- [x] Chatbot embebido con menú interactivo y calculadora de envío (Google Maps)
- [x] Deploy en GitHub Pages
- [ ] Sección Eventos en Vivo (planeada)
- [ ] PWA / Service Worker (futuro)
- [ ] Analytics / tracking (futuro)

---

## 📱 Integración WhatsApp

Todos los pedidos se envían vía WhatsApp Business. El número está centralizado en:

```javascript
// utils.js
const WA_NUMBER = '528123509768';
```

**Formato:** `52` + número sin `01`

Para cambiar el número, solo modifica `utils.js` — todas las páginas lo heredan.

---

## 📞 Contacto

**Nappan — Pancake & Art**
📍 Monterrey, Nuevo León, México
💬 WhatsApp: +52 812 350 9768

---

*Este proyecto es propiedad de [@juangalindo55](https://github.com/juangalindo55). Desarrollado con 🥞 y Vibe Coding en Monterrey.*
