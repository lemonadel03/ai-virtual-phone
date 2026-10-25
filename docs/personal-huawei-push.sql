-- Run this once in the same personal Supabase project used by ai-phone-push.
-- The native token stays server-side; only the Edge Functions' service role may read it.
create table if not exists public.push_huawei_devices (
  user_id text primary key,
  token text not null,
  updated_at timestamptz not null default now()
);

alter table public.push_huawei_devices enable row level security;
revoke all on table public.push_huawei_devices from public, anon, authenticated;
grant select, insert, update, delete on table public.push_huawei_devices to service_role;
