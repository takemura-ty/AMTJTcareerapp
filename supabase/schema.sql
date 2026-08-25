create extension if not exists pgcrypto;

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  sub_company text,
  region text not null,
  city text,
  type text not null check (type in ('visit', 'interview')),
  date date not null,
  major text not null check (major in ('shinkyu', 'judo')),
  created_at timestamptz not null default now()
);

alter table public.reports add column if not exists city text;
alter table public.reports add column if not exists updated_at date not null default current_date;
alter table public.reports add column if not exists supervisor_impression text;
alter table public.reports add column if not exists staff_impression text;
alter table public.reports add column if not exists clinic_impression text;
alter table public.reports add column if not exists other_notes text;
alter table public.reports add column if not exists interview_wish text;
alter table public.reports add column if not exists advice text;
alter table public.reports add column if not exists interviewer_count text;
alter table public.reports add column if not exists interviewer text;
alter table public.reports add column if not exists exam_contents text;
alter table public.reports add column if not exists questions_asked text;
alter table public.reports add column if not exists written_practical_exam text;
alter table public.reports add column if not exists result text;
alter table public.reports add column if not exists result_notification text;

update public.reports
set
  interviewer = coalesce(interviewer, supervisor_impression),
  exam_contents = coalesce(exam_contents, clinic_impression),
  questions_asked = coalesce(questions_asked, staff_impression),
  result = coalesce(result, interview_wish)
where type = 'interview';

create unique index if not exists reports_visit_company_date_major_key
on public.reports (company, date, major)
where type = 'visit';

create table if not exists public.workshops (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date date not null,
  pdf_url text,
  created_at timestamptz not null default now()
);

alter table public.workshops add column if not exists file_name text;
alter table public.workshops add column if not exists updated_at timestamptz not null default now();

insert into storage.buckets (id, name, public)
values ('career-files', 'career-files', true)
on conflict (id) do update set public = true;

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

delete from public.workshops
where (title, date) in (
  ('最新治療事例', '2026-06-01'),
  ('治療技術セミナー', '2026-05-10'),
  ('就職対策講座', '2026-03-15')
);

insert into public.job_hunting_tips (key, title)
values
  ('preparation', '就職活動マニュアル～準備編～'),
  ('interview', '就職活動マニュアル～面接編～')
on conflict (key) do update set title = excluded.title;