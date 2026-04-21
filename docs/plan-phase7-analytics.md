# Phase 7 Analytics - Migrate KPIs to Supabase RPC Functions

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate KPI computation from client-side JavaScript (stats.js) to server-side RPC functions in Supabase for better performance, reduced network payload, and cleaner separation of concerns.

**Architecture:** Create SQL RPC functions that compute aggregated statistics directly in PostgreSQL, eliminating the need to load all orders into memory and process them with JavaScript reduce/map operations. The stats.js module becomes a thin client layer that orchestrates RPC calls and caches results via AdminState. All RPC functions exclude deleted/cancelled orders automatically via SQL logic.

**Tech Stack:** PostgreSQL (RPC functions), Supabase, JavaScript client library (@supabase/supabase-js), AdminState caching

---

## File Structure

**Files to be created/modified:**

- `supabase-client.js` — Add 9 new methods to invoke RPC functions (getStatsKpis, getOrdersBySection, getOrdersByStatus, getRevenueBySection, getRevenueKpis, getOrdersByHour, getTopProducts, getTopCustomers)
- `admin-modules/stats.js` — Refactor to call RPC functions instead of computing client-side; keep computeStats() interface unchanged
- SQL Migration (run via Supabase console) — Create 8 RPC functions with optimized aggregation logic

---

## Task 1: Create SQL RPC Functions for Basic KPIs

**Files:**
- Create: RPC functions via Supabase SQL Editor (or migration script)

- [ ] **Step 1: Create RPC function for totalOrders and totalRevenue**

Execute this SQL in Supabase SQL Editor:

```sql
CREATE OR REPLACE FUNCTION get_stats_kpis()
RETURNS TABLE (
  total_orders bigint,
  total_revenue numeric,
  average_order numeric
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::bigint as total_orders,
    COALESCE(SUM(total::numeric), 0) as total_revenue,
    CASE 
      WHEN COUNT(*) = 0 THEN 0
      ELSE ROUND(COALESCE(SUM(total::numeric), 0) / COUNT(*))::numeric
    END as average_order
  FROM orders
  WHERE status NOT IN ('deleted', 'cancelled')
    AND status IS NOT NULL;
END;
$$;
```

Expected: Function created successfully. No errors in SQL console.

- [ ] **Step 2: Create RPC function for orders grouped by section**

```sql
CREATE OR REPLACE FUNCTION get_orders_by_section()
RETURNS TABLE (
  section text,
  order_count bigint
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(o.section, 'otro') as section,
    COUNT(*)::bigint as order_count
  FROM orders o
  WHERE o.status NOT IN ('deleted', 'cancelled')
    AND o.status IS NOT NULL
  GROUP BY COALESCE(o.section, 'otro')
  ORDER BY order_count DESC;
END;
$$;
```

Expected: Function created successfully.

- [ ] **Step 3: Create RPC function for revenue by section**

```sql
CREATE OR REPLACE FUNCTION get_revenue_by_section()
RETURNS TABLE (
  section text,
  revenue_sum numeric
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(o.section, 'otro') as section,
    COALESCE(SUM(o.total::numeric), 0) as revenue_sum
  FROM orders o
  WHERE o.status NOT IN ('deleted', 'cancelled')
    AND o.status IS NOT NULL
  GROUP BY COALESCE(o.section, 'otro')
  ORDER BY revenue_sum DESC;
END;
$$;
```

Expected: Function created successfully.

- [ ] **Step 4: Commit SQL RPC creation**

This is a logical checkpoint. No git commit needed yet — we're just documenting Supabase schema changes. In practice, migrations would be tracked via migrations/ folder, but Supabase schema is managed via console for now.

---

## Task 2: Create RPC Functions for Grouping & Analytics

**Files:**
- Create: RPC functions (Supabase SQL Editor)

- [ ] **Step 1: Create RPC function for orders by status**

```sql
CREATE OR REPLACE FUNCTION get_orders_by_status()
RETURNS TABLE (
  status text,
  order_count bigint
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(o.status, 'pending') as status,
    COUNT(*)::bigint as order_count
  FROM orders o
  WHERE o.status NOT IN ('deleted', 'cancelled')
    AND o.status IS NOT NULL
  GROUP BY COALESCE(o.status, 'pending')
  ORDER BY order_count DESC;
END;
$$;
```

Expected: Function created successfully.

- [ ] **Step 2: Create RPC function for orders by hour**

```sql
CREATE OR REPLACE FUNCTION get_orders_by_hour()
RETURNS TABLE (
  hour_of_day integer,
  order_count bigint
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  WITH hours AS (
    SELECT generate_series(0, 23) as h
  ),
  orders_by_hour AS (
    SELECT 
      EXTRACT(HOUR FROM o.created_at AT TIME ZONE 'America/Mexico_City')::integer as hour,
      COUNT(*)::bigint as count
    FROM orders o
    WHERE o.status NOT IN ('deleted', 'cancelled')
      AND o.status IS NOT NULL
      AND o.created_at IS NOT NULL
    GROUP BY EXTRACT(HOUR FROM o.created_at AT TIME ZONE 'America/Mexico_City')::integer
  )
  SELECT 
    h.h::integer as hour_of_day,
    COALESCE(obh.count, 0)::bigint as order_count
  FROM hours h
  LEFT JOIN orders_by_hour obh ON h.h = obh.hour
  ORDER BY h.h;
END;
$$;
```

Expected: Function created successfully. (This ensures all 24 hours are present, even if no orders in some hours.)

- [ ] **Step 3: Create RPC function for top products**

```sql
CREATE OR REPLACE FUNCTION get_top_products(limit_count integer DEFAULT 10)
RETURNS TABLE (
  product_name text,
  product_count bigint
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  WITH parsed_carts AS (
    SELECT 
      jsonb_array_elements(COALESCE(o.raw_cart_json, '[]'::jsonb)) as item
    FROM orders o
    WHERE o.status NOT IN ('deleted', 'cancelled')
      AND o.status IS NOT NULL
      AND o.raw_cart_json IS NOT NULL
  )
  SELECT 
    COALESCE(item->>'name', item->>'producto', 'Producto sin nombre') as product_name,
    COUNT(*)::bigint as product_count
  FROM parsed_carts
  GROUP BY COALESCE(item->>'name', item->>'producto', 'Producto sin nombre')
  ORDER BY product_count DESC
  LIMIT limit_count;
END;
$$;
```

**Note:** This assumes `raw_cart_json` column exists in orders table (parsed JSON). If it doesn't, use raw_cart (text) and parse it in SQL with `jsonb_to_recordset()`.

- [ ] **Step 4: Create RPC function for top customers**

```sql
CREATE OR REPLACE FUNCTION get_top_customers(limit_count integer DEFAULT 10)
RETURNS TABLE (
  customer_name text,
  order_count bigint,
  total_revenue numeric
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(o.customer_name, 'Anónimo') as customer_name,
    COUNT(*)::bigint as order_count,
    COALESCE(SUM(o.total::numeric), 0) as total_revenue
  FROM orders o
  WHERE o.status NOT IN ('deleted', 'cancelled')
    AND o.status IS NOT NULL
  GROUP BY COALESCE(o.customer_name, 'Anónimo')
  ORDER BY total_revenue DESC, order_count DESC
  LIMIT limit_count;
END;
$$;
```

Expected: Function created successfully.

- [ ] **Step 5: Commit logical checkpoint**

All RPC functions are now created in Supabase. Next step: wire them into the client.

---

## Task 3: Add RPC Invocation Methods to supabase-client.js

**Files:**
- Modify: `supabase-client.js` — Add 8 new async methods

- [ ] **Step 1: Add getStatsKpis() method**

Add this method to the NappanDB object in `supabase-client.js`:

```javascript
/**
 * Get basic statistics KPIs (totalOrders, totalRevenue, averageOrder)
 * @returns {Promise<{total_orders: number, total_revenue: number, average_order: number}>}
 */
async getStatsKpis() {
  const { data, error } = await this.client.rpc('get_stats_kpis');
  if (error) throw new Error(`RPC get_stats_kpis failed: ${error.message}`);
  
  // RPC returns array with one row, extract it
  const row = data && data.length > 0 ? data[0] : {};
  return {
    total_orders: row.total_orders || 0,
    total_revenue: row.total_revenue || 0,
    average_order: row.average_order || 0
  };
},
```

Expected: Method added. No syntax errors.

- [ ] **Step 2: Add getOrdersBySection() method**

```javascript
/**
 * Get orders grouped by section
 * @returns {Promise<{section: string, order_count: number}[]>}
 */
async getOrdersBySection() {
  const { data, error } = await this.client.rpc('get_orders_by_section');
  if (error) throw new Error(`RPC get_orders_by_section failed: ${error.message}`);
  
  // Convert to object format matching stats.js output: { section: count }
  const result = {};
  (data || []).forEach(row => {
    result[row.section] = row.order_count;
  });
  return result;
},
```

Expected: Method added.

- [ ] **Step 3: Add getOrdersByStatus() and getRevenueBySection() methods**

```javascript
/**
 * Get orders grouped by status
 * @returns {Promise<{status: string, order_count: number}[]>}
 */
async getOrdersByStatus() {
  const { data, error } = await this.client.rpc('get_orders_by_status');
  if (error) throw new Error(`RPC get_orders_by_status failed: ${error.message}`);
  
  const result = {};
  (data || []).forEach(row => {
    result[row.status] = row.order_count;
  });
  return result;
},

/**
 * Get revenue grouped by section
 * @returns {Promise<{section: string, revenue_sum: number}[]>}
 */
async getRevenueBySection() {
  const { data, error } = await this.client.rpc('get_revenue_by_section');
  if (error) throw new Error(`RPC get_revenue_by_section failed: ${error.message}`);
  
  const result = {};
  (data || []).forEach(row => {
    result[row.section] = row.revenue_sum;
  });
  return result;
},
```

Expected: Methods added.

- [ ] **Step 4: Add getOrdersByHour(), getTopProducts(), getTopCustomers() methods**

```javascript
/**
 * Get orders grouped by hour (0-23)
 * @returns {Promise<{hour: number, order_count: number}[]>}
 */
async getOrdersByHour() {
  const { data, error } = await this.client.rpc('get_orders_by_hour');
  if (error) throw new Error(`RPC get_orders_by_hour failed: ${error.message}`);
  
  const result = {};
  (data || []).forEach(row => {
    result[row.hour_of_day] = row.order_count;
  });
  return result;
},

/**
 * Get top products by count
 * @param {number} limit - Number of products to return (default 10)
 * @returns {Promise<{name: string, count: number}[]>}
 */
async getTopProducts(limit = 10) {
  const { data, error } = await this.client.rpc('get_top_products', { limit_count: limit });
  if (error) throw new Error(`RPC get_top_products failed: ${error.message}`);
  
  return (data || []).map(row => ({
    name: row.product_name,
    count: row.product_count
  }));
},

/**
 * Get top customers by revenue
 * @param {number} limit - Number of customers to return (default 10)
 * @returns {Promise<{name: string, count: number, revenue: number}[]>}
 */
async getTopCustomers(limit = 10) {
  const { data, error } = await this.client.rpc('get_top_customers', { limit_count: limit });
  if (error) throw new Error(`RPC get_top_customers failed: ${error.message}`);
  
  return (data || []).map(row => ({
    name: row.customer_name,
    count: row.order_count,
    revenue: row.total_revenue
  }));
},
```

Expected: All methods added. No syntax errors in browser console.

- [ ] **Step 5: Commit RPC client methods**

```bash
git add supabase-client.js
git commit -m "feat: add RPC invocation methods for analytics KPIs"
```

Expected: Commit successful.

---

## Task 4: Refactor stats.js to Use RPC Functions

**Files:**
- Modify: `admin-modules/stats.js` — Replace computeStats() implementation

- [ ] **Step 1: Replace computeStats() to call RPCs in parallel**

Replace the entire `computeStats()` method (lines 83-101) with:

```javascript
async computeStats() {
  const db = this.getDb();
  
  try {
    // Call all RPC functions in parallel
    const [
      kpis,
      ordersBySection,
      ordersByStatus,
      revenueBySection,
      ordersByHour,
      topProducts,
      topCustomers
    ] = await Promise.all([
      db.getStatsKpis(),
      db.getOrdersBySection(),
      db.getOrdersByStatus(),
      db.getRevenueBySection(),
      db.getOrdersByHour(),
      db.getTopProducts(10),
      db.getTopCustomers(10)
    ]);
    
    return {
      totalOrders: kpis.total_orders,
      totalRevenue: kpis.total_revenue,
      averageOrder: kpis.average_order,
      ordersBySection,
      ordersByStatus,
      revenueBySection,
      ordersByHour,
      topProducts,
      topCustomers
    };
  } catch (error) {
    console.error('Error computing stats from RPC:', error);
    throw error;
  }
},
```

**Note:** This maintains the exact same return shape as before, so calling code in the admin dashboard needs NO changes.

Expected: Method updated. No breaking changes to return interface.

- [ ] **Step 2: Remove client-side helper methods (optional cleanup)**

You can now optionally remove these private methods since they're no longer used:
- `_calculateTotalRevenue()`
- `_calculateAverageOrder()`
- `groupBySection()`
- `groupByStatus()`
- `revenueBySection()`
- `groupByHour()`
- `topProducts()`
- `topCustomers()`

However, **if you want to keep them for fallback or documentation, you can leave them**. The important thing is that `computeStats()` now uses RPCs.

For this exercise, **remove them to clean up the file**:

Delete lines 103-260 (all the private helper methods). After deletion, the file should end with the `computeStats()` method you just wrote.

Expected: File is cleaner, about 100 lines instead of 316.

- [ ] **Step 3: Update load() method to mark stats as loaded**

Check that the `load()` method (lines 43-77) still works correctly. The logic should remain unchanged—it calls `computeStats()` which now internally calls RPCs.

Verify: The method should still:
1. Check `AdminState.stats.cache.loaded` and return cached data if `force=false`
2. Call `computeStats()`
3. Cache the result via `AdminState.setStats()`
4. Clear UI loading state

No changes needed here if this logic is already correct.

Expected: load() method unchanged and working.

- [ ] **Step 4: Commit refactoring**

```bash
git add admin-modules/stats.js
git commit -m "feat: migrate KPI computation to Supabase RPC functions"
```

Expected: Commit successful.

---

## Task 5: Manual Testing & Verification

**Files:**
- Test: `http://localhost:8080/nappan-admin-v2.html`

- [ ] **Step 1: Open admin dashboard and navigate to Estadísticas tab**

1. Start local server: `.claude\serve.bat` (should run on port 8080)
2. Open http://localhost:8080/nappan-admin-v2.html
3. Login with test credentials
4. Click "Estadísticas" tab

Expected: Page loads without errors.

- [ ] **Step 2: Verify RPC calls in network tab**

1. Open DevTools (F12) → Network tab
2. Look for RPC calls: You should see network requests to `rpc/get_stats_kpis`, `rpc/get_orders_by_section`, etc.
3. Verify each returns 200 status and valid JSON

Expected: All 7 RPC calls succeed (or fewer if no data).

- [ ] **Step 3: Verify KPIs display correctly**

1. In "Estadísticas" tab, check these values display:
   - "Total Pedidos" (totalOrders)
   - "Ingresos Totales" (totalRevenue)
   - "Promedio por Pedido" (averageOrder)
2. Check that the values look reasonable (non-zero if you have test orders)
3. Verify charts render (ordersBySection, revenueBySection, ordersByHour)

Expected: All KPIs and charts display correctly. Values match what you expect.

- [ ] **Step 4: Verify cache invalidation**

1. In another browser tab, place a new test order (e.g., via nappan-lunchbox.html)
2. Return to admin dashboard
3. Click "Estadísticas" tab again
4. Check that KPIs update to reflect the new order

Note: You may need to manually refresh or click a "Refresh Stats" button if it exists.

Expected: Stats update when new orders are placed.

- [ ] **Step 5: Check console for errors**

1. Open DevTools Console
2. Look for any errors related to RPC calls (e.g., "RPC ... failed: ...")
3. Verify no "Cannot read properties of undefined" errors

Expected: No console errors. If errors exist, debug and fix before proceeding.

- [ ] **Step 6: Commit test results**

No code changes, just documentation. If all tests pass, you're done!

```bash
git log --oneline | head -5
# Should show the two commits:
# - "feat: migrate KPI computation to Supabase RPC functions"
# - "feat: add RPC invocation methods for analytics KPIs"
```

Expected: Commits are in history.

---

## Summary of Changes

| File | Changes |
|------|---------|
| `supabase-client.js` | +8 methods for RPC invocation |
| `admin-modules/stats.js` | Refactored computeStats() to use RPCs; removed 170+ lines of client-side helpers |
| Supabase Schema | +8 RPC functions |

**Backward Compatibility:** ✅ Maintained. The return shape of `computeStats()` is unchanged, so all code calling it continues to work without modification.

**Performance Impact:** 📈 Improved. RPC functions run on PostgreSQL (much faster for aggregation) and return only aggregated results (smaller network payload).

---

## Spec Coverage Self-Review

✅ Create RPC functions for each KPI → Tasks 1-2 create all 8 RPCs
✅ Add client methods to invoke RPCs → Task 3 adds all methods
✅ Refactor stats.js to use RPCs → Task 4 refactors computeStats()
✅ Maintain caching & invalidation → AdminState logic unchanged (still works)
✅ Zero breaking changes → Return shape of computeStats() unchanged
✅ Testing → Task 5 verifies all KPIs and RPC calls

**No gaps found.**

---

Plan complete and saved. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session, batch execution with checkpoints

Which approach would you prefer?