create or replace function public.issue_coupon(
  p_admin_id uuid,
  p_name text,
  p_amount integer,
  p_quantity integer,
  p_validity_days integer,
  p_condition_text text,
  p_qr_notice text,
  p_redownload_policy public.coupon_redownload_policy,
  p_use_flow public.coupon_use_flow
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
  select role into v_role
  from public.profiles
  where id = p_admin_id;

  if v_role is distinct from 'admin'::public.user_role then
    raise exception '관리자 권한이 필요합니다.';
  end if;

  if nullif(trim(p_name), '') is null then
    raise exception '쿠폰명을 입력해 주세요.';
  end if;

  if p_amount < 0 or p_quantity <= 0 or p_validity_days <= 0 then
    raise exception '쿠폰 금액, 발행 수량, 사용 가능 기간을 확인해 주세요.';
  end if;

  insert into public.coupon_issues (
    name,
    amount,
    quantity,
    validity_days,
    condition_text,
    qr_notice,
    redownload_policy,
    use_flow,
    status,
    created_by
  )
  values (
    trim(p_name),
    p_amount,
    p_quantity,
    p_validity_days,
    nullif(trim(coalesce(p_condition_text, '')), ''),
    trim(p_qr_notice),
    p_redownload_policy,
    p_use_flow,
    'issuing',
    p_admin_id
  )
  returning id into v_issue_id;

  insert into public.coupon_events (issue_id, actor_id, event_type, metadata)
  values (
    v_issue_id,
    p_admin_id,
    'issue_created',
    jsonb_build_object(
      'quantity', p_quantity,
      'amount', p_amount,
      'validity_days', p_validity_days
    )
  );

  return v_issue_id;
end;
$$;

create or replace function public.download_coupon(
  p_member_id uuid,
  p_issue_id uuid,
  p_token text
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_issue public.coupon_issues%rowtype;
  v_profile public.profiles%rowtype;
  v_existing_available_count integer;
  v_existing_total_count integer;
  v_existing_used_count integer;
  v_member_coupon_id uuid;
begin
  if nullif(trim(p_token), '') is null then
    raise exception 'QR 쿠폰 토큰 생성에 실패했습니다.';
  end if;

  select * into v_profile
  from public.profiles
  where id = p_member_id;

  if v_profile.id is null then
    raise exception '회원 정보를 찾을 수 없습니다.';
  end if;

  if v_profile.email_verified is not true then
    raise exception '이메일 인증 후 쿠폰을 다운로드할 수 있습니다.';
  end if;

  select * into v_issue
  from public.coupon_issues
  where id = p_issue_id
  for update;

  if v_issue.id is null then
    raise exception '쿠폰을 찾을 수 없습니다.';
  end if;

  if v_issue.status <> 'issuing'::public.coupon_issue_status then
    raise exception '발행중인 쿠폰만 다운로드할 수 있습니다.';
  end if;

  if v_issue.downloaded_count >= v_issue.quantity then
    update public.coupon_issues
    set status = 'ended',
        end_reason = 'quantity_sold_out',
        updated_at = now()
    where id = v_issue.id;

    raise exception '발행수량이 모두 소진되었습니다.';
  end if;

  select
    count(*) filter (where status = 'available'::public.member_coupon_status),
    count(*),
    count(*) filter (where status = 'used'::public.member_coupon_status)
  into
    v_existing_available_count,
    v_existing_total_count,
    v_existing_used_count
  from public.member_coupons
  where issue_id = v_issue.id
  and member_id = p_member_id;

  if v_existing_available_count > 0 then
    raise exception '동일한 발행중 쿠폰을 이미 보유하고 있습니다.';
  end if;

  if v_issue.redownload_policy = 'once_per_member'::public.coupon_redownload_policy
    and v_existing_total_count > 0 then
    raise exception '회원당 1회만 다운로드 가능한 쿠폰입니다.';
  end if;

  if v_issue.redownload_policy = 'after_use_allowed'::public.coupon_redownload_policy
    and v_existing_total_count > 0
    and v_existing_used_count = 0 then
    raise exception '기존 쿠폰이 사용 완료된 뒤 다시 다운로드할 수 있습니다.';
  end if;

  insert into public.member_coupons (
    issue_id,
    member_id,
    token,
    downloaded_at,
    valid_from,
    valid_until,
    status
  )
  values (
    v_issue.id,
    p_member_id,
    trim(p_token),
    now(),
    now(),
    now() + make_interval(days => v_issue.validity_days),
    'available'
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

  insert into public.coupon_events (
    issue_id,
    member_coupon_id,
    actor_id,
    event_type,
    metadata
  )
  values (
    v_issue.id,
    v_member_coupon_id,
    p_member_id,
    'coupon_downloaded',
    jsonb_build_object('validity_days', v_issue.validity_days)
  );

  return v_member_coupon_id;
end;
$$;

revoke all on function public.issue_coupon(
  uuid,
  text,
  integer,
  integer,
  integer,
  text,
  text,
  public.coupon_redownload_policy,
  public.coupon_use_flow
) from public, anon, authenticated;

revoke all on function public.download_coupon(uuid, uuid, text)
  from public, anon, authenticated;

grant execute on function public.issue_coupon(
  uuid,
  text,
  integer,
  integer,
  integer,
  text,
  text,
  public.coupon_redownload_policy,
  public.coupon_use_flow
) to service_role;

grant execute on function public.download_coupon(uuid, uuid, text)
  to service_role;
