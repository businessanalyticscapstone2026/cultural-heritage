-- Grant the MTO Staff role the heritage delete permission.
-- Required for the permanent delete of archived sites: the heritage_sites RLS policy
-- "staff_delete_sites" gates DELETE on has_permission('heritage', 'delete'), and the
-- seed (scripts/seed-permissions.sql) only grants MTO Staff view/add/edit.
-- RLS still scopes deletes to the staff member's own municipality.

-- 1. Insert the row if it does not exist yet.
INSERT INTO public.role_permissions (role_id, permission_id, granted)
SELECT r.id, p.id, true
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'MTO Staff'
  AND p.module = 'heritage'
  AND p.action = 'delete'
  AND NOT EXISTS (
    SELECT 1 FROM public.role_permissions rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

-- 2. In case a row already exists but is granted = false, flip it on.
UPDATE public.role_permissions rp
SET granted = true
FROM public.roles r, public.permissions p
WHERE rp.role_id = r.id
  AND rp.permission_id = p.id
  AND r.name = 'MTO Staff'
  AND p.module = 'heritage'
  AND p.action = 'delete';
