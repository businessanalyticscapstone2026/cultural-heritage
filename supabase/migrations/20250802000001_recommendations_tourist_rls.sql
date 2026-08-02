-- Recommendations: allow anonymous and logged-in tourists to persist and read
-- recommendation rows so click-through can be tracked without an account.
-- The original insert/update policies (20250714000004) were authenticated-only,
-- so anonymous visitors silently matched zero rows.

-- 1. Drop the authenticated-only insert/update policies.
DROP POLICY IF EXISTS "System can insert recommendations" ON public.recommendations;
DROP POLICY IF EXISTS "System can update recommendations" ON public.recommendations;

-- 2. Recreate insert/update policies for both anon and authenticated roles.
CREATE POLICY "System can insert recommendations"
  ON public.recommendations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "System can update recommendations"
  ON public.recommendations
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 3. Tourists may read their own recommendation rows (recommendation badges).
--    MTO staff keep their municipality-scoped read policy; staff tourist_id
--    never matches tourist rows, so scoping is preserved.
CREATE POLICY "Tourists read own recommendations"
  ON public.recommendations
  FOR SELECT
  TO authenticated
  USING (tourist_id = auth.uid());

-- 4. Anonymous visitors may read recommendation rows (scoped client-side by
--    session_id in the explore query).
CREATE POLICY "Public can read recommendations"
  ON public.recommendations
  FOR SELECT
  TO anon
  USING (true);
