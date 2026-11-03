-- Estimates (quotes) sent to clients before a job is confirmed.
-- Mirrors invoices / invoice_items so the same line item and tax rules apply.

do $$
begin
  if to_regtype('public.estimate_status') is null then
    create type public.estimate_status as enum ('draft', 'sent', 'accepted', 'declined');
  end if;
end $$;

create table if not exists public.estimates (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete restrict,
  job_id uuid references public.jobs(id) on delete set null,
  estimate_number text not null unique,
  issue_date date not null,
  valid_until date,
  status public.estimate_status not null default 'draft',
  subtotal numeric(12, 2) not null default 0,
  tax numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  notes text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (subtotal >= 0),
  check (tax >= 0),
  check (total >= 0)
);

create table if not exists public.estimate_items (
  id uuid primary key default gen_random_uuid(),
  estimate_id uuid not null references public.estimates(id) on delete cascade,
  position integer not null default 0,
  description text not null,
  quantity numeric(12, 2) not null default 1,
  unit_price numeric(12, 2) not null default 0,
  amount numeric(12, 2) not null default 0,
  is_taxable boolean not null default false,
  tax_rate numeric(7, 5) not null default 0,
  check (quantity > 0),
  check (unit_price >= 0),
  check (amount >= 0),
  check (tax_rate >= 0)
);

create index if not exists estimates_client_id_idx on public.estimates(client_id);
create index if not exists estimates_job_id_idx on public.estimates(job_id);
create index if not exists estimates_status_idx on public.estimates(status);
create index if not exists estimate_items_estimate_id_idx on public.estimate_items(estimate_id);

drop trigger if exists set_estimates_updated_at on public.estimates;
create trigger set_estimates_updated_at
before update on public.estimates
for each row execute function public.set_updated_at();

alter table public.estimates enable row level security;
alter table public.estimate_items enable row level security;

drop policy if exists "authenticated staff full access" on public.estimates;
create policy "authenticated staff full access"
on public.estimates
for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated staff full access" on public.estimate_items;
create policy "authenticated staff full access"
on public.estimate_items
for all
to authenticated
using (true)
with check (true);

grant select, insert, update, delete on public.estimates to authenticated;
grant select, insert, update, delete on public.estimate_items to authenticated;

notify pgrst, 'reload schema';
