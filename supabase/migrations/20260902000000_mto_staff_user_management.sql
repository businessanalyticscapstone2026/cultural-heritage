-- MTO Staff User Management (scoped to own municipality)
-- Allows MTO Staff to manage staff accounts within their own municipality:
--   1. SECURITY DEFINER municipality-resolution helper (avoids RLS recursion).
--   2. staff_profiles RLS policies for MTO-scoped INSERT / UPDATE / DELETE.
--   3. users module permissions granted to the MTO Staff role.
-- Idempotent: safe to run multiple times in the Supabase SQL editor.

-- 1. SECURITY DEFINER helper: resolve the current user's municipality.
-- Runs as the function owner, bypassing RLS, so it can read staff_profiles
-- without re-entering the policies that reference it.
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

GRANT EXECUTE ON FUNCTION public.get_user_municipality_id() TO anon;
GRANT EXECUTE ON FUNCTION public.get_user_municipality_id() TO authenticated;

-- 2. RLS policies on staff_profiles for MTO-scoped management.
-- MTO Staff may insert accounts only into their own municipality.
DROP POLICY IF EXISTS "MTO staff can create own-municipality staff profiles" ON public.staff_profiles;
CREATE POLICY "MTO staff can create own-municipality staff profiles"
  ON public.staff_profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_user_role_name() = 'MTO Staff'
    AND municipality_id IS NOT DISTINCT FROM public.get_user_municipality_id()
  );

-- MTO Staff may update accounts only within their own municipality,
-- and may never move an account out of their municipality.
DROP POLICY IF EXISTS "MTO staff can update own-municipality staff profiles" ON public.staff_profiles;
CREATE POLICY "MTO staff can update own-municipality staff profiles"
  ON public.staff_profiles FOR UPDATE
  TO authenticated
  USING (
    public.get_user_role_name() = 'MTO Staff'
    AND municipality_id IS NOT DISTINCT FROM public.get_user_municipality_id()
  )
  WITH CHECK (
    public.get_user_role_name() = 'MTO Staff'
    AND municipality_id IS NOT DISTINCT FROM public.get_user_municipality_id()
  );

-- MTO Staff may delete accounts only within their own municipality.
DROP POLICY IF EXISTS "MTO staff can delete own-municipality staff profiles" ON public.staff_profiles;
CREATE POLICY "MTO staff can delete own-municipality staff profiles"
  ON public.staff_profiles FOR DELETE
  TO authenticated
  USING (
    public.get_user_role_name() = 'MTO Staff'
    AND municipality_id IS NOT DISTINCT FROM public.get_user_municipality_id()
  );

-- 3. Grant the users module permissions to the MTO Staff role.
-- API-level municipality scoping (see app/api/users) keeps this confined
-- to the manager's own municipality.
INSERT INTO public.role_permissions (role_id, permission_id, granted)
SELECT r.id, p.id, true
FROM   public.roles r
CROSS JOIN public.permissions p
WHERE  r.name = 'MTO Staff'
AND    p.module = 'users'
AND    p.action IN ('view', 'add', 'edit', 'delete')
AND    NOT EXISTS (
  SELECT 1 FROM public.role_permissions rp
  WHERE  rp.role_id = r.id AND rp.permission_id = p.id
);
