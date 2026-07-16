-- Allow authenticated users to insert their own login attempts
create policy "Users can insert their own login attempts"
  on login_attempts for insert
  to authenticated
  with check (user_id = auth.uid());

-- Allow authenticated users to view their own login attempts
create policy "Users can view their own login attempts"
  on login_attempts for select
  to authenticated
  using (user_id = auth.uid());
