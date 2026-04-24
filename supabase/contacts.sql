create table if not exists public.contacts (
  id bigserial primary key,
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contacts enable row level security;

create policy "Allow service role to manage contacts"
on public.contacts
for all
to service_role
using (true)
with check (true);
