-- Fix: Re-initialize lunchbox gallery with proper ON CONFLICT clause
-- This migration ensures 7 lunchbox gallery slots exist for the carousel

-- Delete any existing lunchbox records to ensure clean state
DELETE FROM event_gallery WHERE event_type_key = 'lunchbox';

-- Reinitialize with corrected ON CONFLICT syntax
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
