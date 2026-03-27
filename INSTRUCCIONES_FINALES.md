# 📋 Guía de Referencia Rápida — Nappan App

**Última actualización:** Marzo 2026
**Estado:** Producción (3 secciones live, 1 planeada)

---

## 📂 Estructura del proyecto

```
📁 Nappan App/
├── index.html              ← Landing / Hub de navegación
├── nappan-lunchbox.html    ← Lunch Box (eventos/cumpleaños)
├── nappan-box.html         ← Nappan Box + Premium Box
├── nappan-fitbar.html      ← Protein Fit Bar
├── styles.css              ← Design system global
├── script.js               ← Router goTo() + toasts
├── utils.js                ← WA_NUMBER compartido
├── images/                 ← Logo, backgrounds, galería
└── .claude/                ← Scripts de dev local
```

---

## 🚀 Cómo correr localmente

```bash
# Opción 1: Script incluido (Windows)
.claude\serve.bat

# Opción 2: Python
python -m http.server 8080

# Opción 3: Node.js
npx -y serve -p 8080
```

Abrir: **http://localhost:8080**

---

## 📱 WhatsApp — Cambiar número

El número está centralizado en **un solo archivo**:

```javascript
// utils.js
const WA_NUMBER = '528123509768';
```

**Formato:** `52` + número sin `01`

Ejemplo: Si tu número es `81 2345 6789` → usa `528123456789`

> ⚠️ **No** edites el número directamente en las páginas HTML. Todas importan `utils.js`.

---

## 🎨 Cambiar colores de marca

Edita las variables CSS en `styles.css`, sección `:root`:

```css
:root {
  --yellow:  #FFD93D;   /* Acentos, CTAs */
  --gold:    #DAA520;   /* Color primario */
  --cream:   #FFF8ED;   /* Fondos claros */
  --dark:    #1A1008;   /* Fondos oscuros */
  --brown:   #2D1B0E;   /* Texto principal */
}
```

---

## ➕ Agregar productos

### En Protein Fit Bar (`nappan-fitbar.html`)

Duplica un `.product-card` y modifica:

```html
<div class="product-card">
  <div class="product-image img-NOMBRE"></div>
  <div class="product-info">
    <h3>NOMBRE DEL PRODUCTO</h3>
    <p class="product-desc">DESCRIPCIÓN</p>
    <div class="product-price">$PRECIO</div>
  </div>
  <div class="product-footer">
    <input type="number" id="qty-NOMBRE" class="qty-input" value="1" min="1">
    <button class="add-btn" onclick="addToCartShot('NOMBRE', PRECIO, 'qty-NOMBRE')">+ Agregar</button>
  </div>
</div>
```

### En Lunch Box (`nappan-lunchbox.html`)

Agrega un nuevo box al objeto `products` en el `<script>`:

```javascript
const products = {
  1: { name: 'Lunch Box 1', basePrice: 125, icon: '🐣', extras: {...} },
  2: { name: 'Lunch Box 2', basePrice: 130, icon: '🥐', extras: {...} },
  // Nuevo:
  3: { name: 'Lunch Box 3', basePrice: 150, icon: '🎉', extras: {...} }
};
```

---

## ➕ Agregar una nueva sección al sitio

1. Crea `nappan-[seccion].html` en la raíz
2. Importa los recursos compartidos:
   ```html
   <link rel="stylesheet" href="styles.css">
   <script src="utils.js"></script>
   ```
3. Agrega la ruta en `script.js`:
   ```javascript
   page === 'nappan-[seccion].html'
   ```
4. Agrega una card en `index.html` dentro de `.cards-grid`
5. Sigue el sistema tipográfico: Inter para todo, Playfair solo para H1

---

## 🧪 Checklist de verificación

Después de hacer cambios, verifica:

- [ ] La navegación desde `index.html` funciona
- [ ] El botón ← regresa al inicio
- [ ] El carrito agrega/elimina productos correctamente
- [ ] El total se calcula bien
- [ ] WhatsApp abre con el mensaje formateado
- [ ] Se ve bien en móvil (375px en DevTools)
- [ ] No hay errores en consola (F12)

---

## 🆘 Troubleshooting

| Problema | Solución |
|---|---|
| Click en card no abre la página | Verifica que el archivo `.html` está en la misma carpeta que `index.html` |
| WhatsApp no abre | Verifica formato en `utils.js`: `52` + número sin `01` |
| Estilos rotos | Limpia cache: `Ctrl+Shift+R` (Windows) o `Cmd+Shift+R` (Mac) |
| Carrito no funciona | Abre consola (F12) y busca errores en rojo |
| Toast "Próximamente" en vez de abrir sección | La página aún no tiene archivo HTML, agrega la ruta en `goTo()` |

---

## 📚 Documentación relacionada

- [`README.md`](README.md) — Overview general del proyecto
- [`CLAUDE.md`](CLAUDE.md) — Guía técnica para Claude Code
- [`TYPOGRAPHY_SYSTEM.md`](TYPOGRAPHY_SYSTEM.md) — Sistema tipográfico completo

---

*Nappan Pancake & Art · Monterrey, NL · Desarrollado con 🥞 y Vibe Coding*
