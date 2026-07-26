create table public.leads (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 2 and 100),
  email text not null check (email ~ '^[^@[:space:]]+@[^@[:space:]]+\\.[^@[:space:]]+$'),
  budget_range text not null check (budget_range in ('Under ₹1,000', '₹1,000–₹5,000', '₹5,000–₹10,000', '₹10,000+')),
  message text not null check (char_length(message) between 10 and 2000),
  status text not null default 'New' check (status in ('New', 'Contacted', 'Closed')),
  created_at timestamptz not null default now()
);

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table public.leads enable row level security;
alter table public.admin_users enable row level security;

create policy "Anyone can submit a lead"
on public.leads for insert to anon, authenticated with check (status = 'New');

create policy "Admins can read leads"
on public.leads for select to authenticated
using (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

create policy "Admins can update leads"
on public.leads for update to authenticated
using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

create policy "Users can check their own admin access"
on public.admin_users for select to authenticated
using (user_id = (select auth.uid()));

grant usage, select on sequence public.leads_id_seq to anon, authenticated;
grant insert on public.leads to anon, authenticated;
grant select, update on public.leads to authenticated;
grant select on public.admin_users to authenticated;

-- After creating your admin user in Supabase Authentication, run this once:
-- insert into public.admin_users (user_id) values ('YOUR_AUTH_USER_UUID');
