-- Enable UUID + crypto for IDs if not already enabled
create extension if not exists "pgcrypto";

-- Unique order sequence
create sequence if not exists orders_seq;

-- Function to generate human-friendly order number: ORD-YYYYMM-XXXX
create or replace function public.generate_order_no()
returns text
language plpgsql
as $$
declare
  seq int := nextval('orders_seq');
  yymm text := to_char(now(), 'YYYYMM');
  code text := lpad((seq % 10000)::text, 4, '0');
begin
  return 'ORD-' || yymm || '-' || code;
end;
$$;

-- Orders table
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_no text unique not null default public.generate_order_no(),
  first_name text not null,
  last_name text not null,
  address text not null,
  phone text not null,
  instagram_url text,
  amount_purchase numeric(12,2),
  amount_sale numeric(12,2),
  amount_deposit numeric(12,2),
  created_at timestamptz not null default now(),
  user_id uuid not null default auth.uid()
);

-- RLS
alter table public.orders enable row level security;

-- Policies: each user manages only their rows
create policy "orders_select_own" on public.orders for select
  using ( user_id = auth.uid() );

create policy "orders_insert_own" on public.orders for insert
  with check ( user_id = auth.uid() );

create policy "orders_update_own" on public.orders for update
  using ( user_id = auth.uid() );

create policy "orders_delete_own" on public.orders for delete
  using ( user_id = auth.uid() );
