create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete restrict,
  project_id uuid references public.projects(id) on delete set null,
  name text not null,
  type public.project_type not null default 'print',
  status public.project_status not null default 'quote',
  start_date date,
  due_date date,
  description text,
  quote_amount numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (quote_amount >= 0)
);

insert into public.jobs (
  client_id,
  project_id,
  name,
  type,
  status,
  start_date,
  due_date,
  description,
  quote_amount,
  created_at,
  updated_at
)
select
  projects.client_id,
  projects.id,
  projects.name,
  projects.type,
  projects.status,
  projects.start_date,
  projects.due_date,
  projects.description,
  projects.quote_amount,
  projects.created_at,
  projects.updated_at
from public.projects
where not exists (
  select 1
  from public.jobs
  where jobs.project_id = projects.id
);

create index if not exists jobs_client_id_idx on public.jobs(client_id);
create index if not exists jobs_project_id_idx on public.jobs(project_id);
create index if not exists jobs_status_idx on public.jobs(status);

drop trigger if exists set_jobs_updated_at on public.jobs;
create trigger set_jobs_updated_at
before update on public.jobs
for each row execute function public.set_updated_at();

alter table public.purchase_orders alter column project_id drop not null;
alter table public.vendor_bills alter column project_id drop not null;

alter table public.invoice_items
add column if not exists job_id uuid references public.jobs(id) on delete set null;

create index if not exists invoice_items_job_id_idx on public.invoice_items(job_id);

alter table public.jobs enable row level security;

drop policy if exists "authenticated staff full access" on public.jobs;
create policy "authenticated staff full access"
on public.jobs
for all
to authenticated
using (true)
with check (true);

grant select, insert, update, delete on public.jobs to authenticated;
