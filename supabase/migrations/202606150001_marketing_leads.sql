-- Marketing leads captured from visualsquare.com contact forms.

do $$
begin
  if to_regtype('public.marketing_lead_status') is null then
    create type public.marketing_lead_status as enum (
      'new',
      'contacted',
      'quoted',
      'won',
      'lost',
      'spam'
    );
  end if;
end $$;

create table if not exists public.marketing_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status public.marketing_lead_status not null default 'new',
  name text not null,
  email text,
  phone text,
  company_name text,
  service text not null,
  message text not null,
  language text,
  landing_path text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  gclid text,
  gbraid text,
  wbraid text,
  fbclid text,
  lead_event_id text,
  converted_client_id uuid references public.clients(id) on delete set null,
  converted_job_id uuid references public.jobs(id) on delete set null,
  lost_reason text,
  memo text
);

create unique index if not exists marketing_leads_lead_event_id_uidx
on public.marketing_leads(lead_event_id)
where lead_event_id is not null;

create index if not exists marketing_leads_created_at_idx
on public.marketing_leads(created_at desc);

create index if not exists marketing_leads_status_idx
on public.marketing_leads(status);

create index if not exists marketing_leads_source_idx
on public.marketing_leads(utm_source);

create index if not exists marketing_leads_converted_client_id_idx
on public.marketing_leads(converted_client_id);

alter table public.marketing_leads enable row level security;

drop policy if exists "authenticated staff full access" on public.marketing_leads;
create policy "authenticated staff full access"
on public.marketing_leads
for all
to authenticated
using (true)
with check (true);

grant select, insert, update, delete on public.marketing_leads to authenticated;

notify pgrst, 'reload schema';
