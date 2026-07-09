-- 회원 계정 상태: active(정상) / suspended(이용 중지) / withdrawn(탈퇴)
-- 관리자가 회원 관리에서 변경하며, 정상이 아닌 계정은 로그인과 회원 기능이 차단된다.
alter table public.profiles
  add column if not exists status text not null default 'active'
    check (status in ('active', 'suspended', 'withdrawn'));

alter table public.profiles
  add column if not exists status_changed_at timestamptz;

-- 내부 사유 메모 (관리자 전용 참고)
alter table public.profiles
  add column if not exists status_note text;

create index if not exists profiles_status_idx on public.profiles(status);
