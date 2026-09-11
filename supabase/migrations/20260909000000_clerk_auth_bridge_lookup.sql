-- Looks up an existing auth.users id by email, for the Clerk-OAuth-to-Supabase-session
-- bridge (app/auth/clerk-bridge/route.ts). Used to confirm a Supabase Auth account already
-- exists before minting a magic-link session, so an unprovisioned Google identity is
-- rejected instead of silently creating an orphaned auth.users row.
create or replace function public.get_auth_user_id_by_email(lookup_email text)
returns uuid
language sql
security definer
set search_path = auth
as $$
  select id from auth.users where email = lookup_email limit 1;
$$;

revoke all on function public.get_auth_user_id_by_email(text) from public, anon, authenticated;
grant execute on function public.get_auth_user_id_by_email(text) to service_role;
