-- Allow server-side website lead capture to write through the Supabase service role.

grant usage on schema public to service_role;
grant usage on type public.marketing_lead_status to authenticated, service_role;

grant select, insert, update, delete on public.marketing_leads to authenticated, service_role;

notify pgrst, 'reload schema';
