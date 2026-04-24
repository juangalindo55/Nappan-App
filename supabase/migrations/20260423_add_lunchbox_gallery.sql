-- Initialize lunchbox gallery with 7 empty slots
INSERT INTO event_gallery (event_type_key, label, slot, image_url, is_active)
VALUES
  ('lunchbox', 'Carrusel Lunchbox', 1, NULL, true),
  ('lunchbox', 'Carrusel Lunchbox', 2, NULL, true),
  ('lunchbox', 'Carrusel Lunchbox', 3, NULL, true),
  ('lunchbox', 'Carrusel Lunchbox', 4, NULL, true),
  ('lunchbox', 'Carrusel Lunchbox', 5, NULL, true),
  ('lunchbox', 'Carrusel Lunchbox', 6, NULL, true),
  ('lunchbox', 'Carrusel Lunchbox', 7, NULL, true)
ON CONFLICT DO NOTHING;
