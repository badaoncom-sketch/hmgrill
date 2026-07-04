create or replace function public.stop_coupon_issue(
  p_admin_id uuid,
  p_issue_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_role public.user_role;
  v_issue public.coupon_issues%rowtype;
begin
  select role into v_role
  from public.profiles
  where id = p_admin_id;

  if v_role is distinct from 'admin'::public.user_role then
    raise exception '관리자 권한이 필요합니다.';
  end if;

  select * into v_issue
  from public.coupon_issues
  where id = p_issue_id
  for update;

  if v_issue.id is null then
    raise exception '쿠폰을 찾을 수 없습니다.';
  end if;

  if v_issue.status = 'ended'::public.coupon_issue_status then
    raise exception '이미 발행종료된 쿠폰입니다.';
  end if;

  update public.coupon_issues
  set status = 'ended',
      end_reason = 'admin_stopped',
      updated_at = now()
  where id = v_issue.id;

  insert into public.coupon_events (issue_id, actor_id, event_type, metadata)
  values (
    v_issue.id,
    p_admin_id,
    'issue_stopped',
    jsonb_build_object('downloaded_count', v_issue.downloaded_count)
  );

  return v_issue.id;
end;
$$;

create or replace function public.resume_coupon_issue(
  p_admin_id uuid,
  p_issue_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_role public.user_role;
  v_issue public.coupon_issues%rowtype;
begin
  select role into v_role
  from public.profiles
  where id = p_admin_id;

  if v_role is distinct from 'admin'::public.user_role then
    raise exception '관리자 권한이 필요합니다.';
  end if;

  select * into v_issue
  from public.coupon_issues
  where id = p_issue_id
  for update;

  if v_issue.id is null then
    raise exception '쿠폰을 찾을 수 없습니다.';
  end if;

  if v_issue.status <> 'ended'::public.coupon_issue_status
    or v_issue.end_reason <> 'admin_stopped'::public.coupon_end_reason then
    raise exception '관리자가 발행중단한 쿠폰만 재발행할 수 있습니다.';
  end if;

  if v_issue.downloaded_count >= v_issue.quantity then
    raise exception '발행수량이 모두 소진된 쿠폰은 재발행할 수 없습니다.';
  end if;

  update public.coupon_issues
  set status = 'issuing',
      end_reason = null,
      updated_at = now()
  where id = v_issue.id;

  insert into public.coupon_events (issue_id, actor_id, event_type, metadata)
  values (
    v_issue.id,
    p_admin_id,
    'issue_resumed',
    jsonb_build_object('remaining_count', v_issue.quantity - v_issue.downloaded_count)
  );

  return v_issue.id;
end;
$$;

revoke all on function public.stop_coupon_issue(uuid, uuid)
  from public, anon, authenticated;

revoke all on function public.resume_coupon_issue(uuid, uuid)
  from public, anon, authenticated;

grant execute on function public.stop_coupon_issue(uuid, uuid)
  to service_role;

grant execute on function public.resume_coupon_issue(uuid, uuid)
  to service_role;
