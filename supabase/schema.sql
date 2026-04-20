create extension if not exists pgcrypto;

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  sub_company text,
  region text not null,
  type text not null check (type in ('visit', 'interview')),
  date date not null,
  major text not null check (major in ('shinkyu', 'judo')),
  created_at timestamptz not null default now()
);

create table if not exists public.workshops (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date date not null,
  pdf_url text,
  created_at timestamptz not null default now()
);

alter table public.workshops add column if not exists file_name text;
alter table public.workshops add column if not exists updated_at timestamptz not null default now();

create table if not exists public.job_hunting_tips (
  key text primary key check (key in ('preparation', 'interview')),
  title text not null,
  blob_url text,
  file_name text,
  updated_at timestamptz not null default now()
);

create table if not exists public.staff_accounts (
  id uuid primary key default gen_random_uuid(),
  login_id text not null unique,
  password_hash text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.reports enable row level security;
alter table public.workshops enable row level security;
alter table public.job_hunting_tips enable row level security;
alter table public.staff_accounts enable row level security;

drop policy if exists "Public can read reports" on public.reports;
create policy "Public can read reports"
on public.reports for select
using (true);

drop policy if exists "Public can read workshops" on public.workshops;
create policy "Public can read workshops"
on public.workshops for select
using (true);

drop policy if exists "Public can read job hunting tips" on public.job_hunting_tips;
create policy "Public can read job hunting tips"
on public.job_hunting_tips for select
using (true);

drop policy if exists "Service role can manage staff accounts" on public.staff_accounts;
create policy "Service role can manage staff accounts"
on public.staff_accounts for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

insert into public.reports (id, company, sub_company, region, type, date, major)
values
  ('11111111-1111-1111-1111-111111111111', '田中治療院', '田中グループ', '東京', 'visit', '2026-04-10', 'shinkyu'),
  ('22222222-2222-2222-2222-222222222222', '鈴木整骨院', null, '大阪', 'interview', '2026-03-28', 'judo'),
  ('33333333-3333-3333-3333-333333333333', 'みらい治療院', 'みらいグループ', '東京', 'visit', '2026-04-20', 'judo'),
  ('44444444-4444-4444-4444-444444444444', 'さくら治療院', null, '北海道', 'interview', '2026-02-12', 'shinkyu')
on conflict (id) do nothing;

insert into public.workshops (id, title, date, pdf_url)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '治療技術セミナー', '2026-05-10', '/pdfs/seminar1.pdf'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '就職対策講座', '2026-03-15', '/pdfs/seminar2.pdf'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '最新治療事例', '2026-06-01', '/pdfs/seminar3.pdf')
on conflict (id) do nothing;

insert into public.job_hunting_tips (key, title)
values
  ('preparation', '就職活動マニュアル～準備編～'),
  ('interview', '就職活動マニュアル～面接編～')
on conflict (key) do update set title = excluded.title;

insert into public.staff_accounts (login_id, password_hash, is_active)
values
  ('toyoamtjt55', '77efd7a609b3e6a876a8cd0c6ca65e0f:cc6a60c45c302f1d8ec28c31739af1f72b9c2849177085fcb45e8bfb62bb7435a0270d8ff4a77b9be4c92b5714d05aef9af7fcf389c4049fa77d6662f0defb55', true)
on conflict (login_id) do update set
  password_hash = excluded.password_hash,
  is_active = excluded.is_active,
  updated_at = now();