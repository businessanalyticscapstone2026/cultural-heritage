-- Staff Profiles RLS + Permissions
-- Ensures PTCAO admins can manage staff accounts (create / update municipality / toggle status)
-- through the user-scoped Supabase client, and that the `users` module permissions are seeded.

-- 1. RLS policies on staff_profiles
-- 1a. Staff can view staff profiles (management UIs + role resolution)
DROP POLICY IF EXISTS "Staff can view staff profiles" ON public.staff_profiles;
CREATE POLICY "Staff can view staff profiles"
  ON public.staff_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp WHERE sp.id = auth.uid()
    )
  );

-- 1b. PTCAO admin can manage staff profiles (insert / update / delete)
DROP POLICY IF EXISTS "PTCAO admin can manage staff profiles" ON public.staff_profiles;
CREATE POLICY "PTCAO admin can manage staff profiles"
  ON public.staff_profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      JOIN public.roles r ON sp.role_id = r.id
      WHERE sp.id = auth.uid() AND r.name != 'MTO Staff'
    )
  );

-- 1c. Staff can update their own profile (e.g. last_login on sign-in)
DROP POLICY IF EXISTS "Staff can update own profile" ON public.staff_profiles;
CREATE POLICY "Staff can update own profile"
  ON public.staff_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 2. Seed the users module permissions and grant them to all non-MTO (admin) roles
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
