-- Enforce a single QR code per heritage site.
-- Business rule: one active QR per site, no duplicates. The app now regenerates
-- by replacing the existing row's code_value, so a UNIQUE constraint on site_id
-- cannot be broken by normal flows.
--
-- Existing test data may already contain duplicates (generated before the rule).
-- This migration removes duplicates, keeping the newest row per site, deletes the
-- scan logs that referenced the removed rows, then adds the unique index.

-- 1. Remove scan logs pointing at QR rows that will be deleted (FK has no CASCADE).
DELETE FROM public.qr_scan_logs
WHERE qr_code_id IN (
  SELECT id FROM public.qr_codes
  WHERE id NOT IN (
    SELECT DISTINCT ON (site_id) id
    FROM public.qr_codes
    ORDER BY site_id, created_at DESC
  )
);

-- 2. Delete duplicate QR rows, keeping the most recently created one per site.
DELETE FROM public.qr_codes
WHERE id NOT IN (
  SELECT DISTINCT ON (site_id) id
  FROM public.qr_codes
  ORDER BY site_id, created_at DESC
);

-- 3. Hard guarantee: one QR code per heritage site.
CREATE UNIQUE INDEX qr_codes_one_per_site_idx ON public.qr_codes (site_id);
