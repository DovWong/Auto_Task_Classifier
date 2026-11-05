-- 收集箱 v2.1：情境（地點、開始日期、自訂情境）
-- Supabase → SQL Editor 貼上執行一次即可，不影響現有資料。
alter table public.items add column if not exists place      text;  -- 'work' / 'home'
alter table public.items add column if not exists start_date date;  -- 開始日期
alter table public.items add column if not exists ctx        text;  -- 情境 id
