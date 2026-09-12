-- ============================================================================
-- RENEWAI / RENEWABLEIQ — Simple & Clean Supabase Schema
-- Designed for: db.glydzrwquhaomhonzrnu.supabase.co
--
-- Tables:
--   1. profiles             -> Operator profile (mirrors Supabase auth.users)
--   2. dispatch_actions     -> Log of peaker / BESS mitigation approvals
--   3. operator_preferences -> Saved state, city, and UI settings
-- ============================================================================

-- 1. Enable pgcrypto for UUID generation if not already active
create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- TABLE 1: profiles
-- Mirrors Supabase Auth users with operator station and role metadata
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  email        text not null unique,
  full_name    text,
  role         text default 'Grid Operator',
  station      text default 'Gujarat SLDC - Gotri, Vadodara',
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- TABLE 2: dispatch_actions
-- Real-time audit log of battery storage & grid peak-shaving dispatch commands
-- ----------------------------------------------------------------------------
create table if not exists public.dispatch_actions (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid references public.profiles(id) on delete set null,
  operator_name         text not null default 'Grid Operator',
  action_type           text not null, -- 'BESS_DISCHARGE', 'BESS_CHARGE', 'CURTAILMENT', 'PEAKER_START'
  magnitude_mw          numeric not null,
  target_facility       text not null,
  rationale             text,
  financial_savings_inr numeric default 0,
  co2_avoided_kg        numeric default 0,
  status                text default 'EXECUTED',
  created_at            timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- TABLE 3: operator_preferences
-- Remembers last-inspected State, City, Feeder, and theme preference
-- ----------------------------------------------------------------------------
create table if not exists public.operator_preferences (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.profiles(id) on delete cascade,
  default_state         text default 'gujarat',
  default_city          text default 'ahmedabad',
  default_area          text default 'sanand',
  theme                 text default 'light',
  notifications_enabled boolean default true,
  updated_at            timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Security: Enable Row-Level Security (RLS)
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.dispatch_actions enable row level security;
alter table public.operator_preferences enable row level security;

-- Profiles Policies
create policy "Allow read access to all registered operators"
  on public.profiles for select
  using (true);

create policy "Allow users to update their own profile"
  on public.profiles for update
  using (auth.uid() = auth_user_id or auth.uid() is null);

create policy "Allow insert for new profile registration"
  on public.profiles for insert
  with check (true);

-- Dispatch Actions Policies
create policy "Allow operators to view dispatch action history"
  on public.dispatch_actions for select
  using (true);

create policy "Allow operators to log dispatch actions"
  on public.dispatch_actions for insert
  with check (true);

-- Operator Preferences Policies
create policy "Allow operators to view and update preferences"
  on public.operator_preferences for all
  using (true);

-- ----------------------------------------------------------------------------
-- Trigger: Automatic Profile Sync from Supabase Auth
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (auth_user_id, email, full_name, role, station)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'Grid Operator'),
    coalesce(new.raw_user_meta_data->>'station', 'Gujarat SLDC')
  )
  on conflict (email) do update
  set auth_user_id = new.id,
      updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if it already exists to allow idempotent re-runs
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Seed Data: Initial demo operator profile for immediate testing
-- ----------------------------------------------------------------------------
insert into public.profiles (email, full_name, role, station)
values (
  'krish.patel@sldc.gujarat.gov.in',
  'Krish Patel',
  'Chief Grid Dispatcher',
  'Gujarat SLDC - Gotri, Vadodara'
)
on conflict (email) do nothing;
