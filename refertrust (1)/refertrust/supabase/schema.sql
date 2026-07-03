-- ============================================================================
-- ReferTrust — Supabase schema
-- Run this in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.
-- V1 tables are live and used by the UI.
-- V2 tables are CREATED (so APIs are ready) but nothing in the V1 UI reads them.
-- ============================================================================

-- Needed for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- V1 TABLES
-- ---------------------------------------------------------------------------

create table if not exists companies (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  domain     text not null unique,          -- e.g. "swiggy.com"
  logo_url   text,
  created_at timestamptz not null default now()
);

create table if not exists profiles (
  id                 uuid primary key references auth.users(id) on delete cascade,
  full_name          text,
  role               text not null default 'seeker' check (role in ('employee','seeker')),
  company_id         uuid references companies(id) on delete set null,
  skills             text[] not null default '{}',
  years_experience   int,
  location           text,
  expected_salary_lpa numeric,              -- Indian LPA format
  trust_score        int not null default 100 check (trust_score between 0 and 100),
  created_at         timestamptz not null default now()
);

create table if not exists referrals (
  id           uuid primary key default gen_random_uuid(),
  poster_id    uuid not null references profiles(id) on delete cascade,
  company_id   uuid not null references companies(id) on delete cascade,
  job_title    text not null,
  jd_url       text not null,
  slots        int not null default 1 check (slots >= 1),
  slots_filled int not null default 0,
  jd_verified  boolean not null default false,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);
create index if not exists referrals_active_idx on referrals(is_active, created_at desc);

create table if not exists applications (
  id          uuid primary key default gen_random_uuid(),
  referral_id uuid not null references referrals(id) on delete cascade,
  seeker_id   uuid not null references profiles(id) on delete cascade,
  status      text not null default 'requested'
              check (status in ('requested','matched','closed')),
  created_at  timestamptz not null default now(),
  unique (referral_id, seeker_id)           -- one request per referral per seeker
);

create table if not exists messages (
  id             uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications(id) on delete cascade,
  sender_id      uuid not null references profiles(id) on delete cascade,
  body           text not null,
  created_at     timestamptz not null default now()
);
create index if not exists messages_app_idx on messages(application_id, created_at);

create table if not exists reports (
  id          uuid primary key default gen_random_uuid(),
  referral_id uuid not null references referrals(id) on delete cascade,
  reporter_id uuid not null references profiles(id) on delete cascade,
  reason      text,
  created_at  timestamptz not null default now()
);

-- system_metrics: cheap counters for /admin/status if you want to snapshot usage.
create table if not exists system_metrics (
  id         uuid primary key default gen_random_uuid(),
  key        text not null,
  value      numeric not null,
  recorded_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- V2 TABLES  ▸ created now so APIs are ready. NO V1 UI reads these.
-- Flip SHOW_V2_FEATURES in src/lib/featureFlags.ts to surface them later.
-- ---------------------------------------------------------------------------

-- V2: Interview feedback per application round.
create table if not exists interview_feedback (
  id             uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications(id) on delete cascade,
  round          int not null default 1,
  feedback       text,
  rating         int check (rating between 1 and 5),
  tips           text,
  created_at     timestamptz not null default now()
);

-- V2: Internal referral bonus tracking for employees.
create table if not exists referral_tracking (
  id           uuid primary key default gen_random_uuid(),
  referral_id  uuid not null references referrals(id) on delete cascade,
  status       text not null default 'pending'
               check (status in ('pending','joined','bonus_due','paid')),
  bonus_amount numeric,
  paid_date    date
);

-- V2: Gamification badges.
create table if not exists user_badges (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references profiles(id) on delete cascade,
  badge_key text not null,
  earned_at timestamptz not null default now(),
  unique (user_id, badge_key)
);

-- ---------------------------------------------------------------------------
-- HELPER FUNCTIONS
-- ---------------------------------------------------------------------------

-- True if the current user is the seeker or the poster on an application.
create or replace function is_chat_participant(app_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from applications a
    join referrals r on r.id = a.referral_id
    where a.id = app_id
      and (a.seeker_id = auth.uid() or r.poster_id = auth.uid())
  );
$$;

-- DB size in MB for /admin/status.
create or replace function db_size_mb()
returns numeric
language sql
security definer
set search_path = public
as $$
  select round(pg_database_size(current_database()) / 1024.0 / 1024.0, 1);
$$;

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------

alter table companies          enable row level security;
alter table profiles           enable row level security;
alter table referrals          enable row level security;
alter table applications       enable row level security;
alter table messages           enable row level security;
alter table reports            enable row level security;
alter table interview_feedback enable row level security;
alter table referral_tracking  enable row level security;
alter table user_badges        enable row level security;

-- companies: anyone signed in can read; signed-in users can add (auto-create on login).
create policy "companies read"   on companies for select to authenticated using (true);
create policy "companies insert" on companies for insert to authenticated with check (true);

-- profiles: read all (names/trust shown in UI); write only your own row.
create policy "profiles read"   on profiles for select to authenticated using (true);
create policy "profiles insert" on profiles for insert to authenticated with check (id = auth.uid());
create policy "profiles update" on profiles for update to authenticated using (id = auth.uid());

-- referrals: read active ones; poster owns writes.
create policy "referrals read"   on referrals for select to authenticated using (true);
create policy "referrals insert" on referrals for insert to authenticated with check (poster_id = auth.uid());
create policy "referrals update" on referrals for update to authenticated using (poster_id = auth.uid());

-- applications: seeker or the referral's poster can see it; seeker creates it.
create policy "applications read" on applications for select to authenticated
  using (
    seeker_id = auth.uid()
    or exists (select 1 from referrals r where r.id = referral_id and r.poster_id = auth.uid())
  );
create policy "applications insert" on applications for insert to authenticated
  with check (seeker_id = auth.uid());
create policy "applications update" on applications for update to authenticated
  using (
    seeker_id = auth.uid()
    or exists (select 1 from referrals r where r.id = referral_id and r.poster_id = auth.uid())
  );

-- messages: only chat participants read/send.
create policy "messages read" on messages for select to authenticated
  using (is_chat_participant(application_id));
create policy "messages insert" on messages for insert to authenticated
  with check (sender_id = auth.uid() and is_chat_participant(application_id));

-- reports: signed-in users file reports; no public read (admin uses service role).
create policy "reports insert" on reports for insert to authenticated
  with check (reporter_id = auth.uid());

-- V2 tables: locked down (no policies = only service role can touch them for now).

-- ---------------------------------------------------------------------------
-- REALTIME (chat)
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table messages;
