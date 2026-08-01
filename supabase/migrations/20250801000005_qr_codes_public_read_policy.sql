-- Allow unauthenticated tourists to resolve QR codes via POST /api/qr/resolve.
-- The qr_codes table was created via the Dashboard with read policies only; if those
-- are authenticated-only, the public scanner cannot look up a code_value and always
-- fails with "not recognized". This adds an anon/authenticated SELECT policy
-- idempotently (skips if any SELECT policy already covers the role).

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'qr_codes'
      AND cmd = 'SELECT'
      AND ('anon'::name = ANY(roles) OR 'public'::name = ANY(roles))
  ) OR NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'qr_codes'
      AND cmd = 'SELECT'
      AND ('authenticated'::name = ANY(roles) OR 'public'::name = ANY(roles))
  ) THEN
    EXECUTE 'CREATE POLICY "Allow public read of QR codes" ON public.qr_codes FOR SELECT TO anon, authenticated USING (true)';
  END IF;
END
$$;
