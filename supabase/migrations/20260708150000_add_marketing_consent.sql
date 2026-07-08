-- 이벤트·프로모션 수신(이메일/문자/DM) 선택 동의 시각. null이면 미동의.
alter table public.profiles
  add column if not exists marketing_accepted_at timestamptz;
