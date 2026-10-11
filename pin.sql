-- 收集箱 v1.8：置頂
-- Supabase → SQL Editor 貼上執行一次即可，不影響現有資料。
alter table public.items add column if not exists pinned_at timestamptz;
