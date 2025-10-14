-- Supabase schema and seed setup for FIAP EdClub
-- Run this script in the Supabase SQL editor.

-- Extensions ---------------------------------------------------------------
create extension if not exists "pgcrypto";

-- Tables ------------------------------------------------------------------
create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  name text not null
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete set null,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists badges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rule text
);

create table if not exists user_badges (
  user_id uuid references auth.users(id) on delete cascade,
  badge_id uuid references badges(id) on delete cascade,
  awarded_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

create table if not exists attendances (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  status text not null check (status in ('present', 'absent', 'late')),
  created_at timestamptz not null default now()
);

-- Row Level Security ------------------------------------------------------
alter table posts enable row level security;
create policy if not exists "Posts are viewable by owners" on posts
  for select using (auth.uid() = user_id);
create policy if not exists "Posts are inserted by owners" on posts
  for insert with check (auth.uid() = user_id);

alter table user_badges enable row level security;
create policy if not exists "User badges visible to owner" on user_badges
  for select using (auth.uid() = user_id);
create policy if not exists "User badges inserted by owner" on user_badges
  for insert with check (auth.uid() = user_id);

alter table attendances enable row level security;
create policy if not exists "Attendance visible to owner" on attendances
  for select using (auth.uid() = user_id);
create policy if not exists "Attendance inserted by owner" on attendances
  for insert with check (auth.uid() = user_id);

alter table events enable row level security;
create policy if not exists "Events readable by anyone" on events
  for select using (true);
create policy if not exists "Events inserted by teachers" on events
  for insert with check (
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'teacher'
  );

-- Attendance engagement insights ------------------------------------------
create or replace view weekly_attendance_rank as
select
  a.user_id,
  count(*) filter (where a.status in ('present', 'attended'))::int as presents,
  count(*)::int as total,
  round(100.0 * count(*) filter (where a.status in ('present', 'attended')) / nullif(count(*), 0), 1) as percent
from attendances a
where a.created_at >= date_trunc('week', now())
  and a.created_at < date_trunc('week', now()) + interval '7 days'
group by a.user_id
order by percent desc, presents desc
limit 5;

create or replace function get_weekly_progress(uid uuid)
returns table(presents int, total int, percent numeric)
language sql
stable
as $$
  select
    count(*) filter (where status in ('present', 'attended'))::int as presents,
    count(*)::int as total,
    round(100.0 * count(*) filter (where status in ('present', 'attended')) / nullif(count(*), 0), 1) as percent
  from attendances
  where user_id = uid
    and created_at >= date_trunc('week', now())
    and created_at < date_trunc('week', now()) + interval '7 days';
$$;

grant select on weekly_attendance_rank to authenticated;
grant execute on function get_weekly_progress(uuid) to authenticated;

-- Seeds -------------------------------------------------------------------
-- Basic accounts
insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
values (
  '11111111-1111-1111-1111-111111111111',
  'teacher@example.com',
  crypt('Password123!', gen_salt('bf')),
  now(),
  jsonb_build_object('provider', 'email', 'providers', array['email'], 'role', 'teacher'),
  jsonb_build_object('role', 'teacher')
)
on conflict (id) do update
set
  email = excluded.email,
  encrypted_password = excluded.encrypted_password,
  email_confirmed_at = excluded.email_confirmed_at,
  raw_app_meta_data = excluded.raw_app_meta_data,
  raw_user_meta_data = excluded.raw_user_meta_data;

insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
values (
  '22222222-2222-2222-2222-222222222222',
  'student@example.com',
  crypt('Password123!', gen_salt('bf')),
  now(),
  jsonb_build_object('provider', 'email', 'providers', array['email'], 'role', 'student'),
  jsonb_build_object('role', 'student')
)
on conflict (id) do update
set
  email = excluded.email,
  encrypted_password = excluded.encrypted_password,
  email_confirmed_at = excluded.email_confirmed_at,
  raw_app_meta_data = excluded.raw_app_meta_data,
  raw_user_meta_data = excluded.raw_user_meta_data;

-- Team seed
insert into teams (id, name)
values (
  '33333333-3333-3333-3333-333333333333',
  'Team Alpha'
)
on conflict (id) do update set name = excluded.name;

-- Event seeds
insert into events (id, team_id, title, starts_at, ends_at)
values
  (
    '44444444-4444-4444-4444-444444444444',
    '33333333-3333-3333-3333-333333333333',
    'Kick-off Meeting',
    timestamptz '2024-09-01 14:00:00+00',
    timestamptz '2024-09-01 15:00:00+00'
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    '33333333-3333-3333-3333-333333333333',
    'Weekly Workshop',
    timestamptz '2024-09-08 14:00:00+00',
    timestamptz '2024-09-08 15:30:00+00'
  )
on conflict (id) do update set
  team_id = excluded.team_id,
  title = excluded.title,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at;

