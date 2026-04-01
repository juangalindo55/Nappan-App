# 📚 Sistema Tipográfico Unificado - NAPPAN

**Fecha de implementación**: Abril 2026
**Versión**: 3.0
**Objetivo**: Proyectar modernidad geométrica, legibilidad móvil excepcional, elegancia limpia y claridad visual

---

## 🎨 Fuentes Elegidas

### **1. Inter** (Sans-serif Neo-Grotesca)
- **Uso**: Fuente base para 95% del contenido
- **Razón**: Moderna, minimalista, geométrica, excelente legibilidad en pantalla
- **Pesos disponibles**: 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold), 800 (ExtraBold)
- **Alineación**: Tendencias de diseño 2024+ (Apple, Stripe, Netflix)

### **2. Montserrat** (Sans-serif Geométrica)
- **Uso**: EXCLUSIVAMENTE para H1 (títulos principales)
- **Razón**: Sans-serif geométrica con personalidad visual fuerte. Inspirada en la tipografía del barrio de Montserrat en Buenos Aires. Transmite modernidad, claridad y robustez. Mayor contraste visual que Inter en tamaños grandes, mantiene legibilidad perfecta en móvil.
- **Pesos**: Variable 100–900 (recomendado: 600-700 para H1)
- **Reemplaza a**: Fraunces (v2.0) — migrado para una identidad más modern/geométrica, menos artesanal-serif
- **Historia**: Playfair Display (v1.0) → Fraunces (v2.0) → Montserrat (v3.0)

---

## 📐 Jerarquía Tipográfica

### **H1 - Encabezados Principales**
```css
font-family: 'Montserrat', sans-serif
font-size: clamp(42px, 10vw, 80px)
font-weight: 600
line-height: 1.1
letter-spacing: -1px
```
**Ejemplos**: "El arte que se come" (Home), "Tu Pedido" (Carrito)

> **⚠️ Excepción — Fit Bar Hero:** La sección `nappan-fitbar.html` reemplaza el `<h1>` de texto por el logo blanco (`logo-white-solo.webp`) usando `<img class="pfb-hero-logo">`. El logo actúa visualmente como el h1 de la página.

---

### **H2 - Subtítulos de Sección**
```css
font-family: 'Inter', sans-serif
font-size: clamp(20px, 5vw, 32px)
font-weight: 700 (Bold)
line-height: 1.3
letter-spacing: -0.5px
```
**Ejemplos**: "Nappan Box", "Coffee Bar", "Protein Fit Bar"

---

### **H3 - Títulos de Productos**
```css
font-family: 'Inter', sans-serif
font-size: 18px
font-weight: 600 (SemiBold)
line-height: 1.4
letter-spacing: -0.3px
```
**Ejemplos**: "Caramel Macchiato", "Detox Glow", "Cold Brew"

---

### **Body Text - Texto de Cuerpo**
```css
font-family: 'Inter', sans-serif
font-size: 15px
font-weight: 400 (Regular)
line-height: 1.6
letter-spacing: 0px
```
**Uso**: Descripciones de productos, instrucciones, párrafos largos
**Prioridad**: Máxima legibilidad, amplio espaciado vertical

---

### **Small Text - Metadatos**
```css
font-family: 'Inter', sans-serif
font-size: 13px
font-weight: 400 (Regular)
line-height: 1.5
letter-spacing: 0px
```
**Ejemplos**: "x4" (cantidad en carrito), notas pequeñas

---

### **Labels - Etiquetas de Formularios**
```css
font-family: 'Inter', sans-serif
font-size: 12px
font-weight: 500 (Medium)
line-height: 1.5
letter-spacing: 0.5px
text-transform: uppercase
```
**Ejemplos**: "TU NOMBRE", "FECHA DESEADA", "NOTAS ESPECIALES"

---

### **Prices - Números y Precios**
```css
font-family: 'Inter', sans-serif
font-size: 22px (normal) / 32px (destacado)
font-weight: 700 (Bold) / 800 (ExtraBold)
line-height: 1.2
letter-spacing: -0.5px
color: #DAA520 (Gold) o #FFD93D (Yellow)
```
**Importancia**: Alto contraste, muy visible
**Ejemplos**: "$450", "$75", "$29"

---

### **Button Text - Texto de Botones**
```css
font-family: 'Inter', sans-serif
font-size: 15px
font-weight: 600 (SemiBold)
line-height: 1.4
letter-spacing: 0.3px
text-transform: uppercase
```
**Ejemplos**: "+ AGREGAR", "ENVIAR PEDIDO", "COTIZAR"

---

## 🎯 Adaptación por Contexto

### **Fondos Oscuros** (Index, Nappan Box)
- Color texto: #FFF8ED (Cream) o #FFD93D (Yellow)
- Contraste: Máximo (WCAG AAA compliant)

### **Fondos Claros** (Protein Fit Bar, Lunch Box)
- Color texto: #1A1A1A (Dark) o #2D1B0E (Brown)
- Contraste: Máximo (WCAG AAA compliant)

---

## ✅ Características de Accesibilidad

- ✅ Todas las líneas de base cumplen WCAG AAA (contraste mínimo 7:1)
- ✅ Line-height ≥ 1.5 en body text (máxima legibilidad)
- ✅ Letter-spacing para etiquetas en mayúsculas (0.5px)
- ✅ Font-weight diferenciado por propósito (no solo tamaño)
- ✅ Responsive tipografía con `clamp()` para escalado fluido
- ✅ Montserrat sans-serif optimizada para legibilidad móvil (sin trazos finos)

---

## 🛠 Variables CSS

```css
--font-display: 'Montserrat', sans-serif;
--font-sans: 'Inter', sans-serif;

--font-light: 300;
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
```

---

## 📱 Responsive Breakpoints

### **Mobile (< 768px)**
- H1: 42px
- H2: 20px
- H3: 16px
- Body: 14px

### **Tablet (768px - 1024px)**
- H1: 56px
- H2: 28px
- H3: 18px
- Body: 15px

### **Desktop (> 1024px)**
- H1: 80px
- H2: 32px
- H3: 20px
- Body: 16px

---

## 🚫 Lo que NO hacer

❌ Mezclar múltiples familias sans-serif
❌ Usar Montserrat para H2, H3 o body
❌ Usar font-weight < 300 o > 900
❌ Reducir line-height < 1.1 (afecta legibilidad)
❌ Usar serifs para descripciones de productos
❌ Olvidar letter-spacing en mayúsculas

---

## 📋 Checklist de Implementación

- [x] Inter importada en Google Fonts
- [x] Montserrat importada en Google Fonts (variable, pesos 100-900)
- [x] Variables CSS definidas en :root
- [x] Clases tipográficas base creadas (.h1, .h2, .h3, .body-text, etc.)
- [x] Todos los font-family reemplazados con variables
- [x] H2 actualizado a sans-serif en todas las secciones
- [x] H3 (títulos de productos) actualizado a sans-serif
- [x] Precios actualizados a sans-serif bold
- [x] Body text optimizado para legibilidad
- [x] Labels y buttons estilizados correctamente
- [x] WCAG compliance verificado
- [x] Migración de Playfair Display → Fraunces (v2.0, Abril 2026)
- [x] Migración de Fraunces → Montserrat (v3.0, Abril 2026)
- [x] Excepción documentada: Fit Bar hero usa logo imagen en lugar de H1 texto

---

## 📞 Soporte y Preguntas

Si encuentras inconsistencias tipográficas o necesitas agregar nuevos estilos:
1. Consulta esta guía primero
2. Usa las variables CSS definidas en :root
3. Sigue la escala tipográfica establecida
4. Asegúrate de mantener contraste WCAG AAA
