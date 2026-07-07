-- 보관/삭제는 소프트 상태로 관리한다.
-- 행을 실제로 지우면 sync_member_notifications()가 공지/이벤트/만료 임박 알림을
-- 다시 만들어내므로, deleted_at 표시 후 조회에서 제외하는 방식을 사용한다.
alter table public.member_notifications
  add column if not exists archived_at timestamptz,
  add column if not exists deleted_at timestamptz;

grant update (archived_at, deleted_at) on public.member_notifications to authenticated;

create index if not exists member_notifications_member_active_idx
  on public.member_notifications(member_id, created_at desc)
  where deleted_at is null;
