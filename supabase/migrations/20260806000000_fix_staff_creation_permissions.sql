-- Fix Staff User Creation
-- Re-asserts everything required for PTCAO admins to create staff accounts:
--   1. SECURITY DEFINER role-resolution helper (avoids RLS recursion).
--   2. staff_profiles RLS policies (view / manage / update-own).
--   3. users module permissions + role_permissions grants for non-MTO roles.
-- Idempotent: safe to run multiple times in the Supabase SQL editor.

-- 1. SECURITY DEFINER helper: resolve the current user's role name.
-- Runs as the function owner, bypassing RLS, so it can read staff_profiles
-- without re-entering the policies that reference it.
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

-- Executable by both anon (public pages that trigger policy checks) and
-- authenticated users.
GRANT EXECUTE ON FUNCTION public.get_user_role_name() TO anon;
GRANT EXECUTE ON FUNCTION public.get_user_role_name() TO authenticated;

-- 2. RLS policies on staff_profiles (non-recursive)

-- 2a. Staff can read staff profiles (management UIs + role resolution).
DROP POLICY IF EXISTS "Staff can view staff profiles" ON public.staff_profiles;
CREATE POLICY "Staff can view staff profiles"
  ON public.staff_profiles FOR SELECT
  USING (public.get_user_role_name() IS NOT NULL);

-- 2b. PTCAO admin (any role except MTO Staff) can manage staff profiles.
DROP POLICY IF EXISTS "PTCAO admin can manage staff profiles" ON public.staff_profiles;
CREATE POLICY "PTCAO admin can manage staff profiles"
  ON public.staff_profiles FOR ALL
  USING (public.get_user_role_name() != 'MTO Staff')
  WITH CHECK (public.get_user_role_name() != 'MTO Staff');

-- 2c. Staff can update their own profile (e.g. last_login on sign-in).
DROP POLICY IF EXISTS "Staff can update own profile" ON public.staff_profiles;
CREATE POLICY "Staff can update own profile"
  ON public.staff_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. Seed the users module permissions and grant them to all non-MTO (admin) roles.
INSERT INTO public.permissions (module, action)
SELECT 'users', a
FROM   (VALUES ('view'), ('add'), ('edit'), ('delete'), ('manage')) AS actions(a)
WHERE  NOT EXISTS (
  SELECT 1 FROM public.permissions WHERE module = 'users' AND action = a
);

INSERT INTO public.role_permissions (role_id, permission_id, granted)
SELECT r.id, p.id, true
FROM   public.roles r
CROSS JOIN public.permissions p
WHERE  r.name != 'MTO Staff'
AND    p.module = 'users'
AND    NOT EXISTS (
  SELECT 1 FROM public.role_permissions rp
  WHERE  rp.role_id = r.id AND rp.permission_id = p.id
);
