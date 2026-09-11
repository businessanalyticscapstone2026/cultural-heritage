-- Repair orphaned heritage_sites.category_id values + guard with FK
--
-- Root cause: migration 20250717_seed_heritage_sites.sql references hardcoded
-- category UUIDs from another environment, while 20250716 seeds categories with
-- random UUIDs. With no FK constraint, the orphaned inserts succeeded silently
-- and every category join resolved to NULL ("Uncategorized" in all charts).
--
-- This migration:
--   1. Remaps orphaned ids to the live category rows using the seed's intended
--      category names (recovered from the seed comments). Only rows whose
--      category_id matches NO existing category are touched. Idempotent.
--   2. Sends any leftovers to the 'Others' category when it exists.
--   3. Fails loudly if orphans remain (restore the missing categories first).
--   4. Adds the missing FK (ON DELETE SET NULL) so this cannot recur.
--
-- Apply in the Supabase SQL editor. Safe to re-run.

-- 1. Remap known orphaned seed ids to live categories by intended name.
UPDATE public.heritage_sites s
SET category_id = live.id
FROM (VALUES
  ('4be996c5-37fb-4e63-8791-2e2ee4e73776', 'Religious'),
  ('fa7a44b8-31c8-4b67-8a9a-ec43d73a1ac9', 'Historical'),
  ('e39d1c58-5db0-4b0b-82a8-f48c64ea7fca', 'Heritage House'),
  ('0a4295cb-6900-46f1-8fc6-bad01d369bc7', 'Natural'),
  ('4bc2f206-b00e-4eeb-b5f9-b37c666f9eba', 'Monuments & Landmarks'),
  ('e9280a0f-704b-4f7f-87fc-28d62ee677e2', 'Museum')
) AS mapping(old_id, category_name)
JOIN public.heritage_categories live ON live.name = mapping.category_name
WHERE s.category_id::text = mapping.old_id
  AND NOT EXISTS (
    SELECT 1 FROM public.heritage_categories c WHERE c.id::text = s.category_id::text
  );

-- 2. Any remaining orphans fall back to 'Others' when it exists.
UPDATE public.heritage_sites s
SET category_id = (SELECT id FROM public.heritage_categories WHERE name = 'Others' LIMIT 1)
WHERE s.category_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.heritage_categories c WHERE c.id::text = s.category_id::text
  )
  AND EXISTS (
    SELECT 1 FROM public.heritage_categories o WHERE o.name = 'Others'
  );

-- 3. Fail loudly if orphans remain (restore the missing categories, then re-run).
DO $$
DECLARE
  orphan_count integer;
BEGIN
  SELECT count(*) INTO orphan_count
  FROM public.heritage_sites s
  WHERE s.category_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.heritage_categories c WHERE c.id::text = s.category_id::text
    );

  IF orphan_count > 0 THEN
    RAISE EXCEPTION 'repair_site_category_links: % site(s) still reference missing categories; restore them first. See orphan rows via: SELECT site_name, category_id FROM heritage_sites s WHERE category_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM heritage_categories c WHERE c.id::text = s.category_id::text)', orphan_count;
  END IF;
END
$$;

-- 4. Guard: FK blocks future orphans; deleting a category degrades to
-- Uncategorized (which every chart already handles) instead of breaking.
ALTER TABLE public.heritage_sites
  DROP CONSTRAINT IF EXISTS heritage_sites_category_id_fkey;

ALTER TABLE public.heritage_sites
  ADD CONSTRAINT heritage_sites_category_id_fkey
  FOREIGN KEY (category_id)
  REFERENCES public.heritage_categories(id)
  ON DELETE SET NULL;
