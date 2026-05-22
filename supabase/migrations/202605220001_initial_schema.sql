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

insert into public.clients (id, name, company_name, email, phone, address, memo)
values
  ('00000000-0000-0000-0000-000000000101', 'Mina Park', 'Hudson Table Studio', 'mina@hudsontable.example', '(201) 555-0142', '12 River St, Hoboken, NJ 07030', 'Catering and private dining client.'),
  ('00000000-0000-0000-0000-000000000102', 'Daniel Kim', 'North Jersey Dental', 'daniel@njdental.example', '(973) 555-0188', '88 Broad Ave, Palisades Park, NJ 07650', 'Web landing page lead.'),
  ('00000000-0000-0000-0000-000000000103', 'Sarah Lee', 'Metro K-Food Market', 'sarah@metrokfood.example', '(212) 555-0175', '245 5th Ave, New York, NY 10016', 'Branding and print repeat client.')
on conflict (id) do nothing;

insert into public.vendors (id, name, contact_person, email, phone, specialty, memo)
values
  ('00000000-0000-0000-0000-000000000201', 'Garden State Print Co.', 'Chris Morgan', 'orders@gardenstateprint.example', '(201) 555-0160', 'Menus, brochures, folded flyers', 'Reliable short-run print vendor.'),
  ('00000000-0000-0000-0000-000000000202', 'Metro Large Format', 'Angela Rivera', 'production@metrolargeformat.example', '(718) 555-0194', 'Banners, window graphics, foam boards', 'Use for installed graphics.')
on conflict (id) do nothing;

insert into public.projects (id, client_id, name, type, status, start_date, due_date, description, quote_amount)
values
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000101', 'Spring Catering Menu Refresh', 'print', 'in_progress', '2026-05-04', '2026-06-03', 'Menu redesign, proof approval, print brokerage, delivery.', 4850.00),
  ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000102', 'Patient Booking Landing Page', 'web', 'quote', '2026-05-15', '2026-06-20', 'Landing page design and responsive handoff package.', 7200.00),
  ('00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000103', 'Market Rebrand Launch Kit', 'branding', 'in_progress', '2026-04-22', '2026-06-12', 'Logo refinement, signage direction, brand guide, launch assets.', 12800.00),
  ('00000000-0000-0000-0000-000000000304', '00000000-0000-0000-0000-000000000103', 'Weekend Sale Window Graphics', 'print', 'done', '2026-04-01', '2026-04-18', 'Large format window promotion graphics and vendor coordination.', 3100.00)
on conflict (id) do nothing;

insert into public.tasks (id, project_id, title, assignee, status, due_date, sort_order)
values
  ('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000301', 'Collect final menu copy', 'Jamie', 'review', '2026-05-24', 10),
  ('00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000301', 'Confirm paper stock with printer', 'Alex', 'doing', '2026-05-27', 20),
  ('00000000-0000-0000-0000-000000000403', '00000000-0000-0000-0000-000000000302', 'Draft landing page wireframe', 'Mina', 'todo', '2026-05-30', 10),
  ('00000000-0000-0000-0000-000000000404', '00000000-0000-0000-0000-000000000303', 'Prepare brand guide v2', 'Jamie', 'doing', '2026-06-02', 10)
on conflict (id) do nothing;

insert into public.work_orders (id, project_id, spec, requirements, included_revisions)
values
  ('00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000301', 'Tri-fold menu, 8.5x11, matte stock, 1,000 copies.', 'Keep pricing readable and prepare press-ready PDF.', 3),
  ('00000000-0000-0000-0000-000000000502', '00000000-0000-0000-0000-000000000303', 'Brand guide PDF and logo export package.', 'Include color, typography, lockups, signage examples.', 3)
on conflict (id) do nothing;

insert into public.proof_versions (id, work_order_id, version, file_url, client_approved, approved_at, is_extra_revision, memo)
values
  ('00000000-0000-0000-0000-000000000601', '00000000-0000-0000-0000-000000000501', 1, 'https://drive.google.com/example-proof-v1', false, null, false, 'Initial layout proof.'),
  ('00000000-0000-0000-0000-000000000602', '00000000-0000-0000-0000-000000000501', 2, 'https://drive.google.com/example-proof-v2', true, '2026-05-21 14:00:00+00', false, 'Approved with final copy.')
on conflict (id) do nothing;

insert into public.assets (id, project_id, work_order_id, kind, title, storage_url, external_url, thumbnail_url, is_portfolio, memo)
values
  ('00000000-0000-0000-0000-000000000701', '00000000-0000-0000-0000-000000000304', null, 'result_photo', 'Installed window graphics', null, 'https://drive.google.com/example-window-graphics', '/portfolio-window-graphics.svg', true, 'Finished installation photo.'),
  ('00000000-0000-0000-0000-000000000702', '00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000502', 'drive_link', 'Brand guide draft', null, 'https://drive.google.com/example-brand-guide', '/portfolio-brand-guide.svg', true, 'Large source package stored in Drive.')
on conflict (id) do nothing;

insert into public.invoices (id, project_id, client_id, invoice_number, issue_date, terms, due_date, status, subtotal, tax, total, paid_amount, paid_date)
values
  ('00000000-0000-0000-0000-000000000801', '00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000101', 'VS-2026-0001', '2026-05-10', 'net_30', '2026-06-09', 'sent', 4850.00, 198.75, 5048.75, 0.00, null),
  ('00000000-0000-0000-0000-000000000802', '00000000-0000-0000-0000-000000000304', '00000000-0000-0000-0000-000000000103', 'VS-2026-0002', '2026-04-18', 'net_15', '2026-05-03', 'paid', 3100.00, 205.38, 3305.38, 3305.38, '2026-04-28'),
  ('00000000-0000-0000-0000-000000000803', '00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000103', 'VS-2026-0003', '2026-05-01', 'net_30', '2026-05-31', 'sent', 6400.00, 0.00, 6400.00, 3200.00, null)
on conflict (id) do nothing;

insert into public.invoice_items (id, invoice_id, description, quantity, unit_price, amount, is_taxable, tax_rate)
values
  ('00000000-0000-0000-0000-000000000901', '00000000-0000-0000-0000-000000000801', 'Menu design service', 1, 1850.00, 1850.00, false, 0),
  ('00000000-0000-0000-0000-000000000902', '00000000-0000-0000-0000-000000000801', 'Printed menu production', 1, 3000.00, 3000.00, true, 0.06625),
  ('00000000-0000-0000-0000-000000000903', '00000000-0000-0000-0000-000000000802', 'Window graphics design and production', 1, 3100.00, 3100.00, true, 0.06625),
  ('00000000-0000-0000-0000-000000000904', '00000000-0000-0000-0000-000000000803', 'Brand identity deposit', 1, 6400.00, 6400.00, false, 0)
on conflict (id) do nothing;

insert into public.purchase_orders (id, project_id, vendor_id, po_number, order_date, expected_date, spec, amount, status)
values
  ('00000000-0000-0000-0000-000000001001', '00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000201', 'PO-2026-0001', '2026-05-18', '2026-05-31', 'Tri-fold menus, matte stock, 1,000 copies.', 1420.00, 'ordered'),
  ('00000000-0000-0000-0000-000000001002', '00000000-0000-0000-0000-000000000304', '00000000-0000-0000-0000-000000000202', 'PO-2026-0002', '2026-04-08', '2026-04-15', 'Window graphics print and install package.', 980.00, 'received')
on conflict (id) do nothing;

insert into public.vendor_bills (id, project_id, vendor_id, purchase_order_id, bill_number, received_date, due_date, amount, status, paid_date, file_url)
values
  ('00000000-0000-0000-0000-000000001101', '00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000001001', 'GSP-8831', '2026-05-20', '2026-06-05', 1420.00, 'received', null, null),
  ('00000000-0000-0000-0000-000000001102', '00000000-0000-0000-0000-000000000304', '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000001002', 'MLF-4402', '2026-04-16', '2026-04-25', 980.00, 'paid', '2026-04-23', null)
on conflict (id) do nothing;
