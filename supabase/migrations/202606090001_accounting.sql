-- Accounting: bank accounts and money in/out ledger.

create type public.account_transaction_type as enum (
  'client_payment',
  'other_income',
  'vendor_payment',
  'expense'
);

create table if not exists public.bank_accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  institution text,
  account_type text not null default 'checking',
  last4 text,
  starting_balance numeric(12, 2) not null default 0,
  opened_date date,
  is_active boolean not null default true,
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (account_type in ('checking', 'savings', 'credit_card', 'cash'))
);

create table if not exists public.account_transactions (
  id uuid primary key default gen_random_uuid(),
  bank_account_id uuid not null references public.bank_accounts(id) on delete restrict,
  txn_date date not null default current_date,
  type public.account_transaction_type not null,
  amount numeric(12, 2) not null,
  payee text,
  category text,
  payment_method text,
  description text,
  memo text,
  client_id uuid references public.clients(id) on delete set null,
  vendor_id uuid references public.vendors(id) on delete set null,
  invoice_id uuid references public.invoices(id) on delete set null,
  vendor_bill_id uuid references public.vendor_bills(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (amount > 0)
);

create index if not exists account_transactions_bank_account_id_idx
on public.account_transactions(bank_account_id);

create index if not exists account_transactions_txn_date_idx
on public.account_transactions(txn_date);

create index if not exists account_transactions_type_idx
on public.account_transactions(type);

create index if not exists account_transactions_client_id_idx
on public.account_transactions(client_id);

create index if not exists account_transactions_vendor_id_idx
on public.account_transactions(vendor_id);

create index if not exists account_transactions_invoice_id_idx
on public.account_transactions(invoice_id);

create index if not exists account_transactions_vendor_bill_id_idx
on public.account_transactions(vendor_bill_id);

drop trigger if exists set_bank_accounts_updated_at on public.bank_accounts;
create trigger set_bank_accounts_updated_at
before update on public.bank_accounts
for each row execute function public.set_updated_at();

drop trigger if exists set_account_transactions_updated_at on public.account_transactions;
create trigger set_account_transactions_updated_at
before update on public.account_transactions
for each row execute function public.set_updated_at();

alter table public.bank_accounts enable row level security;
alter table public.account_transactions enable row level security;

drop policy if exists "authenticated staff full access" on public.bank_accounts;
create policy "authenticated staff full access"
on public.bank_accounts
for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated staff full access" on public.account_transactions;
create policy "authenticated staff full access"
on public.account_transactions
for all
to authenticated
using (true)
with check (true);

grant select, insert, update, delete on public.bank_accounts to authenticated;
grant select, insert, update, delete on public.account_transactions to authenticated;

-- Seed: Bank of America checking opened 06/09/2026 with $1,000 opening deposit.
insert into public.bank_accounts (
  name,
  institution,
  account_type,
  starting_balance,
  opened_date,
  memo
)
select
  'Business Checking',
  'Bank of America',
  'checking',
  1000.00,
  '2026-06-09',
  'Opening deposit $1,000 on 06/09/2026'
where not exists (
  select 1
  from public.bank_accounts
  where institution = 'Bank of America'
);

notify pgrst, 'reload schema';
