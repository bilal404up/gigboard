-- Stop the public key from reading private columns.
--
-- Row-level security filters rows, not columns. The policy "Public profiles viewable" (USING TRUE) let anyone
-- holding the public key read every user's email and admin flag, and the seller policy exposed earnings,
-- balances and bank fields. This migration:
--   1. limits the base tables to the owner (and admins),
--   2. adds two views that expose only the public columns,
--   3. turns on row-level security for seller_level_history, which had none.
-- The app reads other people's profiles through the views.

create or replace function public.is_admin_user() returns boolean
language sql security definer stable set search_path = public as $$
  select coalesce((select is_admin from public.users where id = auth.uid()), false)
$$;
revoke all on function public.is_admin_user() from public;
grant execute on function public.is_admin_user() to anon, authenticated;

drop policy if exists "Public profiles viewable" on public.users;
drop policy if exists "Users read own row or admin" on public.users;
create policy "Users read own row or admin" on public.users for select
  using (auth.uid() = id or public.is_admin_user());

drop policy if exists "Seller profiles public" on public.seller_profiles;
drop policy if exists "Seller profiles read own row or admin" on public.seller_profiles;
create policy "Seller profiles read own row or admin" on public.seller_profiles for select
  using (user_id = auth.uid() or public.is_admin_user());

create or replace view public.public_profiles as
  select id, full_name, username, avatar_url, bio, country, timezone, languages, is_seller, is_email_verified, last_seen, created_at
  from public.users;

create or replace view public.public_seller_profiles as
  select user_id, tagline, description, skills, seller_level, response_time_hours, response_rate, on_time_delivery_rate,
         order_completion_rate, total_orders_completed, total_reviews_received, average_rating, portfolio_items, education,
         certifications, social_links, is_available, vacation_mode, vacation_message, joined_as_seller_at, created_at
  from public.seller_profiles;

grant select on public.public_profiles, public.public_seller_profiles to anon, authenticated;

alter table public.seller_level_history enable row level security;
drop policy if exists "Seller reads own level history" on public.seller_level_history;
create policy "Seller reads own level history" on public.seller_level_history for select
  using (seller_id = auth.uid() or public.is_admin_user());
