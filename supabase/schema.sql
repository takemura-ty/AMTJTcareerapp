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

alter table public.reports enable row level security;
alter table public.workshops enable row level security;
alter table public.job_hunting_tips enable row level security;

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