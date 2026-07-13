-- Seed: Base Permissions for TCDSS
-- Run this via Supabase SQL Editor or psql.

-- 1. Seed the permissions table with all module × action combinations.
INSERT INTO public.permissions (module, action)
SELECT m, a
FROM   (VALUES
          ('users'::text),
          ('roles'::text),
          ('heritage'::text),
          ('municipalities'::text),
          ('gis'::text),
          ('analytics'::text),
          ('reports'::text),
          ('settings'::text),
          ('audit'::text)
       ) AS modules(m),
       (VALUES
          ('view'::text),
          ('add'::text),
          ('edit'::text),
          ('delete'::text),
          ('export'::text),
          ('approve'::text),
          ('manage'::text)
       ) AS actions(a)
WHERE  NOT EXISTS (SELECT 1 FROM public.permissions WHERE module = m AND action = a);

-- 2. Find or create the PTCAO Admin role.
INSERT INTO public.roles (name, description, status)
SELECT 'PTCAO Admin', 'Full system administrator', 'active'
WHERE  NOT EXISTS (SELECT 1 FROM public.roles WHERE name = 'PTCAO Admin');

-- 3. Grant every permission to the PTCAO Admin role.
INSERT INTO public.role_permissions (role_id, permission_id, granted)
SELECT r.id, p.id, true
FROM   public.roles r
       CROSS JOIN public.permissions p
WHERE  r.name = 'PTCAO Admin'
AND    NOT EXISTS (
          SELECT 1
          FROM   public.role_permissions rp
          WHERE  rp.role_id = r.id AND rp.permission_id = p.id
       );

-- 4. Optionally seed MTO Staff role with a limited set.
INSERT INTO public.roles (name, description, status)
SELECT 'MTO Staff', 'Municipal Tourism Officer — manages local heritage data', 'active'
WHERE  NOT EXISTS (SELECT 1 FROM public.roles WHERE name = 'MTO Staff');

INSERT INTO public.role_permissions (role_id, permission_id, granted)
SELECT r.id, p.id, true
FROM   public.roles r
       CROSS JOIN public.permissions p
WHERE  r.name = 'MTO Staff'
AND    p.action IN ('view', 'add', 'edit')
AND    p.module IN ('heritage', 'municipalities', 'gis', 'reports')
AND    NOT EXISTS (
          SELECT 1
          FROM   public.role_permissions rp
          WHERE  rp.role_id = r.id AND rp.permission_id = p.id
       );
