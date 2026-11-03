-- 收集箱 v2.0：時間表
-- Supabase → SQL Editor 貼上全部內容，按 Run 一次即可，不影響現有資料。

create table if not exists public.schedule (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  item_id    uuid not null unique references public.items(id) on delete cascade,  -- 刪除項目時自動移走
  day        date not null,
  orig_day   date,                 -- 由哪一日延後過嚟（用嚟顯示「昨日未完成」）
  pos        double precision not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists schedule_user_day_idx on public.schedule (user_id, day);

alter table public.schedule enable row level security;
drop policy if exists "own schedule" on public.schedule;
create policy "own schedule" on public.schedule for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

do $$ begin
  alter publication supabase_realtime add table public.schedule;
exception when duplicate_object then null; end $$;
