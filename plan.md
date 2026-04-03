# 🗺️ Nappan App — Roadmap & Plan de Desarrollo

> Actualizado: Abril 2026 · Estado real del proyecto.

---

## 🚀 En Desarrollo (Prioridad Alta)

- [ ] **Galería dinámica con fotos reales** en `nappan-eventos.html`
    - La estructura ya existe (`GALLERY_PHOTOS` en el JS).
    - Faltan las imágenes reales para cada categoría: cumpleaños, wellness, corporativos, baby shower, graduaciones, ferias.
    - Reemplazar `null` por rutas `'images/nombre.webp'` cuando tengamos las fotos.
- [ ] **Actualizar la tarjeta de Eventos** en `index.html`
    - Cambiar su badge de "Próximamente" → "Nuevo" o eliminarlo.
    - Confirmar que el link lleva a `nappan-eventos.html`.
- [ ] **Pulido final de UI/UX transversal**:
    - Revisar consistencia visual de los 4 headers (logo centrado, back-btn izquierda).
    - Verificar que el `nav-float-btn` (menú hamburguesa) esté presente en todas las páginas.

---

## ⏭️ Próximos Pasos (Feature Backlog)

- [ ] **Sistema de Cupones**: Agregar campo de "Código de Descuento" en los formularios de pedido que se incluya en el mensaje de WhatsApp.
- [ ] **Checkout Mejorado**: Preguntar si es regalo y permitir agregar una dedicatoria rápida.
- [ ] **Multi-idioma**: Preparar estructura para Inglés/Español (Monterrey es zona internacional).
- [ ] **Chatbot mejorado**: Agregar respuestas con precios orientativos y menú Fit Bar más detallado en el chatbot.

---

## 💡 Ideas en el Tintero (Brainstorming)

- [ ] **Confirmación Automática**: Integración con WhatsApp Business API para bots más avanzados.
- [ ] **Localizador**: Mapa interactivo para pick-up si se habilita un punto físico.
- [ ] **Video Background**: Clips de 3–5 segundos de arte en pancake en el Hero del `index.html`.
- [ ] **Reseñas / Testimonios**: Sección de comentarios reales de clientes en cada página de producto.

---

## ✅ Completado

### Arquitectura & Infraestructura
- [x] Estructura modular multi-página (index + 4 secciones independientes).
- [x] Sistema de diseño global en `styles.css` (~73 KB, ~2,100 líneas).
- [x] `utils.js` con `WA_NUMBER` centralizado.
- [x] `script.js` con router `goTo()` y toast "coming soon".
- [x] Reescritura de documentación técnica (`README.md`, `AGENTS.md`, `CLAUDE.md`).
- [x] Sistema tipográfico definido: Montserrat (H1) + Inter (todo lo demás). Ver `TYPOGRAPHY_SYSTEM.md`.

### Chatbot (`chatbot.js`)
- [x] Chatbot global auto-inyectado en todas las páginas vía `<script src="chatbot.js">`.
- [x] Menú de bienvenida con quick-replies para Lunch Box, Nappan Box, Fit Bar, Eventos y Contacto.
- [x] **Calculadora de envío** integrada: ingresa CP → llama Google Maps Distance Matrix API → devuelve precio.
    - Cobertura: 0–3 km → $50 · 4–8 km → $85 · 9–15 km → $130 · 16–20 km → $150 · 21–45 km → $200.
- [x] Clave de Google Maps actualizada en `chatbot.js` (`GOOGLE_MAPS_API_KEY`).

### Nappan Eventos en Vivo (`nappan-eventos.html`) ✅ Live
- [x] Página creada y funcional (ya no es "Planned").
- [x] Hero, tarjeta de servicio, sección "¿Cómo funciona?" (3 pasos).
- [x] **Pills de tipo de evento** con auto-completado del selector del formulario.
- [x] **Galería dinámica** (estructura lista, espera fotos reales).
- [x] Formulario completo de cotización (nombre, teléfono, tipo, invitados, fecha, horario, lugar, temática, notas).
- [x] Validación de campos + fecha mínima a 14 días.
- [x] Envío por WhatsApp con mensaje formateado en negritas.
- [x] Menú flotante hamburguesa con navegación a todas las secciones.

### Nappan Lunch Box (`nappan-lunchbox.html`)
- [x] Header unificado con logo centrado (estilo landing page).
- [x] **Custom checkboxes** Fruta/Gelatina en Lunch Box 1 y 2 (color marrón `#8B5E3C`, validación obligatoria con toast).
- [x] Texto PancakeART: separador cambiado de "o" a "/" entre "miel" y "Upgrade a Nucolato".
- [x] Tamaño de "ARTÍSTICOS!" reducido a 0.75em para mejor jerarquía visual.
- [x] Link a Instagram en color dorado mantenido.

### Nappan Box (`nappan-box.html`)
- [x] Página funcional con catálogo Nappan Box + Premium Box.

### Nappan Fit Bar (`nappan-fitbar.html`)
- [x] Integración de imágenes reales en la sección Coffee (WebP).
- [x] Logo blanco actualizado en header.

---

*Este archivo es dinámico y se actualiza a medida que el proyecto evoluciona.*
