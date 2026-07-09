-- 관리자 직접 지급 쿠폰: 배포 방식(open/direct), 수령 경로(download/admin_grant),
-- 지급·회수 RPC와 알림을 추가한다.

-- 1) 발행: 배포 방식 (open = 홈페이지 공개 다운로드, direct = 관리자 지급 전용)
alter table public.coupon_issues
  add column if not exists distribution text not null default 'open'
    check (distribution in ('open', 'direct'));

-- 2) 보유 쿠폰: 수령 경로·지급 정보·회수 시각
alter table public.member_coupons
  add column if not exists source text not null default 'download'
    check (source in ('download', 'admin_grant'));

alter table public.member_coupons
  add column if not exists granted_by uuid references public.profiles(id);

alter table public.member_coupons
  add column if not exists grant_note text;

alter table public.member_coupons
  add column if not exists revoked_at timestamptz;

-- 지급자·내부 메모는 회원에게 보이지 않도록 컬럼 단위로만 조회를 허용한다.
revoke select on public.member_coupons from authenticated;
grant select (
  id,
  issue_id,
  member_id,
  token,
  coupon_number,
  downloaded_at,
  valid_from,
  valid_until,
  status,
  used_at,
  used_by_staff_id,
  source,
  revoked_at,
  created_at,
  updated_at
) on public.member_coupons to authenticated;

-- 3) 알림 타입 확장 (지급 도착 / 회수)
alter table public.member_notifications
  drop constraint if exists member_notifications_type_check;
alter table public.member_notifications
  add constraint member_notifications_type_check
  check (type in (
    'coupon_issued',
    'coupon_used',
    'coupon_expiring',
    'coupon_granted',
    'coupon_revoked',
    'notice',
    'event'
  ));

-- 4) 발급 알림 트리거: 지급 쿠폰은 선물 도착 문구로 분기
create or replace function public.notify_member_coupon_issued()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_name text;
begin
  select name into v_name
  from public.coupon_issues
  where id = new.issue_id;

  if new.source = 'admin_grant' then
    insert into public.member_notifications (member_id, type, title, body, href, ref_id)
    values (
      new.member_id,
      'coupon_granted',
      coalesce(v_name, '쿠폰') || ' 쿠폰이 도착했어요.',
      '화목이 드리는 혜택입니다. ' || to_char(new.valid_until at time zone 'Asia/Seoul', 'YYYY-MM-DD')
        || '까지 다음 방문 시 사용해 주세요.',
      '/coupons/my',
      new.id
    )
    on conflict (member_id, type, ref_id) where ref_id is not null do nothing;
  else
    insert into public.member_notifications (member_id, type, title, body, href, ref_id)
    values (
      new.member_id,
      'coupon_issued',
      coalesce(v_name, '쿠폰') || ' 쿠폰이 발급되었습니다.',
      '유효기간 ' || to_char(new.valid_until at time zone 'Asia/Seoul', 'YYYY-MM-DD') || '까지 사용할 수 있습니다.',
      '/coupons/my',
      new.id
    )
    on conflict (member_id, type, ref_id) where ref_id is not null do nothing;
  end if;

  return new;
end;
$$;

-- 5) 지급 RPC: 사전 발행된 direct/open 쿠폰을 특정 회원에게 지급
create or replace function public.grant_coupon(
  p_admin_id uuid,
  p_member_id uuid,
  p_issue_id uuid,
  p_token text,
  p_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_role public.user_role;
  v_issue public.coupon_issues%rowtype;
  v_member public.profiles%rowtype;
  v_existing_available integer;
  v_member_coupon_id uuid;
begin
  select role into v_role from public.profiles where id = p_admin_id;
  if v_role is distinct from 'admin'::public.user_role then
    raise exception '관리자 권한이 필요합니다.';
  end if;

  if nullif(trim(p_token), '') is null then
    raise exception 'QR 쿠폰 토큰 생성에 실패했습니다.';
  end if;

  select * into v_member from public.profiles where id = p_member_id;
  if v_member.id is null then
    raise exception '회원 정보를 찾을 수 없습니다.';
  end if;

  select * into v_issue from public.coupon_issues where id = p_issue_id for update;
  if v_issue.id is null then
    raise exception '쿠폰 발행을 찾을 수 없습니다.';
  end if;

  if v_issue.status <> 'issuing'::public.coupon_issue_status then
    raise exception '발행중인 쿠폰만 지급할 수 있습니다.';
  end if;

  if v_issue.downloaded_count >= v_issue.quantity then
    raise exception '남은 수량이 없습니다.';
  end if;

  select count(*) into v_existing_available
  from public.member_coupons
  where issue_id = v_issue.id
    and member_id = p_member_id
    and status = 'available'::public.member_coupon_status;

  if v_existing_available > 0 then
    raise exception '해당 회원이 동일한 쿠폰을 이미 보유하고 있습니다.';
  end if;

  insert into public.member_coupons (
    issue_id, member_id, token, downloaded_at, valid_from, valid_until,
    status, source, granted_by, grant_note
  )
  values (
    v_issue.id, p_member_id, trim(p_token), now(), now(),
    now() + make_interval(days => v_issue.validity_days),
    'available', 'admin_grant', p_admin_id, nullif(trim(coalesce(p_note, '')), '')
  )
  returning id into v_member_coupon_id;

  update public.coupon_issues
  set downloaded_count = downloaded_count + 1,
      status = case
        when downloaded_count + 1 >= quantity then 'ended'::public.coupon_issue_status
        else status
      end,
      end_reason = case
        when downloaded_count + 1 >= quantity then 'quantity_sold_out'::public.coupon_end_reason
        else end_reason
      end,
      updated_at = now()
  where id = v_issue.id;

  insert into public.coupon_events (issue_id, member_coupon_id, actor_id, event_type, metadata)
  values (
    v_issue.id, v_member_coupon_id, p_admin_id, 'coupon_granted',
    jsonb_build_object('amount', v_issue.amount, 'note', nullif(trim(coalesce(p_note, '')), ''))
  );

  return v_member_coupon_id;
end;
$$;

-- 6) 즉석 지급 RPC: 금액·쿠폰명·유효기간·사용조건을 입력받아 1장짜리 지급 전용
--    발행을 자동 생성한 뒤 곧바로 지급한다.
create or replace function public.grant_adhoc_coupon(
  p_admin_id uuid,
  p_member_id uuid,
  p_name text,
  p_amount integer,
  p_validity_days integer,
  p_condition_text text,
  p_token text,
  p_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_role public.user_role;
  v_issue_id uuid;
begin
  select role into v_role from public.profiles where id = p_admin_id;
  if v_role is distinct from 'admin'::public.user_role then
    raise exception '관리자 권한이 필요합니다.';
  end if;

  if nullif(trim(p_name), '') is null then
    raise exception '쿠폰명을 입력해 주세요.';
  end if;

  if p_amount <= 0 or p_amount > 1000000 then
    raise exception '지급 금액은 1원 이상 100만원 이하로 입력해 주세요.';
  end if;

  if p_validity_days <= 0 or p_validity_days > 365 then
    raise exception '유효기간은 1일 이상 365일 이하로 입력해 주세요.';
  end if;

  insert into public.coupon_issues (
    name, amount, quantity, validity_days, condition_text, qr_notice,
    redownload_policy, use_flow, status, distribution, created_by
  )
  values (
    trim(p_name), p_amount, 1, p_validity_days,
    nullif(trim(coalesce(p_condition_text, '')), ''),
    '결제 전 직원에게 QR 코드를 보여주세요.',
    'once_per_member', 'staff_confirm', 'issuing', 'direct', p_admin_id
  )
  returning id into v_issue_id;

  insert into public.coupon_events (issue_id, actor_id, event_type, metadata)
  values (
    v_issue_id, p_admin_id, 'issue_created',
    jsonb_build_object('quantity', 1, 'amount', p_amount, 'validity_days', p_validity_days, 'adhoc', true)
  );

  return public.grant_coupon(p_admin_id, p_member_id, v_issue_id, p_token, p_note);
end;
$$;

-- 7) 지급 회수 RPC: 미사용 지급 쿠폰만 회수하고 재고를 복원한다.
create or replace function public.revoke_granted_coupon(
  p_admin_id uuid,
  p_member_coupon_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_role public.user_role;
  v_coupon public.member_coupons%rowtype;
  v_name text;
begin
  select role into v_role from public.profiles where id = p_admin_id;
  if v_role is distinct from 'admin'::public.user_role then
    raise exception '관리자 권한이 필요합니다.';
  end if;

  select * into v_coupon from public.member_coupons where id = p_member_coupon_id for update;
  if v_coupon.id is null then
    raise exception '쿠폰을 찾을 수 없습니다.';
  end if;

  if v_coupon.source <> 'admin_grant' then
    raise exception '관리자가 지급한 쿠폰만 회수할 수 있습니다.';
  end if;

  if v_coupon.status <> 'available'::public.member_coupon_status or v_coupon.revoked_at is not null then
    raise exception '미사용 상태의 쿠폰만 회수할 수 있습니다.';
  end if;

  update public.member_coupons
  set status = 'expired',
      revoked_at = now(),
      updated_at = now()
  where id = v_coupon.id;

  -- 재고 복원: 소진으로 마감됐던 발행이면 다시 지급 가능 상태로 되돌린다.
  update public.coupon_issues
  set downloaded_count = greatest(downloaded_count - 1, 0),
      status = case
        when status = 'ended'::public.coupon_issue_status
          and end_reason = 'quantity_sold_out'::public.coupon_end_reason
        then 'issuing'::public.coupon_issue_status
        else status
      end,
      end_reason = case
        when end_reason = 'quantity_sold_out'::public.coupon_end_reason then null
        else end_reason
      end,
      updated_at = now()
  where id = v_coupon.issue_id;

  select name into v_name from public.coupon_issues where id = v_coupon.issue_id;

  insert into public.coupon_events (issue_id, member_coupon_id, actor_id, event_type)
  values (v_coupon.issue_id, v_coupon.id, p_admin_id, 'coupon_revoked');

  insert into public.member_notifications (member_id, type, title, body, href)
  values (
    v_coupon.member_id,
    'coupon_revoked',
    coalesce(v_name, '쿠폰') || ' 쿠폰이 회수되었습니다.',
    '문의사항은 고객센터로 연락해 주세요.',
    '/support'
  );
end;
$$;

revoke all on function public.grant_coupon(uuid, uuid, uuid, text, text) from public, anon, authenticated;
revoke all on function public.grant_adhoc_coupon(uuid, uuid, text, integer, integer, text, text, text) from public, anon, authenticated;
revoke all on function public.revoke_granted_coupon(uuid, uuid) from public, anon, authenticated;
grant execute on function public.grant_coupon(uuid, uuid, uuid, text, text) to service_role;
grant execute on function public.grant_adhoc_coupon(uuid, uuid, text, integer, integer, text, text, text) to service_role;
grant execute on function public.revoke_granted_coupon(uuid, uuid) to service_role;
