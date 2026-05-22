# 🔄 Step 1 — Data Extraction & Layer Preparation

## 🎯 Objective

Prepare the data layer to receive **real backend data** (Supabase) without changing the UI or breaking the current visual flow.

Keep the app looking and behaving exactly the same, but make the architecture ready for Supabase integration.

---

## 📊 Current State

### What exists now:

```
/src/features/products/
  ├── product.constants.ts    ← HARDCODED PRODUCTS array
  ├── product.types.ts        ← Type definitions
  ├── product.service.ts      ← listProducts() — async but returns hardcoded data
  └── product.selectors.ts    ← getActiveProducts() — filters/sorts
```

### How data flows:

```
product.constants.ts (hardcoded)
         ↓
product.service.ts (async but unused)
         ↓
useHomeData hook (pulls from constants directly)
         ↓
HomeScreen component
         ↓
UI renders
```

### The Problem:

- `useHomeData` imports `PRODUCTS` directly from constants
- It does NOT use the async `listProducts()` service
- Loading/error states are hardcoded to `false` / `null`
- No place to plug in Supabase later
- Service layer is async but not actually used

---

## ✅ What Step 1 Will Do

### 1. **Make `useHomeData` actually use the service**

Currently:
```ts
const [products] = useState(() => getActiveProducts(PRODUCTS))
```

Should be:
```ts
const [products, setProducts] = useState<Product[]>([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)

useEffect(() => {
  setLoading(true)
  listProducts()
    .then(setProducts)
    .catch(err => setError(err.message))
    .finally(() => setLoading(false))
}, [])
```

### 2. **Update `product.service.ts` to prepare for Supabase**

Add a comment or structure that shows where Supabase will go:

```ts
export async function listProducts() {
  // TODO: Replace with Supabase query
  // const { data, error } = await supabase
  //   .from('products')
  //   .select('*')
  
  return getActiveProducts(PRODUCTS)
}
```

### 3. **Ensure `HomeScreen` properly handles loading/error states**

Already done, but verify it works with actual async flow.

### 4. **Keep constants for now** (for local development)

`product.constants.ts` stays as-is. It becomes the "mock" data layer.

---

## 🤔 Why This Approach?

### Why separate data layer from UI?

**Current problem:** If data is hardcoded in the component, every time you want to:
- Add a product
- Filter products
- Change how data is fetched

...you must touch the UI component. This breaks the separation of concerns.

**Solution:** UI should only care about *rendering* data, not *where it comes from*.

### Why use an async service?

**Current problem:** `listProducts()` exists but is never called. Loading/error are fake.

**Solution:** Make the service actually async. This:
1. Prepares the code for real async Supabase queries
2. Makes `useHomeData` handle real loading states
3. Prevents surprise errors when we swap to real data

### Why keep the hook?

**Current problem:** If we load data directly in HomeScreen, every screen needs its own fetch logic.

**Solution:** Keep `useHomeData` as a custom hook. It:
1. Encapsulates where/how data is fetched
2. Can be reused in other screens
3. Makes it easy to swap the service later

### Why leave constants for now?

**Current problem:** We could delete PRODUCTS and hardcode Supabase query immediately, but that breaks local development and testing.

**Solution:** Keep constants as a mock. Replace later when Supabase is ready:
- Local dev uses constants
- Production uses Supabase (swap in service layer)
- No UI changes needed

---

## 📋 Implementation Steps

### Step 1a — Update `useHomeData` hook

**File:** `/src/features/home/hooks/useHomeData.ts`

Change from static state to actual async flow:

```ts
'use client'

import { useEffect, useState } from 'react'
import { listProducts } from '@/features/products/product.service'
import type { Product } from '@/features/products/product.types'

type HomeData = {
  featuredProduct: Product | null
  greeting: string
  products: Product[]
  loading: boolean
  error: string | null
}

function getGreeting(date = new Date()) {
  const hour = date.getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

export function useHomeData(): HomeData {
  const [greeting] = useState(() => getGreeting())
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const loadProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await listProducts()
        if (mounted) {
          setProducts(data)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load products')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadProducts()

    return () => {
      mounted = false
    }
  }, [])

  return {
    featuredProduct: products[0] ?? null,
    greeting,
    products,
    loading,
    error,
  }
}
```

### Step 1b — Update `product.service.ts` to document Supabase placeholder

**File:** `/src/features/products/product.service.ts`

```ts
import { PRODUCTS } from './product.constants'
import { getActiveProducts } from './product.selectors'

// TODO (Supabase integration):
// 1. Import Supabase client
// 2. Replace PRODUCTS with database query
// 3. Remove PRODUCTS import once migrated
// 4. Add error handling for DB failures
//
// Example:
// import { createClient } from '@supabase/supabase-js'
// const supabase = createClient(url, key)
//
// export async function listProducts() {
//   const { data, error } = await supabase
//     .from('products')
//     .select('*')
//   if (error) throw error
//   return getActiveProducts(data)
// }

export async function listProducts() {
  // Currently using mock data (constants)
  // Will be replaced by Supabase query in Phase 3
  return getActiveProducts(PRODUCTS)
}
```

### Step 1c — Verify `HomeScreen` still works

**File:** `/src/features/home/HomeScreen.tsx`

No changes needed. It already:
- Calls `useHomeData()`
- Handles `loading` state
- Handles `error` state
- Renders products

---

## 🧪 Testing Step 1

### Visual tests:

1. ✅ App loads and shows products (same as before)
2. ✅ Featured product appears
3. ✅ Products grid appears with correct items
4. ✅ Greeting matches time of day
5. ✅ All styles/animations work

### Data flow tests:

1. ✅ `useHomeData` calls `listProducts()`
2. ✅ Loading state briefly shows
3. ✅ Products populate correctly
4. ✅ No console errors

### No UI changes:

The entire UI should look and behave **identically** to before. Step 1 is only about *how* we get the data, not *what* we show.

---

## 🚀 What This Enables (Next Steps)

After Step 1:

- ✅ Data layer is separate from UI
- ✅ Async/loading/error handling is real, not fake
- ✅ Service layer is ready for Supabase swap
- ✅ Hook is reusable in other screens
- ✅ No breaking changes to UI

**Ready for:** Step 2 — Introduce global state (Zustand) for cart, user, booking.

---

## ⚠️ Why NOT do this differently?

### "Why not just fetch in the component?"

**Bad:** Every screen needs its own fetch logic. Duplicates code.

**Good:** Custom hook encapsulates it. Reusable.

### "Why not use Supabase right now?"

**Bad:** Don't have Supabase schema yet. Will cause breakage.

**Good:** Keep mock data. Swap service layer later.

### "Why make it async if we're still using constants?"

**Bad:** Constants are sync. Adding async is fake work.

**Good:** Tests the actual flow we'll use in production. Finds issues now, not later.

### "Why not skip straight to state management?"

**Bad:** Global state without proper data layer is chaos.

**Good:** Data layer first. State after. Clean separation.

---

## ✅ Success Criteria

Step 1 is complete when:

- ✅ `useHomeData` actually calls `listProducts()`
- ✅ Loading/error states work (even if always false/null during mock phase)
- ✅ `product.service.ts` has clear Supabase placeholder
- ✅ App looks and behaves identically
- ✅ `npm run build` passes
- ✅ `npm run lint` passes
- ✅ No console errors

---

## 📌 Notes

- **Don't refactor components yet.** They'll be clean once we finish all phases.
- **Don't add tests yet.** Architecture is still stabilizing.
- **Do keep this focused.** Only data extraction. Nothing else.
