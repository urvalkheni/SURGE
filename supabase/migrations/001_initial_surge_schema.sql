-- ============================================================================
-- SURGE — Initial Schema, RBAC & RLS (001_initial_surge_schema.sql)
--
-- Frozen product decisions incorporated at migration time:
--   ROLE        -> ORG_ADMIN | GRID_OPERATOR | PLANT_OPERATOR | ENERGY_ANALYST
--   ORGANIZATION-> organizations + organization_members (schema-level tenant)
--   PLANT ACCESS-> plant_memberships (VIEW | OPERATE | MANAGE) scope for plant roles
--   PERMISSIONS -> ORG_ADMIN = org-wide manage; ENERGY_ANALYST = org-wide
--                  view-only (never operational); GRID_OPERATOR / PLANT_OPERATOR
--                  scoped by plant_memberships
--
-- A user may hold multiple roles per organization (unique on
-- (organization_id, user_id, role)). RLS resolves effective access through
-- helper functions in `public.security`.
-- ============================================================================

begin;

-- ============================================================================
-- 1. Extensions
-- ============================================================================

create extension if not exists pgcrypto;

-- ============================================================================
-- 2. Enumerated Types
-- ============================================================================

create type public.energy_type as enum ('SOLAR', 'WIND');

create type public.plant_status as enum ('DRAFT', 'ACTIVE', 'MAINTENANCE', 'OFFLINE');

create type public.user_role as enum (
  'ORG_ADMIN',
  'GRID_OPERATOR',
  'PLANT_OPERATOR',
  'ENERGY_ANALYST'
);

create type public.membership_access as enum ('VIEW', 'OPERATE', 'MANAGE');

create type public.confidence_tier as enum ('HIGH', 'MEDIUM', 'LOW');

create type public.severity_level as enum ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

create type public.forecast_status as enum ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

create type public.horizon_resolution as enum ('HOURLY', 'QUARTER_HOURLY');

create type public.risk_type as enum ('SURPLUS', 'DEFICIT', 'RAMP', 'UNCERTAINTY', 'DATA_QUALITY');

create type public.recommendation_action as enum (
  'MONITOR',
  'CHARGE',
  'DISCHARGE',
  'EXPORT',
  'CURTAIL',
  'PREPARE_BACKUP',
  'MAINTAIN_RESERVE'
);

create type public.recommendation_status as enum ('PENDING', 'ACKNOWLEDGED', 'SIMULATED', 'DISMISSED');

create type public.data_source_type as enum (
  'OPEN_METEO_WEATHER',
  'PLANT_TELEMETRY',
  'HISTORICAL_GENERATION',
  'SCADA',
  'MANUAL_INPUT'
);

create type public.data_validation_status as enum ('HEALTHY', 'WARNING', 'QUARANTINED');

create type public.anomaly_type as enum (
  'SCHEMA',
  'RANGE',
  'TIMESTAMP',
  'PHYSICAL',
  'STATISTICAL',
  'INTEGRITY'
);

create type public.anomaly_status as enum ('OPEN', 'INVESTIGATING', 'RESOLVED');

-- ============================================================================
-- 3. Core Identity & Tenant Tables
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 3.1 profiles — one row per auth.users.id (mirrors Supabase Auth users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  email        text not null,
  full_name    text,
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 3.2 organizations — tenant boundary for every typed row below
-- ---------------------------------------------------------------------------
create table public.organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 3.3 organization_members — user <-> org with (possibly multiple) role(s)
-- ---------------------------------------------------------------------------
create table public.organization_members (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations (id) on delete cascade,
  user_id          uuid not null references auth.users (id) on delete cascade,
  role             public.user_role not null,
  created_at       timestamptz not null default now(),
  unique (organization_id, user_id, role)
);

-- ---------------------------------------------------------------------------
-- 3.4 plants — generation assets owned by an organization
-- ---------------------------------------------------------------------------
create table public.plants (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations (id) on delete cascade,
  name             text not null,
  energy_type      public.energy_type not null,
  location_name    text,
  latitude         numeric(10, 6) not null,
  longitude        numeric(10, 6) not null,
  timezone         text,
  capacity_mw      numeric(10, 3) not null check (capacity_mw > 0),
  status           public.plant_status not null default 'ACTIVE',
  configuration    jsonb not null default '{}'::jsonb,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (organization_id, name)
);

-- ---------------------------------------------------------------------------
-- 3.5 plant_memberships — plant-level access scope for plant-centric roles
-- ---------------------------------------------------------------------------
create table public.plant_memberships (
  id            uuid primary key default gen_random_uuid(),
  plant_id      uuid not null references public.plants (id) on delete cascade,
  user_id       uuid not null references auth.users (id) on delete cascade,
  access_level  public.membership_access not null default 'VIEW',
  created_at    timestamptz not null default now(),
  unique (plant_id, user_id)
);

-- ============================================================================
-- 4. Forecast Domain
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 4.1 forecast_runs — a single model invocation for a plant/horizon
-- ---------------------------------------------------------------------------
create table public.forecast_runs (
  id               uuid primary key default gen_random_uuid(),
  plant_id         uuid not null references public.plants (id) on delete cascade,
  requested_by     uuid references auth.users (id) on delete set null,
  energy_type      public.energy_type not null,
  horizon_hours    integer not null check (horizon_hours in (24, 48, 72)),
  resolution       public.horizon_resolution not null default 'HOURLY',
  model_name       text not null default 'xgboost-surge-v1',
  status           public.forecast_status not null default 'PENDING',
  generated_at     timestamptz,
  created_at       timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 4.2 forecast_points — hourly probabilistic band (P10 | P50 | P90 proxy)
-- ---------------------------------------------------------------------------
create table public.forecast_points (
  id                      uuid primary key default gen_random_uuid(),
  forecast_run_id         uuid not null references public.forecast_runs (id) on delete cascade,
  timestamp               timestamptz not null,
  predicted_generation_mw numeric(10, 4) not null check (predicted_generation_mw >= 0),
  lower_bound_mw          numeric(10, 4) check (lower_bound_mw >= 0),
  upper_bound_mw          numeric(10, 4),
  confidence_score        numeric(5, 4) check (confidence_score between 0 and 1),
  risk_level              public.confidence_tier,
  is_ramp_alert           boolean not null default false,
  created_at              timestamptz not null default now(),
  check (lower_bound_mw <= predicted_generation_mw),
  check (upper_bound_mw >= predicted_generation_mw)
);

-- ---------------------------------------------------------------------------
-- 4.3 forecast_explanations — driver-level rationale for the forecast run
-- ---------------------------------------------------------------------------
create table public.forecast_explanations (
  id               uuid primary key default gen_random_uuid(),
  forecast_run_id  uuid not null references public.forecast_runs (id) on delete cascade,
  summary          text not null,
  drivers          jsonb not null default '[]'::jsonb,
  created_at       timestamptz not null default now()
);

-- ============================================================================
-- 5. Risk & Recommendation Domain
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 5.1 risks — operational risk windows detected on a forecast
-- ---------------------------------------------------------------------------
create table public.risks (
  id                  uuid primary key default gen_random_uuid(),
  forecast_run_id     uuid references public.forecast_runs (id) on delete set null,
  plant_id            uuid not null references public.plants (id) on delete cascade,
  risk_type           public.risk_type not null,
  severity            public.severity_level not null default 'MEDIUM',
  start_time          timestamptz not null,
  end_time            timestamptz,
  title               text not null,
  description         text,
  confidence_score    numeric(5, 4) check (confidence_score between 0 and 1),
  created_at          timestamptz not null default now(),
  check (end_time is null or end_time >= start_time)
);

-- ---------------------------------------------------------------------------
-- 5.2 recommendations — prescriptive, operator-decided (never auto-executed)
-- ---------------------------------------------------------------------------
create table public.recommendations (
  id                 uuid primary key default gen_random_uuid(),
  forecast_run_id    uuid references public.forecast_runs (id) on delete set null,
  plant_id           uuid not null references public.plants (id) on delete cascade,
  risk_id            uuid references public.risks (id) on delete set null,
  action_type        public.recommendation_action not null,
  title              text not null,
  reason             text,
  expected_impact_mw numeric(10, 3),
  confidence_score   numeric(5, 4) check (confidence_score between 0 and 1),
  status             public.recommendation_status not null default 'PENDING',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ============================================================================
-- 6. Data Trust Domain
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 6.1 data_sources — upstream feeds consumed by the pipeline
-- ---------------------------------------------------------------------------
create table public.data_sources (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name            text not null,
  source_type     public.data_source_type not null,
  status          public.data_validation_status not null default 'HEALTHY',
  last_checked_at timestamptz,
  metadata        jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 6.2 data_validation_runs — six-step pipeline checks per plant feed
-- ---------------------------------------------------------------------------
create table public.data_validation_runs (
  id                uuid primary key default gen_random_uuid(),
  data_source_id    uuid not null references public.data_sources (id) on delete cascade,
  plant_id          uuid not null references public.plants (id) on delete cascade,
  schema_valid      boolean not null default false,
  range_valid       boolean not null default false,
  timestamp_valid   boolean not null default false,
  physical_valid    boolean not null default false,
  anomaly_valid     boolean not null default false,
  integrity_valid   boolean not null default false,
  overall_status    public.data_validation_status not null default 'WARNING',
  checked_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 6.3 data_anomalies — discrete failures surfaced by validation
-- ---------------------------------------------------------------------------
create table public.data_anomalies (
  id               uuid primary key default gen_random_uuid(),
  data_source_id   uuid not null references public.data_sources (id) on delete cascade,
  plant_id         uuid not null references public.plants (id) on delete cascade,
  type             public.anomaly_type not null,
  severity         public.severity_level not null default 'MEDIUM',
  observed_value   jsonb,
  expected_value   jsonb,
  description      text,
  status           public.anomaly_status not null default 'OPEN',
  detected_at      timestamptz not null default now(),
  resolved_at      timestamptz
);

-- ============================================================================
-- 7. Audit
-- ============================================================================

create table public.audit_logs (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users (id) on delete set null,
  organization_id uuid references public.organizations (id) on delete set null,
  plant_id        uuid references public.plants (id) on delete set null,
  event_type      text not null,
  entity_type     text not null,
  entity_id       uuid,
  metadata        jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now()
);

-- ============================================================================
-- 8. updated_at Trigger
-- ============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger trg_organizations_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();

create trigger trg_plants_updated_at
  before update on public.plants
  for each row execute function public.set_updated_at();

create trigger trg_recommendations_updated_at
  before update on public.recommendations
  for each row execute function public.set_updated_at();

create trigger trg_data_sources_updated_at
  before update on public.data_sources
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 9. RLS Helper Functions (schema `public.security`)
--     All helpers are SECURITY DEFINER + search_path-locked so RLS policies
--     referencing them do not recurse into the tables being policed.
-- ============================================================================

create schema if not exists public.security;

-- 9.1 Org hie: every organization_id the current user belongs to.
create or replace function public.security.current_org_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id
  from public.organization_members
  where user_id = auth.uid();
$$;

-- 9.2 Is the current user a member (any role) of the given organization?
create or replace function public.security.is_org_member(target_organization uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members
    where user_id = auth.uid()
      and organization_id = target_organization
  );
$$;

-- 9.3 Does the current user hold the given role inside the organization?
create or replace function public.security.has_role(target_organization uuid, target_role public.user_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members
    where user_id = auth.uid()
      and organization_id = target_organization
      and role = target_role
  );
$$;

-- 9.4 Effective plant access:
--       ORG_ADMIN          -> MANAGE org-wide (full control)
--       ENERGY_ANALYST     -> VIEW org-wide (read-only; never operational)
--       GRID / PLANT OP    -> scoped by plant_memberships
--     Returns the strongest membership access level, or NULL when no access.
create or replace function public.security.plant_access(target_plant uuid)
returns public.membership_access
language sql
stable
security definer
set search_path = public
as $$
  select
    case
      when exists (
        select 1
        from public.organization_members om
        where om.organization_id = p.organization_id
          and om.user_id = auth.uid()
          and om.role = 'ORG_ADMIN'
      ) then 'MANAGE'::public.membership_access
      when exists (
        select 1
        from public.organization_members om
        where om.organization_id = p.organization_id
          and om.user_id = auth.uid()
          and om.role = 'ENERGY_ANALYST'
      ) then 'VIEW'::public.membership_access
      else coalesce(
        (select pm.access_level
         from public.plant_memberships pm
         where pm.plant_id = target_plant
           and pm.user_id = auth.uid()
         order by case pm.access_level
                    when 'MANAGE'::public.membership_access then 3
                    when 'OPERATE'::public.membership_access then 2
                    else 1
                  end desc
         limit 1),
        null::public.membership_access
      )
    end
  from public.plants p
  where p.id = target_plant;
$$;

-- 9.5 Boolean convenience wrapper used by most read policies.
create or replace function public.security.can_access_plant(target_plant uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.security.plant_access(target_plant) is not null;
$$;

-- 9.6 Can the current user DISMISS / ACKNOWLEDGE a recommendation for the plant?
--     Grants: ORG_ADMIN of the plant's org, or any user with an explicit
--     plant_membership. Purely org-wide readers (ENERGY_ANALYST) cannot
--     acknowledge recommendations.
create or replace function public.security.can_acknowledge_plant(target_plant uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.plants p
    where p.id = target_plant
      and (
        exists (select 1
                from public.organization_members om
                where om.organization_id = p.organization_id
                  and om.user_id = auth.uid()
                  and om.role = 'ORG_ADMIN')
        or exists (select 1
                   from public.plant_memberships pm
                   where pm.plant_id = target_plant
                     and pm.user_id = auth.uid())
      )
  );
$$;

-- ============================================================================
-- 10. Row Level Security
-- ============================================================================

alter table public.profiles              enable row level security;
alter table public.organizations         enable row level security;
alter table public.organization_members  enable row level security;
alter table public.plants                enable row level security;
alter table public.plant_memberships     enable row level security;
alter table public.forecast_runs         enable row level security;
alter table public.forecast_points       enable row level security;
alter table public.forecast_explanations enable row level security;
alter table public.risks                 enable row level security;
alter table public.recommendations       enable row level security;
alter table public.data_sources          enable row level security;
alter table public.data_validation_runs  enable row level security;
alter table public.data_anomalies        enable row level security;
alter table public.audit_logs            enable row level security;

-- ---------------------------------------------------------------------------
-- 10.1 profiles
--   SELECT: self or any member of an org the viewer belongs to (for
--           "requested by" / operator name resolution across an org).
--   INSERT: self on signup.
--   UPDATE/DELETE: self; org admins may update basic profile fields.
-- ---------------------------------------------------------------------------
create policy profiles_select on public.profiles
  for select
  using (id = auth.uid()
         or exists (select 1 from public.organization_members mine
                    where mine.user_id = auth.uid()
                      and exists (select 1 from public.organization_members theirs
                                  where theirs.user_id = profiles.id
                                    and theirs.organization_id = mine.organization_id)));

create policy profiles_insert on public.profiles
  for insert
  with check (id = auth.uid());

create policy profiles_update on public.profiles
  for update
  using (id = auth.uid() or exists (
            select 1 from public.organization_members om
            where om.user_id = auth.uid()
              and om.role = 'ORG_ADMIN'
              and exists (select 1 from public.organization_members theirs
                          where theirs.user_id = profiles.id
                            and theirs.organization_id = om.organization_id)))
  with check (true);

create policy profiles_delete on public.profiles
  for delete
  using (id = auth.uid());

-- ---------------------------------------------------------------------------
-- 10.2 organizations
--   SELECT: any member can read the org.
--   INSERT: any authenticated user may create an org (bootstrap).
--   UPDATE/DELETE: ORG_ADMIN of that org only.
-- ---------------------------------------------------------------------------
create policy organizations_select on public.organizations
  for select
  using (public.security.is_org_member(id));

create policy organizations_insert on public.organizations
  for insert
  with check (auth.uid() is not null);

create policy organizations_update on public.organizations
  for update
  using (public.security.has_role(id, 'ORG_ADMIN'))
  with check (public.security.has_role(id, 'ORG_ADMIN'));

create policy organizations_delete on public.organizations
  for delete
  using (public.security.has_role(id, 'ORG_ADMIN'));

-- ---------------------------------------------------------------------------
-- 10.3 organization_members
--   SELECT: self, or any member of the same org.
--   INSERT/UPDATE/DELETE: ORG_ADMIN of the org.
-- ---------------------------------------------------------------------------
create policy org_members_select on public.organization_members
  for select
  using (user_id = auth.uid()
         or public.security.is_org_member(organization_id));

create policy org_members_manage_org on public.organization_members
  for all
  using (public.security.has_role(organization_id, 'ORG_ADMIN'))
  with check (public.security.has_role(organization_id, 'ORG_ADMIN'));

-- ---------------------------------------------------------------------------
-- 10.4 plants
--   SELECT: org-wide for ORG_ADMIN / ENERGY_ANALYST; scoped by
--           plant_memberships for GRID_OPERATOR / PLANT_OPERATOR.
--   ALL (mutate): ORG_ADMIN manages everything; MANAGER/OPERATE entrants may
--           UPDATE the plant configuration given ACCESS >= OPERATE.
-- ---------------------------------------------------------------------------
create policy plants_select on public.plants
  for select
  using (public.security.can_access_plant(id));

create policy plants_insert on public.plants
  for insert
  with check (public.security.has_role(organization_id, 'ORG_ADMIN'));

create policy plants_update on public.plants
  for update
  using (public.security.has_role(organization_id, 'ORG_ADMIN')
         or public.security.plant_access(id) in ('OPERATE'::public.membership_access,
                                                 'MANAGE'::public.membership_access))
  with check (public.security.has_role(organization_id, 'ORG_ADMIN')
              or public.security.plant_access(id) in ('OPERATE'::public.membership_access,
                                                      'MANAGE'::public.membership_access));

create policy plants_delete on public.plants
  for delete
  using (public.security.has_role(organization_id, 'ORG_ADMIN'));

-- ---------------------------------------------------------------------------
-- 10.5 plant_memberships
--   SELECT: self, org-wide readers, or members of the same plant.
--   INSERT/UPDATE/DELETE: ORG_ADMIN or members with MANAGE access to the plant.
-- ---------------------------------------------------------------------------
create policy plant_memberships_select on public.plant_memberships
  for select
  using (user_id = auth.uid()
         or public.security.can_access_plant(plant_id));

create policy plant_memberships_admin_manage on public.plant_memberships
  for insert
  with check (exists (
    select 1 from public.plants p
    where p.id = plant_memberships.plant_id
      and (public.security.has_role(p.organization_id, 'ORG_ADMIN')
           or public.security.plant_access(p.id) = 'MANAGE'::public.membership_access)
  ));

create policy plant_memberships_admin_update on public.plant_memberships
  for update
  using (exists (
    select 1 from public.plants p
    where p.id = plant_memberships.plant_id
      and (public.security.has_role(p.organization_id, 'ORG_ADMIN')
           or public.security.plant_access(p.id) = 'MANAGE'::public.membership_access)
  ))
  with check (true);

create policy plant_memberships_admin_delete on public.plant_memberships
  for delete
  using (exists (
    select 1 from public.plants p
    where p.id = plant_memberships.plant_id
      and (public.security.has_role(p.organization_id, 'ORG_ADMIN')
           or public.security.plant_access(p.id) = 'MANAGE'::public.membership_access)
  ));

-- ---------------------------------------------------------------------------
-- 10.6 forecast_runs / forecast_points / forecast_explanations
--   All operational forecast data is read-only for operators and analysts;
--   creation is authorized via plant access (drive-through the plant policy).
--   Mutation/delete is reserved to ORG_ADMIN for data governance.
-- ---------------------------------------------------------------------------
create policy forecast_runs_select on public.forecast_runs
  for select
  using (public.security.can_access_plant(plant_id));

create policy forecast_runs_insert on public.forecast_runs
  for insert
  with check (public.security.can_access_plant(plant_id));

create policy forecast_runs_admin_mutate on public.forecast_runs
  for update
  using (exists (select 1 from public.plants p
                 where p.id = forecast_runs.plant_id
                   and (public.security.has_role(p.organization_id, 'ORG_ADMIN')
                        or public.security.plant_access(p.id) = 'MANAGE'::public.membership_access)))
  with check (exists (select 1 from public.plants p
                      where p.id = forecast_runs.plant_id
                        and public.security.can_access_plant(p.id)));

create policy forecast_runs_admin_delete on public.forecast_runs
  for delete
  using (exists (select 1 from public.plants p
                 where p.id = forecast_runs.plant_id
                   and public.security.has_role(p.organization_id, 'ORG_ADMIN')));

create policy forecast_points_select on public.forecast_points
  for select
  using (exists (select 1 from public.forecast_runs fr
                 where fr.id = forecast_points.forecast_run_id
                   and public.security.can_access_plant(fr.plant_id)));

create policy forecast_points_insert on public.forecast_points
  for insert
  with check (exists (select 1 from public.forecast_runs fr
                      where fr.id = forecast_points.forecast_run_id
                        and public.security.can_access_plant(fr.plant_id)));

create policy forecast_points_admin_mutate on public.forecast_points
  for update
  using (exists (select 1 from public.forecast_runs fr join public.plants p on p.id = fr.plant_id
                 where fr.id = forecast_points.forecast_run_id
                   and public.security.has_role(p.organization_id, 'ORG_ADMIN')))
  with check (true);

create policy forecast_points_admin_delete on public.forecast_points
  for delete
  using (exists (select 1 from public.forecast_runs fr join public.plants p on p.id = fr.plant_id
                 where fr.id = forecast_points.forecast_run_id
                   and public.security.has_role(p.organization_id, 'ORG_ADMIN')));

create policy forecast_explanations_select on public.forecast_explanations
  for select
  using (exists (select 1 from public.forecast_runs fr
                 where fr.id = forecast_explanations.forecast_run_id
                   and public.security.can_access_plant(fr.plant_id)));

create policy forecast_explanations_insert on public.forecast_explanations
  for insert
  with check (exists (select 1 from public.forecast_runs fr
                      where fr.id = forecast_explanations.forecast_run_id
                        and public.security.can_access_plant(fr.plant_id)));

create policy forecast_explanations_admin_mutate on public.forecast_explanations
  for update
  using (exists (select 1 from public.forecast_runs fr join public.plants p on p.id = fr.plant_id
                 where fr.id = forecast_explanations.forecast_run_id
                   and public.security.has_role(p.organization_id, 'ORG_ADMIN')))
  with check (true);

create policy forecast_explanations_admin_delete on public.forecast_explanations
  for delete
  using (exists (select 1 from public.forecast_runs fr join public.plants p on p.id = fr.plant_id
                 where fr.id = forecast_explanations.forecast_run_id
                   and public.security.has_role(p.organization_id, 'ORG_ADMIN')));

-- ---------------------------------------------------------------------------
-- 10.7 risks
-- ---------------------------------------------------------------------------
create policy risks_select on public.risks
  for select
  using (public.security.can_access_plant(plant_id));

create policy risks_insert on public.risks
  for insert
  with check (public.security.can_access_plant(plant_id));

create policy risks_admin_mutate on public.risks
  for update
  using (exists (select 1 from public.plants p
                 where p.id = risks.plant_id
                   and (public.security.has_role(p.organization_id, 'ORG_ADMIN')
                        or public.security.plant_access(p.id) = 'MANAGE'::public.membership_access)))
  with check (public.security.can_access_plant(plant_id));

create policy risks_admin_delete on public.risks
  for delete
  using (exists (select 1 from public.plants p
                 where p.id = risks.plant_id
                   and public.security.has_role(p.organization_id, 'ORG_ADMIN')));

-- ---------------------------------------------------------------------------
-- 10.8 recommendations
--   SELECT: plant-access readers (analysts may read, flag: read-only).
--   UPDATE: plant-scoped roles can ACKNOWLEDGE / DISMISS / SIMULATE their
--           recommendations (state machine only — never an EXECUTE path).
--           ENERGY_ANALYST (org-wide reader, no membership) cannot.
--           Row identity (plant / run / risk) is immutable on status updates.
--   INSERT/DELETE: ORG_ADMIN (engine writes via service role; operators
--           cannot create arbitrary recommendations).
-- ---------------------------------------------------------------------------
create policy recommendations_select on public.recommendations
  for select
  using (public.security.can_access_plant(plant_id));

create policy recommendations_update_status on public.recommendations
  for update
  using (public.security.can_acknowledge_plant(plant_id))
  with check (
    public.security.can_acknowledge_plant(plant_id)
  );

-- Status transitions and immutable recommendation fields are enforced by this
-- trigger because RLS policy expressions cannot reference OLD/NEW records.
create or replace function public.enforce_recommendation_update()
returns trigger
language plpgsql
as $$
begin
  if new.plant_id is distinct from old.plant_id
     or new.forecast_run_id is distinct from old.forecast_run_id
     or new.risk_id is distinct from old.risk_id
     or new.action_type is distinct from old.action_type
     or new.title is distinct from old.title
     or new.reason is distinct from old.reason
     or new.expected_impact_mw is distinct from old.expected_impact_mw
     or new.confidence_score is distinct from old.confidence_score
     or new.created_at is distinct from old.created_at then
    raise exception 'recommendation identity and content are immutable';
  end if;

  if (new.status, old.status) not in
      (('ACKNOWLEDGED'::public.recommendation_status, 'PENDING'::public.recommendation_status),
       ('SIMULATED'::public.recommendation_status, 'PENDING'::public.recommendation_status),
       ('DISMISSED'::public.recommendation_status, 'PENDING'::public.recommendation_status),
       ('PENDING'::public.recommendation_status, 'ACKNOWLEDGED'::public.recommendation_status),
       ('PENDING'::public.recommendation_status, 'SIMULATED'::public.recommendation_status),
       ('PENDING'::public.recommendation_status, 'DISMISSED'::public.recommendation_status)) then
    raise exception 'invalid recommendation status transition';
  end if;
  return new;
end;
$$;

create trigger trg_recommendations_status_guard
  before update on public.recommendations
  for each row execute function public.enforce_recommendation_update();

create policy recommendations_admin_insert on public.recommendations
  for insert
  with check (exists (select 1 from public.plants p
                      where p.id = recommendations.plant_id
                        and public.security.has_role(p.organization_id, 'ORG_ADMIN')));

create policy recommendations_admin_delete on public.recommendations
  for delete
  using (exists (select 1 from public.plants p
                 where p.id = recommendations.plant_id
                   and public.security.has_role(p.organization_id, 'ORG_ADMIN')));

-- ---------------------------------------------------------------------------
-- 10.9 data_sources (org-scoped)
-- ---------------------------------------------------------------------------
create policy data_sources_select on public.data_sources
  for select
  using (public.security.is_org_member(organization_id));

create policy data_sources_admin_manage on public.data_sources
  for all
  using (public.security.has_role(organization_id, 'ORG_ADMIN'))
  with check (public.security.has_role(organization_id, 'ORG_ADMIN'));

-- ---------------------------------------------------------------------------
-- 10.10 data_validation_runs
-- ---------------------------------------------------------------------------
create policy validation_runs_select on public.data_validation_runs
  for select
  using (public.security.can_access_plant(plant_id));

create policy validation_runs_insert on public.data_validation_runs
  for insert
  with check (public.security.can_access_plant(plant_id));

create policy validation_runs_admin_manage on public.data_validation_runs
  for update
  using (exists (select 1 from public.plants p
                 where p.id = data_validation_runs.plant_id
                   and public.security.has_role(p.organization_id, 'ORG_ADMIN')))
  with check (true);

create policy validation_runs_admin_delete on public.data_validation_runs
  for delete
  using (exists (select 1 from public.plants p
                 where p.id = data_validation_runs.plant_id
                   and public.security.has_role(p.organization_id, 'ORG_ADMIN')));

-- ---------------------------------------------------------------------------
-- 10.11 data_anomalies
-- ---------------------------------------------------------------------------
create policy anomalies_select on public.data_anomalies
  for select
  using (public.security.can_access_plant(plant_id));

create policy anomalies_insert on public.data_anomalies
  for insert
  with check (public.security.can_access_plant(plant_id));

create policy anomalies_admin_manage on public.data_anomalies
  for update
  using (exists (select 1 from public.plants p
                 where p.id = data_anomalies.plant_id
                   and public.security.has_role(p.organization_id, 'ORG_ADMIN')))
  with check (true);

create policy anomalies_admin_delete on public.data_anomalies
  for delete
  using (exists (select 1 from public.plants p
                 where p.id = data_anomalies.plant_id
                   and public.security.has_role(p.organization_id, 'ORG_ADMIN')));

-- ---------------------------------------------------------------------------
-- 10.12 audit_logs — append-only bus
--   INSERT: any authenticated org member (log their own actions).
--   SELECT: org members (view audit trails for their org).
--   UPDATE/DELETE: ORG_ADMIN only (metadata corrections; chronological
--           deletion is reserved to platform ops).
-- ---------------------------------------------------------------------------
create policy audit_logs_insert on public.audit_logs
  for insert
  with check ((user_id = auth.uid() or user_id is null)
              and (organization_id is null
                   or public.security.is_org_member(organization_id)));

create policy audit_logs_select on public.audit_logs
  for select
  using (organization_id is null
         or public.security.is_org_member(organization_id));

create policy audit_logs_admin_manage on public.audit_logs
  for update
  using (public.security.has_role(organization_id, 'ORG_ADMIN'))
  with check (public.security.has_role(organization_id, 'ORG_ADMIN'));

create policy audit_logs_admin_delete on public.audit_logs
  for delete
  using (public.security.has_role(organization_id, 'ORG_ADMIN'));

-- ============================================================================
-- 11. Indexes
-- ============================================================================

create index idx_organizations_slug on public.organizations (slug);

create index idx_org_members_organization on public.organization_members (organization_id);
create index idx_org_members_user on public.organization_members (user_id);

create index idx_plants_organization on public.plants (organization_id);
create index idx_plants_energy_type on public.plants (energy_type);
create index idx_plants_name on public.plants (organization_id, name);

create index idx_plant_memberships_plant on public.plant_memberships (plant_id);
create index idx_plant_memberships_user on public.plant_memberships (user_id);

create index idx_forecast_runs_plant on public.forecast_runs (plant_id);
create index idx_forecast_runs_created on public.forecast_runs (created_at desc);
create index idx_forecast_points_run on public.forecast_points (forecast_run_id);
create index idx_forecast_points_run_time on public.forecast_points (forecast_run_id, timestamp);
create index idx_forecast_explanations_run on public.forecast_explanations (forecast_run_id);

create index idx_risks_plant on public.risks (plant_id);
create index idx_risks_plant_time on public.risks (plant_id, start_time, end_time);
create index idx_risks_type on public.risks (risk_type);

create index idx_recommendations_plant on public.recommendations (plant_id);
create index idx_recommendations_status on public.recommendations (status);
create index idx_recommendations_risk on public.recommendations (risk_id);

create index idx_data_sources_org on public.data_sources (organization_id);
create index idx_validation_runs_plant on public.data_validation_runs (plant_id);
create index idx_validation_runs_source on public.data_validation_runs (data_source_id);
create index idx_anomalies_plant on public.data_anomalies (plant_id);
create index idx_anomalies_status on public.data_anomalies (status);

create index idx_audit_logs_org on public.audit_logs (organization_id);
create index idx_audit_logs_created on public.audit_logs (created_at desc);

commit;
