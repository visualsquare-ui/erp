alter table public.invoices
alter column project_id drop not null;

notify pgrst, 'reload schema';
