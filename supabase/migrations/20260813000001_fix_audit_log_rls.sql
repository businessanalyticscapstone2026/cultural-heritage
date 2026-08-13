-- Fix audit logging RLS: municipality_audit_log was never given RLS policies
-- (found enabled with zero policies live, blocking all inserts), and
-- audit_logs policies from 20250714000002_audit_trail.sql are re-applied
-- defensively since the live database was found out of sync with them.

-- 1. municipality_audit_log: enable RLS and scope to PTCAO admin,
--    mirroring the "PTCAO admin can manage municipalities" policy.
ALTER TABLE public.municipality_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "PTCAO admin can view municipality audit log" ON public.municipality_audit_log;
CREATE POLICY "PTCAO admin can view municipality audit log"
  ON public.municipality_audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      JOIN public.roles r ON sp.role_id = r.id
      WHERE sp.id = auth.uid() AND r.name != 'MTO Staff'
    )
  );

DROP POLICY IF EXISTS "PTCAO admin can insert municipality audit log" ON public.municipality_audit_log;
CREATE POLICY "PTCAO admin can insert municipality audit log"
  ON public.municipality_audit_log FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      JOIN public.roles r ON sp.role_id = r.id
      WHERE sp.id = auth.uid() AND r.name != 'MTO Staff'
    )
  );

-- 2. audit_logs: re-assert INSERT policy for staff (any authenticated
--    server action can log; SELECT stays scoped to PTCAO admin / own logs).
DROP POLICY IF EXISTS "Staff can insert audit logs" ON public.audit_logs;
CREATE POLICY "Staff can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);
