alter table public.invoice_items
add column if not exists purchase_order_id uuid references public.purchase_orders(id) on delete set null;

create index if not exists invoice_items_purchase_order_id_idx
on public.invoice_items(purchase_order_id);

notify pgrst, 'reload schema';
