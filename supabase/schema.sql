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

insert into public.reports (
  id,
  company,
  sub_company,
  region,
  city,
  type,
  date,
  major,
  updated_at,
  supervisor_impression,
  staff_impression,
  clinic_impression,
  other_notes,
  interview_wish,
  advice
)
values
  ('11111111-1111-1111-1111-111111111111', '田中治療院', '田中グループ', '東京', '新宿区', 'visit', '2026-04-10', 'shinkyu', '2026-04-20', '院長先生が穏やかで、質問にも具体的に答えてくださいました。', 'スタッフ同士の声掛けが多く、連携が取りやすい雰囲気でした。', '受付から施術室まで整理されていて、患者様への配慮が感じられました。', '見学中に物療機器の説明もしていただき、実際の運用を理解しやすかったです。', '面接を希望します。', '気になったことはその場で質問すると、働くイメージが持ちやすいです。'),
  ('22222222-2222-2222-2222-222222222222', '鈴木整骨院', null, '大阪', '大阪市', 'interview', '2026-03-28', 'judo', '2026-04-20', '面接担当の先生が丁寧で、評価ポイントを明確に伝えてくださいました。', '学生への接し方が柔らかく、落ち着いて面接を受けられました。', '活気がありつつも清潔感があり、来院数の多さに納得しました。', '実技確認では基本手技の説明力も見られました。', '面接希望あり。', '自己紹介と志望動機は短く整理しておくと答えやすいです。'),
  ('33333333-3333-3333-3333-333333333333', 'みらい治療院', 'みらいグループ', '東京', '立川市', 'visit', '2026-04-20', 'judo', '2026-04-20', '見学担当の先生が現場での役割を具体的に話してくださり理解しやすかったです。', '若手スタッフの方も積極的に話しかけてくださり、質問しやすかったです。', '院内が明るく、患者様との距離感も近い印象でした。', '受付業務から施術補助まで幅広い業務説明がありました。', '今のところ未定です。', '一日の流れを確認すると、自分が働く場面を想像しやすいです。'),
  ('44444444-4444-4444-4444-444444444444', 'さくら治療院', null, '北海道', '札幌市', 'interview', '2026-02-12', 'shinkyu', '2026-02-15', '面接の進行が丁寧で、こちらの話を最後まで聞いてくださいました。', 'スタッフの方が明るく、面接前後も緊張を和らげてくださいました。', '地域密着型で患者様との信頼関係が強いと感じました。', '面接後に施設見学もあり、設備面まで確認できました。', '面接済みです。', '見学時の印象と面接時の質問内容をセットで振り返ると比較しやすいです。'),
  ('55555555-5555-5555-5555-555555555555', '鈴木整骨院', null, '大阪', '大阪市', 'interview', '2026-04-18', 'shinkyu', '2026-04-20', '院長先生が教育体制を詳しく説明してくださり、入職後のイメージが湧きました。', 'スタッフ間の雰囲気が良く、新人の先生も意見を出しやすそうでした。', '駅から近く通勤しやすく、院内導線も分かりやすかったです。', '筆記よりも対話重視の面接でした。', '第一希望です。', '面接前に見学内容を振り返っておくと、志望理由につなげやすいです。'),
  ('66666666-6666-6666-6666-666666666666', '神戸中央治療院', null, '兵庫', '神戸市', 'visit', '2026-04-15', 'judo', '2026-04-20', '見学担当の方が現場で必要な姿勢を具体例つきで説明してくださいました。', 'スタッフの皆さんが患者様への声掛けを大切にしている印象でした。', 'リハビリスペースが広く、チームで患者様を診る体制が整っていました。', '自費メニューの説明もあり、運営面も参考になりました。', '希望します。', '神戸市内でも院ごとに特色が違うので、複数比較するとよいです。')
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