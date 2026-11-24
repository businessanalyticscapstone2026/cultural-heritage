-- Proposed coordinate updates (Part D). Generated from docs/proposed-coordinates.csv.
-- Only rows with confidence 'building' or 'street'. DO NOT RUN until approved.
-- Before running: export supabase/proposed/coordinates-backup.csv (site_id, latitude, longitude, geo_accuracy).
-- Each UPDATE only applies if the row still has the coordinates it had when this file was generated,
-- so a pin placed by MTO staff in the meantime is never overwritten.
-- Rows: 8
BEGIN;

-- Benito Reyes and Rosalinda Reyes (Poblacion 2): Nominatim way/754627275 (highway/unclassified) 'Calle H. del Castillo'
UPDATE public.heritage_sites SET latitude = 13.8804671, longitude = 120.9208962, geo_accuracy = 'approximate', updated_at = now()
  WHERE id = '974feecc-936c-4654-a523-8a8efc19d12f' AND latitude IS NULL AND longitude IS NULL;
-- Jose Punzalan Noche and Natividad Sison Noche (Poblacion 1): Nominatim way/50809045 (highway/residential) 'Calle Rofo Noble'
UPDATE public.heritage_sites SET latitude = 13.8766369, longitude = 120.9207810, geo_accuracy = 'approximate', updated_at = now()
  WHERE id = '13cc6390-9c66-4bf1-bea5-d3debb6f7945' AND latitude IS NULL AND longitude IS NULL;
-- Baldomero Morales (Poblacion 1): Nominatim way/230614391 (highway/residential) 'Calle Camilo Ilagan'
UPDATE public.heritage_sites SET latitude = 13.8787791, longitude = 120.9209621, geo_accuracy = 'approximate', updated_at = now()
  WHERE id = '95767573-2722-40bc-a644-32f38a631b13' AND latitude = 13.880800 AND longitude = 120.922500;
-- Carmino Ylagan at Ambrocia Noble Ylagan (Poblacion 2): Nominatim way/77449458 (highway/residential) 'Calle Gliceria Marella'
UPDATE public.heritage_sites SET latitude = 13.8798916, longitude = 120.9202423, geo_accuracy = 'approximate', updated_at = now()
  WHERE id = '0afbb27f-6708-4f87-bc66-6f75195e6a9a' AND latitude = 13.880800 AND longitude = 120.922500;
-- Ernesto Alvarez (Poblacion 1): Nominatim way/50809045 (highway/residential) 'Calle Rofo Noble'
UPDATE public.heritage_sites SET latitude = 13.8766369, longitude = 120.9207810, geo_accuracy = 'approximate', updated_at = now()
  WHERE id = 'af300e23-72db-431f-a93a-6a83df15d9ed' AND latitude = 13.880800 AND longitude = 120.922500;
-- Lourdes Montenegro Abacin (Poblacion 2): Nominatim way/77449458 (highway/residential) 'Calle Gliceria Marella'
UPDATE public.heritage_sites SET latitude = 13.8798916, longitude = 120.9202423, geo_accuracy = 'approximate', updated_at = now()
  WHERE id = 'dbf1e589-7395-4a0c-ab1d-e53a6ba1b4df' AND latitude = 13.880800 AND longitude = 120.922500;
-- Martin Solis Ancestral House (Poblacion 2): Nominatim way/77449458 (highway/residential) 'Calle Gliceria Marella'
UPDATE public.heritage_sites SET latitude = 13.8798916, longitude = 120.9202423, geo_accuracy = 'approximate', updated_at = now()
  WHERE id = 'a25fb547-5965-4ced-bdeb-e07aa5c62019' AND latitude = 13.880800 AND longitude = 120.922500;
-- Nilo Bautista (Poblacion 2): Nominatim way/77449458 (highway/residential) 'Calle Gliceria Marella'
UPDATE public.heritage_sites SET latitude = 13.8798916, longitude = 120.9202423, geo_accuracy = 'approximate', updated_at = now()
  WHERE id = '1b9b9452-4013-4bae-9550-2c242a72076c' AND latitude = 13.880800 AND longitude = 120.922500;

COMMIT;
