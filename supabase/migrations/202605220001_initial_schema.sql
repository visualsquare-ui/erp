-- Visual Square ERP initial schema.
-- Run this in Supabase SQL Editor after creating the project.

create extension if not exists pgcrypto;

do $$
begin
  if to_regtype('public.project_type') is null then
    create type public.project_type as enum ('web', 'app', 'print', 'logo', 'branding');
  end if;

  if to_regtype('public.project_status') is null then
    create type public.project_status as enum ('quote', 'in_progress', 'done', 'on_hold', 'canceled');
  end if;

  if to_regtype('public.task_status') is null then
    create type public.task_status as enum ('todo', 'doing', 'review', 'done');
  end if;

  if to_regtype('public.asset_kind') is null then
    create type public.asset_kind as enum ('result_photo', 'final_file', 'drive_link');
  end if;

  if to_regtype('public.payment_terms') is null then
    create type public.payment_terms as enum ('net_30', 'net_15', 'due_on_receipt');
  end if;

  if to_regtype('public.invoice_status') is null then
    create type public.invoice_status as enum ('draft', 'sent', 'paid', 'overdue');
  end if;

  if to_regtype('public.purchase_order_status') is null then
    create type public.purchase_order_status as enum ('ordered', 'producing', 'received', 'canceled');
  end if;

  if to_regtype('public.vendor_bill_status') is null then
    create type public.vendor_bill_status as enum ('received', 'paid');
  end if;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company_name text,
  email text,
  phone text,
  address text,
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_person text,
  email text,
  phone text,
  specialty text,
  memo text,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete restrict,
  name text not null,
  type public.project_type not null,
  status public.project_status not null default 'quote',
  start_date date,
  due_date date,
  description text,
  quote_amount numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  assignee text,
  status public.task_status not null default 'todo',
  due_date date,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.work_orders (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  spec text,
  requirements text,
  included_revisions integer not null default 3 check (included_revisions >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.proof_versions (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references public.work_orders(id) on delete cascade,
  version integer not null check (version > 0),
  file_url text,
  client_approved boolean not null default false,
  approved_at timestamptz,
  is_extra_revision boolean not null default false,
  memo text,
  created_at timestamptz not null default now(),
  unique (work_order_id, version)
);

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  work_order_id uuid references public.work_orders(id) on delete set null,
  kind public.asset_kind not null,
  title text not null,
  storage_url text,
  external_url text,
  thumbnail_url text,
  is_portfolio boolean not null default false,
  memo text,
  created_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete restrict,
  client_id uuid not null references public.clients(id) on delete restrict,
  invoice_number text not null unique,
  issue_date date not null,
  terms public.payment_terms not null default 'net_30',
  due_date date not null,
  status public.invoice_status not null default 'draft',
  subtotal numeric(12, 2) not null default 0,
  tax numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  paid_amount numeric(12, 2) not null default 0,
  paid_date date,
  created_at timestamptz not null default now(),
  check (subtotal >= 0),
  check (tax >= 0),
  check (total >= 0),
  check (paid_amount >= 0)
);

create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
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

create table if not exists public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete restrict,
  vendor_id uuid not null references public.vendors(id) on delete restrict,
  po_number text not null unique,
  order_date date not null,
  expected_date date,
  spec text,
  amount numeric(12, 2) not null default 0,
  status public.purchase_order_status not null default 'ordered',
  created_at timestamptz not null default now(),
  check (amount >= 0)
);

create table if not exists public.vendor_bills (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete restrict,
  vendor_id uuid not null references public.vendors(id) on delete restrict,
  purchase_order_id uuid references public.purchase_orders(id) on delete set null,
  bill_number text,
  received_date date not null,
  due_date date,
  amount numeric(12, 2) not null default 0,
  status public.vendor_bill_status not null default 'received',
  paid_date date,
  file_url text,
  created_at timestamptz not null default now(),
  check (amount >= 0)
);

create index if not exists clients_company_name_idx on public.clients(company_name);
create index if not exists vendors_name_idx on public.vendors(name);
create index if not exists projects_client_id_idx on public.projects(client_id);
create index if not exists projects_status_idx on public.projects(status);
create index if not exists tasks_project_id_idx on public.tasks(project_id);
create index if not exists work_orders_project_id_idx on public.work_orders(project_id);
create index if not exists proof_versions_work_order_id_idx on public.proof_versions(work_order_id);
create index if not exists assets_project_id_idx on public.assets(project_id);
create index if not exists assets_is_portfolio_idx on public.assets(is_portfolio);
create index if not exists invoices_project_id_idx on public.invoices(project_id);
create index if not exists invoices_client_id_idx on public.invoices(client_id);
create index if not exists invoice_items_invoice_id_idx on public.invoice_items(invoice_id);
create index if not exists purchase_orders_project_id_idx on public.purchase_orders(project_id);
create index if not exists vendor_bills_project_id_idx on public.vendor_bills(project_id);

drop trigger if exists set_clients_updated_at on public.clients;
create trigger set_clients_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

alter table public.clients enable row level security;
alter table public.vendors enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.work_orders enable row level security;
alter table public.proof_versions enable row level security;
alter table public.assets enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.purchase_orders enable row level security;
alter table public.vendor_bills enable row level security;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'clients',
    'vendors',
    'projects',
    'tasks',
    'work_orders',
    'proof_versions',
    'assets',
    'invoices',
    'invoice_items',
    'purchase_orders',
    'vendor_bills'
  ]
  loop
    execute format('drop policy if exists "authenticated staff full access" on public.%I', table_name);
    execute format(
      'create policy "authenticated staff full access" on public.%I for all to authenticated using (true) with check (true)',
      table_name
    );
  end loop;
end $$;

grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;

