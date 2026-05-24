# Fitbar Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `FitbarOrderScreen` to show a dark-gradient header with progress bar, category tabs, horizontal list cards on mobile, and a 2-column grid on desktop.

**Architecture:** All changes are self-contained in `FitbarOrderScreen.tsx`. The screen is decomposed into focused sub-components defined in the same file. No new routes, no DB changes, no new files — the service gets a minor type addition only.

**Tech Stack:** Next.js App Router, React hooks, Tailwind CSS, Zustand (cart store), inline CSS vars from `globals.css`.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/features/orders/fitbar/FitbarOrderScreen.tsx` | Rewrite | Main screen + all sub-components |
| `src/features/orders/fitbar/fitbar.service.ts` | Modify | Add `description` field to `FitbarProductRow` type |

---

### Task 1: Update `fitbar.service.ts` type + query

**Files:**
- Modify: `src/features/orders/fitbar/fitbar.service.ts`

- [ ] **Step 1: Add `description` to the type and select query**

Replace the entire file with:

```ts
import { getSupabaseClient } from '@/lib/supabase'

export type FitbarProductRow = {
  sku: string
  name: string
  description: string | null
  base_price: number
  section: string
}

export async function listFitbarProducts() {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('products')
    .select('sku,name,description,base_price,section')
    .eq('section', 'fitbar')
    .order('name', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as FitbarProductRow[]
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/surface/proyectos/Nappan-App/.worktrees/rewrite-nappan && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors related to `fitbar.service.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/features/orders/fitbar/fitbar.service.ts
git commit -m "feat(fitbar): add description field to FitbarProductRow"
```

---

### Task 2: Define constants — descriptions, gradients, category map

**Files:**
- Modify: `src/features/orders/fitbar/FitbarOrderScreen.tsx` (top of file, before component)

- [ ] **Step 1: Replace the top of `FitbarOrderScreen.tsx`** — keep existing imports, add the constants block right after the imports:

```tsx
'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useCartStore } from '@/store/cart.store'
import { listFitbarProducts, type FitbarProductRow } from './fitbar.service'

// ─── Constants ───────────────────────────────────────────────────────────────

const MIN_TOTAL = 1000

type FitbarCategory = 'coffee' | 'shots' | 'food'

const CATEGORY_META: Record<FitbarCategory, { label: string; emoji: string }> = {
  coffee: { label: 'Café',   emoji: '☕' },
  shots:  { label: 'Shots',  emoji: '⚡' },
  food:   { label: 'Comida', emoji: '🥞' },
}

const FITBAR_DESCRIPTIONS: Record<string, string> = {
  'FITBAR-BLACK-COFFEE':   'Americano concentrado',
  'FITBAR-COLD-BREW':      'Frío · extracción lenta 12h',
  'FITBAR-COLD-LATTE':     'Con proteína · sin azúcar',
  'FITBAR-DETOX-GLOW':     'Jengibre · limón · cúrcuma',
  'FITBAR-ENERGY-BOOST':   'Cafeína + vitamina B',
  'FITBAR-GOLDEN-POWER':   'Cúrcuma · pimienta · miel',
  'FITBAR-COMBO-SHOTS':    '3 shots a elegir',
  'FITBAR-COMBO-FIT':      'Bebida + snack proteico',
  'FITBAR-POWER-PANCAKES': 'Mini pancakes de avena',
  'FITBAR-PROTEIN-MINIS':  'Bocados proteicos sin azúcar',
}

const FITBAR_GRADIENTS: Record<string, string> = {
  'FITBAR-BLACK-COFFEE':   'linear-gradient(160deg,#1A0D08,#3A1A0E)',
  'FITBAR-COLD-BREW':      'linear-gradient(160deg,#6B3A2A,#D89B2B)',
  'FITBAR-COLD-LATTE':     'linear-gradient(160deg,#D89B2B,#FFF3CC)',
  'FITBAR-DETOX-GLOW':     'linear-gradient(160deg,#2D6A4F,#74C69D)',
  'FITBAR-ENERGY-BOOST':   'linear-gradient(160deg,#E63946,#F4A261)',
  'FITBAR-GOLDEN-POWER':   'linear-gradient(160deg,#D89B2B,#F9C74F)',
  'FITBAR-COMBO-SHOTS':    'linear-gradient(160deg,#4A2218,#9B4DCA)',
  'FITBAR-COMBO-FIT':      'linear-gradient(160deg,#2A1710,#D89B2B)',
  'FITBAR-POWER-PANCAKES': 'linear-gradient(160deg,#8B4513,#DEB887)',
  'FITBAR-PROTEIN-MINIS':  'linear-gradient(160deg,#3A5A40,#A3B18A)',
}

function getCategory(product: FitbarProductRow): FitbarCategory {
  const token = `${product.sku} ${product.name}`.toLowerCase()
  if (token.includes('coffee') || token.includes('latte') || token.includes('brew') || token.includes('cafe') || token.includes('cold'))
    return 'coffee'
  if (token.includes('shot') || token.includes('boost') || token.includes('energy') || token.includes('detox') || token.includes('golden') || token.includes('power') || token.includes('combo-shots'))
    return 'shots'
  return 'food'
}

type FitbarQuantityMap = Record<string, number>
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/surface/proyectos/Nappan-App/.worktrees/rewrite-nappan && npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/orders/fitbar/FitbarOrderScreen.tsx
git commit -m "feat(fitbar): add description, gradient, and category constants"
```

---

### Task 3: Build `FitbarHeader` sub-component

**Files:**
- Modify: `src/features/orders/fitbar/FitbarOrderScreen.tsx` (add component before `export default`)

- [ ] **Step 1: Add the `FitbarHeader` component** — paste this before `export default function FitbarOrderScreen`:

```tsx
function FitbarHeader({ total }: { total: number }) {
  const progress = Math.min((total / MIN_TOTAL) * 100, 100)
  const remaining = Math.max(MIN_TOTAL - total, 0)

  return (
    <header
      className="px-4 pt-5 pb-4"
      style={{
        background: 'linear-gradient(135deg,#2A1710 0%,#4A2218 60%,#6B3A2A 100%)',
      }}
    >
      <div className="mb-4 flex items-center justify-end">
        <Link
          href="/order"
          className="inline-flex shrink-0 items-center justify-center rounded-lg border px-3 py-2 text-sm font-semibold transition active:scale-[0.98]"
          style={{ background: 'rgba(255,248,234,0.1)', borderColor: 'rgba(255,248,234,0.2)', color: '#FFF8EA' }}
        >
          ← Volver
        </Link>
      </div>

      <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: 'rgba(255,248,234,0.5)' }}>
        Barra bienestar
      </p>
      <h1 className="mt-1 text-3xl font-semibold" style={{ color: '#FFF8EA' }}>
        Barra Fitbar
      </h1>
      <p className="mt-1 text-sm" style={{ color: 'rgba(255,248,234,0.6)' }}>
        Arma tu selección — mínimo ${MIN_TOTAL.toLocaleString('es-MX')} MXN
      </p>

      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="font-bold" style={{ color: '#D89B2B' }}>
            ${total.toLocaleString('es-MX')} seleccionado
          </span>
          {remaining > 0 && (
            <span style={{ color: 'rgba(255,248,234,0.5)' }}>
              ${remaining.toLocaleString('es-MX')} para completar
            </span>
          )}
          {remaining === 0 && (
            <span style={{ color: '#D89B2B' }}>✓ Mínimo alcanzado</span>
          )}
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg,#D89B2B,#F0C060)',
            }}
          />
        </div>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/surface/proyectos/Nappan-App/.worktrees/rewrite-nappan && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add src/features/orders/fitbar/FitbarOrderScreen.tsx
git commit -m "feat(fitbar): add FitbarHeader with progress bar"
```

---

### Task 4: Build `CategoryTabs` sub-component

**Files:**
- Modify: `src/features/orders/fitbar/FitbarOrderScreen.tsx`

- [ ] **Step 1: Add `CategoryTabs` component** — paste after `FitbarHeader`:

```tsx
function CategoryTabs({
  active,
  onChange,
}: {
  active: FitbarCategory
  onChange: (cat: FitbarCategory) => void
}) {
  return (
    <div
      className="sticky top-0 z-20 flex border-b"
      style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)' }}
    >
      {(Object.keys(CATEGORY_META) as FitbarCategory[]).map((cat) => {
        const { label, emoji } = CATEGORY_META[cat]
        const isActive = cat === active
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onChange(cat)}
            className="flex-1 py-3 text-xs font-bold transition"
            style={{
              color: isActive ? 'var(--gold)' : 'var(--text-tertiary)',
              border: 'none',
              borderBottom: isActive ? '2px solid var(--gold)' : '2px solid transparent',
              marginBottom: '-1px',
              background: 'none',
            }}
          >
            {emoji} {label}
          </button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/surface/proyectos/Nappan-App/.worktrees/rewrite-nappan && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add src/features/orders/fitbar/FitbarOrderScreen.tsx
git commit -m "feat(fitbar): add CategoryTabs component"
```

---

### Task 5: Build `ProductCardMobile` sub-component

**Files:**
- Modify: `src/features/orders/fitbar/FitbarOrderScreen.tsx`

- [ ] **Step 1: Add `ProductCardMobile` component** — paste after `CategoryTabs`:

```tsx
function ProductCardMobile({
  product,
  quantity,
  onIncrease,
  onDecrease,
}: {
  product: FitbarProductRow
  quantity: number
  onIncrease: () => void
  onDecrease: () => void
}) {
  const description = product.description ?? FITBAR_DESCRIPTIONS[product.sku]
  const gradient = FITBAR_GRADIENTS[product.sku] ?? 'linear-gradient(160deg,#2A1710,#D89B2B)'

  return (
    <div
      className="flex overflow-hidden rounded-xl"
      style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
    >
      {/* Image block */}
      <div
        className="w-24 shrink-0"
        style={{ background: gradient, minHeight: '88px' }}
      />

      {/* Info */}
      <div className="flex flex-1 items-center gap-2 px-3 py-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
            {product.name}
          </p>
          {description && (
            <p className="mt-0.5 text-[11px] leading-tight" style={{ color: 'var(--text-tertiary)' }}>
              {description}
            </p>
          )}
          <p className="mt-1.5 text-xs font-bold" style={{ color: 'var(--gold)' }}>
            ${product.base_price.toLocaleString('es-MX')}
          </p>
        </div>

        {/* Stacked stepper */}
        <div className="flex shrink-0 flex-col items-center gap-1">
          <button
            type="button"
            onClick={onIncrease}
            aria-label={`Agregar ${product.name}`}
            className="flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold transition active:scale-[0.95]"
            style={{ background: 'var(--gold)', color: 'var(--bg-primary)' }}
          >
            +
          </button>
          <span
            className="text-sm font-bold leading-none"
            style={{ color: quantity > 0 ? 'var(--text-primary)' : 'var(--text-tertiary)', minWidth: '16px', textAlign: 'center' }}
          >
            {quantity}
          </span>
          <button
            type="button"
            onClick={onDecrease}
            aria-label={`Quitar ${product.name}`}
            disabled={quantity === 0}
            className="flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold transition active:scale-[0.95] disabled:opacity-30"
            style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)' }}
          >
            −
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/surface/proyectos/Nappan-App/.worktrees/rewrite-nappan && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add src/features/orders/fitbar/FitbarOrderScreen.tsx
git commit -m "feat(fitbar): add ProductCardMobile component"
```

---

### Task 6: Build `ProductCardDesktop` sub-component

**Files:**
- Modify: `src/features/orders/fitbar/FitbarOrderScreen.tsx`

- [ ] **Step 1: Add `ProductCardDesktop` component** — paste after `ProductCardMobile`:

```tsx
function ProductCardDesktop({
  product,
  quantity,
  onIncrease,
  onDecrease,
}: {
  product: FitbarProductRow
  quantity: number
  onIncrease: () => void
  onDecrease: () => void
}) {
  const gradient = FITBAR_GRADIENTS[product.sku] ?? 'linear-gradient(160deg,#2A1710,#D89B2B)'

  return (
    <div
      className="relative flex flex-col overflow-hidden rounded-xl"
      style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
    >
      {/* Image */}
      <div className="h-24 w-full" style={{ background: gradient }} />

      {/* Quantity badge */}
      {quantity > 0 && (
        <div
          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
          style={{ background: 'var(--gold)', color: 'var(--bg-primary)' }}
        >
          {quantity}
        </div>
      )}

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 px-3 pt-2 pb-2">
        <p className="text-xs font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
          {product.name}
        </p>
        <p className="text-xs font-bold" style={{ color: 'var(--gold)' }}>
          ${product.base_price.toLocaleString('es-MX')}
        </p>
      </div>

      {/* Inline stepper */}
      <div
        className="mx-3 mb-3 flex items-center justify-between rounded-lg px-3 py-1.5"
        style={{ background: 'var(--surface-2)' }}
      >
        <button
          type="button"
          onClick={onDecrease}
          disabled={quantity === 0}
          aria-label={`Quitar ${product.name}`}
          className="text-base font-bold transition disabled:opacity-30"
          style={{ color: 'var(--text-secondary)', background: 'none', border: 'none' }}
        >
          −
        </button>
        <span className="text-sm font-bold" style={{ color: quantity > 0 ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
          {quantity}
        </span>
        <button
          type="button"
          onClick={onIncrease}
          aria-label={`Agregar ${product.name}`}
          className="text-base font-bold transition"
          style={{ color: 'var(--gold)', background: 'none', border: 'none' }}
        >
          +
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/surface/proyectos/Nappan-App/.worktrees/rewrite-nappan && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add src/features/orders/fitbar/FitbarOrderScreen.tsx
git commit -m "feat(fitbar): add ProductCardDesktop component"
```

---

### Task 7: Build `StickyCtaBar` sub-component

**Files:**
- Modify: `src/features/orders/fitbar/FitbarOrderScreen.tsx`

- [ ] **Step 1: Add `StickyCtaBar` component** — paste after `ProductCardDesktop`:

```tsx
function StickyCtaBar({
  total,
  canSubmit,
  feedback,
  onAdd,
}: {
  total: number
  canSubmit: boolean
  feedback: string
  onAdd: () => void
}) {
  const remaining = Math.max(MIN_TOTAL - total, 0)

  return (
    <div
      className="sticky bottom-0 z-20 border-t px-4 py-3"
      style={{
        background: 'var(--bg-primary)',
        borderColor: 'var(--border)',
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      {feedback ? (
        <div className="space-y-2">
          <p
            className="rounded-lg border px-3 py-2 text-sm leading-5"
            style={{ borderColor: 'rgba(216,155,43,0.2)', background: 'var(--gold-dim)', color: 'var(--gold)' }}
          >
            {feedback}
          </p>
          <Link
            href="/cart"
            className="inline-flex w-full items-center justify-center rounded-xl border px-4 py-3 text-sm font-semibold transition active:scale-[0.99]"
            style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            Ir al carrito →
          </Link>
        </div>
      ) : (
        <button
          type="button"
          onClick={onAdd}
          className="w-full rounded-xl px-4 py-3.5 text-sm font-bold transition active:scale-[0.99]"
          style={{
            background: canSubmit ? 'var(--gold)' : 'var(--surface-2)',
            color: canSubmit ? 'var(--bg-primary)' : 'var(--text-tertiary)',
          }}
        >
          {canSubmit
            ? `Agregar al carrito · $${total.toLocaleString('es-MX')} MXN`
            : `Faltan $${remaining.toLocaleString('es-MX')} MXN para el mínimo`}
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/surface/proyectos/Nappan-App/.worktrees/rewrite-nappan && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add src/features/orders/fitbar/FitbarOrderScreen.tsx
git commit -m "feat(fitbar): add StickyCtaBar component"
```

---

### Task 8: Rewrite `FitbarOrderScreen` main component

**Files:**
- Modify: `src/features/orders/fitbar/FitbarOrderScreen.tsx` (replace `export default function FitbarOrderScreen`)

- [ ] **Step 1: Replace the `export default function FitbarOrderScreen` body entirely:**

```tsx
export default function FitbarOrderScreen() {
  const [products, setProducts] = useState<FitbarProductRow[]>([])
  const [quantities, setQuantities] = useState<FitbarQuantityMap>({})
  const [activeCategory, setActiveCategory] = useState<FitbarCategory>('coffee')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')
  const addItem = useCartStore((state) => state.addItem)

  useEffect(() => {
    let cancelled = false

    async function loadProducts() {
      try {
        const nextProducts = await listFitbarProducts()
        if (cancelled) return
        setProducts(nextProducts)
        setQuantities(
          nextProducts.reduce<FitbarQuantityMap>((acc, p) => {
            acc[p.sku] = 0
            return acc
          }, {}),
        )
      } catch (loadError) {
        if (!cancelled)
          setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar los productos.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadProducts()
    return () => { cancelled = true }
  }, [])

  const total = useMemo(
    () => products.reduce((sum, p) => sum + p.base_price * (quantities[p.sku] ?? 0), 0),
    [products, quantities],
  )

  const canSubmit = total >= MIN_TOTAL

  const visibleProducts = useMemo(
    () => products.filter((p) => getCategory(p) === activeCategory),
    [products, activeCategory],
  )

  function updateQuantity(sku: string, next: number) {
    setQuantities((cur) => ({ ...cur, [sku]: Math.max(0, Number.isFinite(next) ? next : 0) }))
    setFeedback('')
    setError('')
  }

  function addSelectionToCart() {
    if (!canSubmit) return

    const selectedItems = products
      .filter((p) => (quantities[p.sku] ?? 0) > 0)
      .map((p) => ({
        sku: p.sku,
        name: p.name,
        quantity: quantities[p.sku] ?? 0,
        base_price: p.base_price,
      }))

    addItem({
      type: 'fitbar',
      sku: 'fitbar-selection',
      name: 'Barra bienestar',
      quantity: 1,
      base_price: total,
      config: { items: selectedItems },
      includes: [],
      extras: [],
    })

    setFeedback('Selección agregada al carrito.')
    setQuantities(products.reduce<FitbarQuantityMap>((acc, p) => { acc[p.sku] = 0; return acc }, {}))
  }

  return (
    <div
      className="desktop-nav-offset hide-scrollbar min-h-dvh overflow-y-auto"
      style={{
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        paddingBottom: 'calc(96px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <FitbarHeader total={total} />
      <CategoryTabs active={activeCategory} onChange={setActiveCategory} />

      <section className="px-4 pt-4 pb-4">
        {loading && (
          <p className="py-8 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Cargando productos…
          </p>
        )}

        {!loading && error && (
          <p className="rounded-lg border border-red-400/25 bg-red-500/10 px-3 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {!loading && !error && (
          <>
            {/* Mobile list */}
            <div className="flex flex-col gap-3 md:hidden">
              {visibleProducts.map((product) => (
                <ProductCardMobile
                  key={product.sku}
                  product={product}
                  quantity={quantities[product.sku] ?? 0}
                  onIncrease={() => updateQuantity(product.sku, (quantities[product.sku] ?? 0) + 1)}
                  onDecrease={() => updateQuantity(product.sku, (quantities[product.sku] ?? 0) - 1)}
                />
              ))}
            </div>

            {/* Desktop grid */}
            <div className="hidden md:grid md:grid-cols-2 md:gap-4">
              {visibleProducts.map((product) => (
                <ProductCardDesktop
                  key={product.sku}
                  product={product}
                  quantity={quantities[product.sku] ?? 0}
                  onIncrease={() => updateQuantity(product.sku, (quantities[product.sku] ?? 0) + 1)}
                  onDecrease={() => updateQuantity(product.sku, (quantities[product.sku] ?? 0) - 1)}
                />
              ))}
            </div>

            {visibleProducts.length === 0 && (
              <p className="py-8 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
                No hay productos en esta categoría.
              </p>
            )}
          </>
        )}
      </section>

      <StickyCtaBar
        total={total}
        canSubmit={canSubmit}
        feedback={feedback}
        onAdd={addSelectionToCart}
      />
    </div>
  )
}
```

- [ ] **Step 2: Remove the old sub-components** — delete `StateCard` and `SummaryRow` from the bottom of the file (they are no longer used).

- [ ] **Step 3: Verify TypeScript compiles with zero errors**

```bash
cd /home/surface/proyectos/Nappan-App/.worktrees/rewrite-nappan && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/features/orders/fitbar/FitbarOrderScreen.tsx
git commit -m "feat(fitbar): compose redesigned FitbarOrderScreen from new sub-components"
```

---

### Task 9: Visual verification + final push

- [ ] **Step 1: Start dev server**

```bash
cd /home/surface/proyectos/Nappan-App/.worktrees/rewrite-nappan && npm run dev
```

- [ ] **Step 2: Open `/order/fitbar` in the browser and verify:**
  - Dark gradient header shows correctly
  - Progress bar starts at $0 (empty) and fills as quantities are added
  - Tabs switch between Café / Shots / Comida and filter the list
  - Mobile layout shows list cards with wide image (~96px), stacked +/− buttons
  - Desktop layout (resize to ≥ 768px) shows 2-column grid with image on top
  - CTA button is greyed with "Faltan $X" when total < $1,000
  - CTA button turns gold and shows total when minimum is met
  - After adding to cart, feedback message appears with "Ir al carrito" link
  - No SKU codes visible to the user

- [ ] **Step 3: Push**

```bash
git push
```
