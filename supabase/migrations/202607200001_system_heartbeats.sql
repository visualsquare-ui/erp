-- Records a minimal database write from the external Vercel Cron scheduler.
-- The table is intentionally unavailable to browser clients.

create table if not exists public.system_heartbeats (
  id text primary key,
  checked_at timestamptz not null
);

alter table public.system_heartbeats enable row level security;

revoke all on table public.system_heartbeats from anon, authenticated;
grant select, insert, update on table public.system_heartbeats to service_role;

comment on table public.system_heartbeats is
  'Last successful external heartbeat for keeping the free Supabase project active.';
