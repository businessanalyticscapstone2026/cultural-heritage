-- Migration: 20261121000006_fix_qr_codes_rls_policies.sql
-- Description: Fix RLS policies on qr_codes table to allow MTO staff to update
--              status (activate / deactivate) and regenerate QR codes for heritage
--              sites in their municipality without triggering "new row violates
--              row-level security policy for table qr_codes".

-- 1. Helper functions with SECURITY DEFINER (avoids RLS recursion and join scoping issues)

CREATE OR REPLACE FUNCTION public.get_user_role_name()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.name
  FROM public.staff_profiles sp
  JOIN public.roles r ON sp.role_id = r.id
  WHERE sp.id = auth.uid()
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_role_name() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_user_municipality_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT sp.municipality_id
  FROM public.staff_profiles sp
  WHERE sp.id = auth.uid()
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_municipality_id() TO anon, authenticated;

-- Helper to check if a heritage site belongs to the caller's assigned municipality
CREATE OR REPLACE FUNCTION public.can_mto_manage_site_qr(check_site_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.heritage_sites hs
    WHERE hs.id = check_site_id
      AND hs.municipality_id = public.get_user_municipality_id()
  );
$$;

GRANT EXECUTE ON FUNCTION public.can_mto_manage_site_qr(uuid) TO anon, authenticated;

-- 2. Drop ALL existing policies on qr_codes to eliminate legacy/conflicting policies
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'qr_codes'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.qr_codes', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

-- 3. Re-create clean canonical policies on qr_codes

-- 3a. SELECT: Public and authenticated users can view QR codes
CREATE POLICY "Allow public read of QR codes"
  ON public.qr_codes FOR SELECT
  TO anon, authenticated
  USING (true);

-- 3b. INSERT: MTO staff can insert QR codes for sites in their municipality
CREATE POLICY "MTO staff can insert QR codes"
  ON public.qr_codes FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_user_role_name() = 'MTO Staff'
    AND public.can_mto_manage_site_qr(site_id)
  );

-- 3c. INSERT: PTCAO admin can insert QR codes for any site
CREATE POLICY "PTCAO admin can insert QR codes"
  ON public.qr_codes FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_user_role_name() IS NOT NULL
    AND public.get_user_role_name() != 'MTO Staff'
  );

-- 3d. UPDATE: MTO staff can update QR codes (status, code_value) for sites in their municipality
CREATE POLICY "MTO staff can update QR codes"
  ON public.qr_codes FOR UPDATE
  TO authenticated
  USING (
    public.get_user_role_name() = 'MTO Staff'
    AND public.can_mto_manage_site_qr(site_id)
  )
  WITH CHECK (
    public.get_user_role_name() = 'MTO Staff'
    AND public.can_mto_manage_site_qr(site_id)
  );

-- 3e. UPDATE: PTCAO admin can update QR codes for any site
CREATE POLICY "PTCAO admin can update QR codes"
  ON public.qr_codes FOR UPDATE
  TO authenticated
  USING (
    public.get_user_role_name() IS NOT NULL
    AND public.get_user_role_name() != 'MTO Staff'
  )
  WITH CHECK (
    public.get_user_role_name() IS NOT NULL
    AND public.get_user_role_name() != 'MTO Staff'
  );

-- 3f. DELETE: MTO staff can delete QR codes for sites in their municipality
CREATE POLICY "MTO staff can delete own municipality QR codes"
  ON public.qr_codes FOR DELETE
  TO authenticated
  USING (
    public.get_user_role_name() = 'MTO Staff'
    AND public.can_mto_manage_site_qr(site_id)
  );

-- 3g. DELETE: PTCAO admin can delete QR codes for any site
CREATE POLICY "PTCAO admin can delete QR codes"
  ON public.qr_codes FOR DELETE
  TO authenticated
  USING (
    public.get_user_role_name() IS NOT NULL
    AND public.get_user_role_name() != 'MTO Staff'
  );
