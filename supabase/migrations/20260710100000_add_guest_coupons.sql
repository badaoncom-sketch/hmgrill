-- 비회원 감사쿠폰: 계산대에서 직원이 1회용 발급 QR을 띄우고,
-- 손님이 스캔해 가입 없이 소지자(bearer) 쿠폰을 받는다.
-- 쿠폰 엔진(번호 채번·사용 처리·만료 판정·이벤트)은 기존 member_coupons를 재사용한다.

-- 1) 발행 배포 방식에 guest 추가
alter table public.coupon_issues
  drop constraint if exists coupon_issues_distribution_check;
alter table public.coupon_issues
  add constraint coupon_issues_distribution_check
  check (distribution in ('open', 'direct', 'guest'));

-- 2) 비회원 쿠폰은 회원 연결 없이 존재한다
alter table public.member_coupons
  alter column member_id drop not null;

alter table public.member_coupons
  drop constraint if exists member_coupons_source_check;
alter table public.member_coupons
  add constraint member_coupons_source_check
  check (source in ('download', 'admin_grant', 'guest_claim'));

-- 비회원 쿠폰은 반드시 guest_claim 출처여야 한다
alter table public.member_coupons
  add constraint member_coupons_guest_requires_source_check
  check (member_id is not null or source = 'guest_claim');

-- 3) 알림 트리거: 비회원 쿠폰은 알림 대상이 없다
create or replace function public.notify_member_coupon_issued()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_name text;
begin
  if new.member_id is null then
    return new;
  end if;

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

create or replace function public.notify_member_coupon_used()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_name text;
begin
  if new.member_id is null then
    return new;
  end if;

  if new.status = 'used' and old.status is distinct from 'used' then
    select name into v_name
    from public.coupon_issues
    where id = new.issue_id;

    insert into public.member_notifications (member_id, type, title, body, href, ref_id)
    values (
      new.member_id,
      'coupon_used',
      coalesce(v_name, '쿠폰') || ' 쿠폰이 사용 완료되었습니다.',
      '사용일시 ' || to_char(coalesce(new.used_at, now()) at time zone 'Asia/Seoul', 'YYYY-MM-DD HH24:MI'),
      '/coupons/history',
      new.id
    )
    on conflict (member_id, type, ref_id) where ref_id is not null do nothing;
  end if;

  return new;
end;
$$;

-- 4) 1회용 발급 토큰: 계산대 화면 QR에 인코딩된다 (5분 유효, 1회 사용)
create table if not exists public.guest_claim_tokens (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.coupon_issues(id),
  token text not null unique,
  created_by uuid references public.profiles(id),
  expires_at timestamptz not null,
  claimed_at timestamptz,
  claimed_coupon_id uuid references public.member_coupons(id),
  created_at timestamptz not null default now()
);

create index if not exists guest_claim_tokens_issue_idx on public.guest_claim_tokens(issue_id);

alter table public.guest_claim_tokens enable row level security;
revoke all on public.guest_claim_tokens from anon, authenticated;
grant all on public.guest_claim_tokens to service_role;

-- 5) 발급 QR 생성 RPC (직원·관리자)
create or replace function public.create_guest_claim_token(
  p_staff_id uuid,
  p_issue_id uuid,
  p_token text
)
returns timestamptz
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_staff public.profiles%rowtype;
  v_issue public.coupon_issues%rowtype;
  v_expires timestamptz := now() + interval '5 minutes';
begin
  select * into v_staff from public.profiles where id = p_staff_id;
  if v_staff.id is null or v_staff.email_verified is not true
    or v_staff.role not in ('staff'::public.user_role, 'admin'::public.user_role) then
    raise exception '직원 또는 관리자 권한이 필요합니다.';
  end if;

  if nullif(trim(p_token), '') is null then
    raise exception '발급 코드 생성에 실패했습니다.';
  end if;

  select * into v_issue from public.coupon_issues where id = p_issue_id;
  if v_issue.id is null or v_issue.distribution <> 'guest' then
    raise exception '비회원 감사쿠폰 캠페인이 아닙니다.';
  end if;

  if v_issue.status <> 'issuing'::public.coupon_issue_status then
    raise exception '발행중인 캠페인만 발급할 수 있습니다.';
  end if;

  if v_issue.downloaded_count >= v_issue.quantity then
    raise exception '남은 수량이 없습니다.';
  end if;

  insert into public.guest_claim_tokens (issue_id, token, created_by, expires_at)
  values (p_issue_id, trim(p_token), p_staff_id, v_expires);

  return v_expires;
end;
$$;

-- 6) 손님 수령 RPC (익명 — 서버 액션이 service_role로 호출)
create or replace function public.claim_guest_coupon(
  p_claim_token text,
  p_coupon_token text
)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_claim public.guest_claim_tokens%rowtype;
  v_issue public.coupon_issues%rowtype;
  v_coupon_id uuid;
begin
  if nullif(trim(p_coupon_token), '') is null then
    raise exception 'QR 쿠폰 토큰 생성에 실패했습니다.';
  end if;

  select * into v_claim
  from public.guest_claim_tokens
  where token = trim(p_claim_token)
  for update;

  if v_claim.id is null then
    raise exception '유효하지 않은 발급 코드입니다.';
  end if;

  if v_claim.claimed_at is not null then
    raise exception '이미 사용된 발급 코드입니다. 직원에게 새 QR을 요청해 주세요.';
  end if;

  if v_claim.expires_at < now() then
    raise exception '발급 QR이 만료되었습니다. 직원에게 새 QR을 요청해 주세요.';
  end if;

  select * into v_issue
  from public.coupon_issues
  where id = v_claim.issue_id
  for update;

  if v_issue.status <> 'issuing'::public.coupon_issue_status
    or v_issue.downloaded_count >= v_issue.quantity then
    raise exception '쿠폰 수량이 모두 소진되었습니다.';
  end if;

  insert into public.member_coupons (
    issue_id, member_id, token, downloaded_at, valid_from, valid_until,
    status, source, granted_by
  )
  values (
    v_issue.id, null, trim(p_coupon_token), now(), now(),
    now() + make_interval(days => v_issue.validity_days),
    'available', 'guest_claim', v_claim.created_by
  )
  returning id into v_coupon_id;

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

  update public.guest_claim_tokens
  set claimed_at = now(),
      claimed_coupon_id = v_coupon_id
  where id = v_claim.id;

  insert into public.coupon_events (issue_id, member_coupon_id, actor_id, event_type, metadata)
  values (
    v_issue.id, v_coupon_id, v_claim.created_by, 'guest_coupon_claimed',
    jsonb_build_object('amount', v_issue.amount)
  );

  return trim(p_coupon_token);
end;
$$;

revoke all on function public.create_guest_claim_token(uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.claim_guest_coupon(text, text) from public, anon, authenticated;
grant execute on function public.create_guest_claim_token(uuid, uuid, text) to service_role;
grant execute on function public.claim_guest_coupon(text, text) to service_role;
