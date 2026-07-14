-- Audit Trail & Security: login_attempts, audit_logs, security_events tables

-- 1. Login attempts table (tracks all login successes and failures)
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  email_attempted text NOT NULL,
  outcome text NOT NULL CHECK (outcome = ANY (ARRAY['success'::text, 'failed_password'::text, 'failed_locked'::text, 'failed_unknown_account'::text])),
  ip_address text,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT login_attempts_pkey PRIMARY KEY (id),
  CONSTRAINT login_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_user_id ON public.login_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_login_attempts_created_at ON public.login_attempts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON public.login_attempts(email_attempted);
CREATE INDEX IF NOT EXISTS idx_login_attempts_outcome ON public.login_attempts(outcome);

-- 2. Audit logs table (general activity logging for all modules)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  category text NOT NULL CHECK (category = ANY (ARRAY['heritage'::text, 'governance'::text, 'municipality'::text, 'user_management'::text, 'settings'::text, 'media'::text, 'system'::text])),
  action text NOT NULL,
  target_type text,
  target_id text,
  detail jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_category ON public.audit_logs(category);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON public.audit_logs(target_type, target_id);

-- 3. Security events table (suspicious activity, permission denials, account lockouts)
CREATE TABLE IF NOT EXISTS public.security_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  event_type text NOT NULL,
  detail text,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT security_events_pkey PRIMARY KEY (id),
  CONSTRAINT security_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON public.security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON public.security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON public.security_events(created_at DESC);

-- 4. Enable Row Level Security
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- PTCAO admin can read all audit data
CREATE POLICY "PTCAO admin can view all login attempts"
  ON public.login_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      JOIN public.roles r ON sp.role_id = r.id
      WHERE sp.id = auth.uid() AND r.name != 'MTO Staff'
    )
  );

CREATE POLICY "PTCAO admin can view all audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      JOIN public.roles r ON sp.role_id = r.id
      WHERE sp.id = auth.uid() AND r.name != 'MTO Staff'
    )
  );

CREATE POLICY "PTCAO admin can view all security events"
  ON public.security_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      JOIN public.roles r ON sp.role_id = r.id
      WHERE sp.id = auth.uid() AND r.name != 'MTO Staff'
    )
  );

-- Any authenticated staff can insert (for logging from server actions)
CREATE POLICY "Staff can insert login attempts"
  ON public.login_attempts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Staff can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Staff can insert security events"
  ON public.security_events FOR INSERT
  WITH CHECK (true);

-- MTO staff can read their own audit logs
CREATE POLICY "MTO staff can view own audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      WHERE sp.id = auth.uid()
        AND audit_logs.user_id = auth.uid()
    )
  );
