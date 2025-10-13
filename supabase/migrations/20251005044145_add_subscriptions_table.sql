create table if not exists public.subscriptions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null, 
  price_id text not null,
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_subscriptions_user on public.subscriptions(user_id);

alter table public.subscriptions enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where polname = 'read own subscription') then
    create policy "read own subscription"
      on public.subscriptions for select
      using (user_id = auth.uid());
  end if;
end$$;
