-- Fix heritage_categories visibility for app roles
--
-- Symptom: heritage_sites.category_id values match existing categories, yet
-- every category join resolves to NULL ("Uncategorized" in all charts).
-- Cause: this database's RLS policies on heritage_categories differ from (or
-- predate) migration 20250713000000_heritage_repository.sql, so the app role
-- cannot read category rows and PostgREST embedded joins come back empty.
--
-- This migration re-asserts the intended policies idempotently:
--   - anyone (anon + authenticated) can SELECT categories (USING (true));
--   - staff can manage categories.
-- No data is modified. Apply in the Supabase SQL editor. Safe to re-run.

ALTER TABLE public.heritage_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view heritage categories" ON public.heritage_categories;
CREATE POLICY "Public can view heritage categories"
  ON public.heritage_categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Staff can manage heritage categories" ON public.heritage_categories;
CREATE POLICY "Staff can manage heritage categories"
  ON public.heritage_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp WHERE sp.id = auth.uid()
    )
  );

-- Verify after applying (expect your category count, not 0):
--   SET ROLE authenticated;
--   SELECT count(*) FROM heritage_categories;
--   RESET ROLE;
