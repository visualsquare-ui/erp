-- Store Stripe Checkout reconciliation fields for invoice payments.

alter table public.invoices
add column if not exists stripe_checkout_session_id text,
add column if not exists stripe_checkout_url text,
add column if not exists stripe_payment_intent_id text,
add column if not exists stripe_payment_status text;

create index if not exists invoices_stripe_checkout_session_id_idx
on public.invoices(stripe_checkout_session_id);

create index if not exists invoices_stripe_payment_intent_id_idx
on public.invoices(stripe_payment_intent_id);

notify pgrst, 'reload schema';
