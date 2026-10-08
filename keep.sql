-- 收集箱 v1.7：每個項目可以設為「收藏」
-- Supabase → SQL Editor 貼上執行一次即可，不影響現有資料。
alter table public.items add column if not exists keep boolean;
