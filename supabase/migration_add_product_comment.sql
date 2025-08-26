-- Add product_name and comment columns if missing
alter table public.orders
  add column if not exists product_name text,
  add column if not exists comment text;

-- Optional: create a computed view for unpaid (reste) if you want to query server-side
-- create or replace view public.orders_with_unpaid as
-- select o.*, greatest(coalesce(o.amount_sale,0) - coalesce(o.amount_deposit,0), 0) as unpaid
-- from public.orders o;
