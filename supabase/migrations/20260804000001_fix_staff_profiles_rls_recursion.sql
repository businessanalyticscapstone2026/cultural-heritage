-- Fix infinite recursion in staff_profiles RLS policies
-- The previous migration (20260804000000) added policies on staff_profiles
-- that contained self-referencing subqueries (SELECT ... FROM staff_profiles
-- inside a policy ON staff_profiles). Because many other tables' policies
-- (heritage_sites, municipalities, etc.) already subquery staff_profiles,
-- PostgreSQL entered an infinite recursion loop.
--
-- Fix: introduce a SECURITY DEFINER function for role resolution (runs
-- outside RLS) and rewrite the policies to avoid self-referencing subqueries.

-- 0. Security definer helper: resolve the current user's role name.
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

-- 1. RLS policies on staff_profiles (non-recursive)

-- 1a. Staff can read staff profiles (management UIs + role resolution).
-- Other tables' policies (heritage_sites, municipalities, ...) subquery
-- staff_profiles to authorize the current user; using the SECURITY DEFINER
-- function here lets those subqueries resolve without recursing.
DROP POLICY IF EXISTS "Staff can view staff profiles" ON public.staff_profiles;
CREATE POLICY "Staff can view staff profiles"
  ON public.staff_profiles FOR SELECT
  USING (public.get_user_role_name() IS NOT NULL);

-- 1b. PTCAO admin (any role except MTO Staff) can manage staff profiles.
-- Uses the SECURITY DEFINER function instead of a self-referencing subquery.
DROP POLICY IF EXISTS "PTCAO admin can manage staff profiles" ON public.staff_profiles;
CREATE POLICY "PTCAO admin can manage staff profiles"
  ON public.staff_profiles FOR ALL
  USING (public.get_user_role_name() != 'MTO Staff')
  WITH CHECK (public.get_user_role_name() != 'MTO Staff');

-- 1c. Staff can update their own profile (e.g. last_login on sign-in).
DROP POLICY IF EXISTS "Staff can update own profile" ON public.staff_profiles;
CREATE POLICY "Staff can update own profile"
  ON public.staff_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
