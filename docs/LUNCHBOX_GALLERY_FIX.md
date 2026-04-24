# Fix: Lunchbox Gallery Not Saving

## Problem
The lunchbox gallery section in the admin dashboard shows "No hay galería configurada" or fails to save photos.

## Root Cause
The migration `20260423_add_lunchbox_gallery.sql` had invalid SQL syntax in the `ON CONFLICT` clause:
```sql
ON CONFLICT DO NOTHING;  -- ❌ INVALID - missing column specification
```

This caused the INSERT to fail silently, preventing the 7 lunchbox gallery slots from being created.

## Solution

### Step 1: Apply the New Migration

Use Supabase CLI to apply the corrected migration:

```bash
# From project root
supabase db push
```

This will apply the new migration `20260424_fix_lunchbox_gallery.sql` which:
1. Deletes any partially created lunchbox records
2. Re-inserts 7 clean gallery slots with proper `ON CONFLICT (event_type_key, slot) DO NOTHING;`

### Step 2: Verify the Fix

In the Supabase dashboard:
1. Go to **SQL Editor**
2. Run this query to verify data exists:
```sql
SELECT * FROM event_gallery WHERE event_type_key = 'lunchbox' ORDER BY slot;
```

Expected result: 7 rows with slots 1-7, all with `image_url = NULL` and `is_active = true`

### Step 3: Test in Admin Dashboard

1. Open the admin dashboard (`http://localhost:8080/pages/nappan-admin-v2.html`)
2. Log in and go to **Configuración** tab
3. Scroll to **🎂 Galería Carrusel Lunchbox**
4. You should now see 7 input fields for image URLs
5. Add an image URL (e.g., `https://example.com/lunchbox1.jpg` or `images/lunchbox.webp`)
6. Click **Guardar Galería Lunchbox**
7. Should see success message: ✓ Galería Lunchbox actualizada

## Technical Details

### What Changed
- **Before:** `ON CONFLICT DO NOTHING;` ❌ Invalid syntax
- **After:** `ON CONFLICT (event_type_key, slot) DO NOTHING;` ✅ Correct syntax

The `ON CONFLICT` clause requires specifying which column(s) define the conflict. Since `(event_type_key, slot)` uniquely identifies each gallery record, these are the columns in the conflict clause.

### Why This Broke Everything
1. Migration failed to execute properly
2. 0 lunchbox rows were inserted into `event_gallery`
3. `loadGalleryPhotos()` returns empty object `{}`
4. Admin checks `if (allGallery['lunchbox'])` → `false`
5. Shows "No hay galería configurada"
6. User cannot edit/save lunchbox photos

### Files Modified
- `supabase/migrations/20260423_add_lunchbox_gallery.sql` — Fixed ON CONFLICT syntax
- `supabase/migrations/20260424_fix_lunchbox_gallery.sql` — New migration to reset and reinitialize

## If Migration Fails

If you get an error like "table ... already exists" or "duplicate key", it means the original migration partially succeeded.

**Solution:** Run this SQL directly in Supabase SQL Editor:

```sql
-- Delete any existing lunchbox records
DELETE FROM event_gallery WHERE event_type_key = 'lunchbox';

-- Reinitialize
INSERT INTO event_gallery (event_type_key, label, slot, image_url, is_active)
VALUES
  ('lunchbox', 'Carrusel Lunchbox', 1, NULL, true),
  ('lunchbox', 'Carrusel Lunchbox', 2, NULL, true),
  ('lunchbox', 'Carrusel Lunchbox', 3, NULL, true),
  ('lunchbox', 'Carrusel Lunchbox', 4, NULL, true),
  ('lunchbox', 'Carrusel Lunchbox', 5, NULL, true),
  ('lunchbox', 'Carrusel Lunchbox', 6, NULL, true),
  ('lunchbox', 'Carrusel Lunchbox', 7, NULL, true)
ON CONFLICT (event_type_key, slot) DO NOTHING;
```

Then reload the admin dashboard.

## Prevention

Always test `ON CONFLICT` clauses with specific column names:
```sql
-- ❌ WRONG
ON CONFLICT DO UPDATE SET ...;

-- ✅ RIGHT
ON CONFLICT (column_name) DO UPDATE SET ...;
```

When multiple columns define uniqueness:
```sql
-- ✅ RIGHT
ON CONFLICT (event_type_key, slot) DO NOTHING;
```
