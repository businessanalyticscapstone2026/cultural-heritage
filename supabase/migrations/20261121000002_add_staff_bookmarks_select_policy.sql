-- Migration: Allow MTO staff and PTCAO admin to select bookmarks for dashboard KPIs and analytics

-- 1. MTO staff can view bookmarks for heritage sites in their assigned municipality
DROP POLICY IF EXISTS "MTO staff can view bookmarks for own municipality" ON public.bookmarks;
CREATE POLICY "MTO staff can view bookmarks for own municipality"
  ON public.bookmarks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      JOIN public.roles r ON sp.role_id = r.id
      JOIN public.heritage_sites hs ON hs.id = bookmarks.site_id
      WHERE sp.id = auth.uid()
        AND r.name = 'MTO Staff'
        AND sp.municipality_id = hs.municipality_id
    )
  );

-- 2. PTCAO admin can view all bookmarks across all municipalities
DROP POLICY IF EXISTS "PTCAO admin can view all bookmarks" ON public.bookmarks;
CREATE POLICY "PTCAO admin can view all bookmarks"
  ON public.bookmarks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      JOIN public.roles r ON sp.role_id = r.id
      WHERE sp.id = auth.uid()
        AND r.name != 'MTO Staff'
    )
  );
