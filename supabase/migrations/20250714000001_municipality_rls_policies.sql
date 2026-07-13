-- Municipality RLS Policies: Enable RLS and add access policies
-- municipalities is reference data — public needs SELECT, staff need manage access

-- 1. Enable RLS on municipalities (safe to run even if already enabled)
ALTER TABLE public.municipalities ENABLE ROW LEVEL SECURITY;

-- 2. Public can view active municipalities (reference data)
CREATE POLICY "Public can view municipalities"
  ON public.municipalities FOR SELECT
  USING (status = 'active');

-- 3. Staff (PTCAO admin + MTO) can view all municipalities
CREATE POLICY "Staff can view all municipalities"
  ON public.municipalities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp WHERE sp.id = auth.uid()
    )
  );

-- 4. PTCAO admin can manage municipalities (insert, update, delete)
CREATE POLICY "PTCAO admin can manage municipalities"
  ON public.municipalities FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      JOIN public.roles r ON sp.role_id = r.id
      WHERE sp.id = auth.uid() AND r.name != 'MTO Staff'
    )
  );
