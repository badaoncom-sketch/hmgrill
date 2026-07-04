create or replace function public.use_coupon(
  p_staff_id uuid,
  p_token text
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_staff public.profiles%rowtype;
  v_coupon public.member_coupons%rowtype;
  v_issue public.coupon_issues%rowtype;
begin
  if nullif(trim(p_token), '') is null then
    raise exception 'QR 쿠폰 토큰을 입력해 주세요.';
  end if;

  select * into v_staff
  from public.profiles
  where id = p_staff_id;

  if v_staff.id is null then
    raise exception '직원 정보를 찾을 수 없습니다.';
  end if;

  if v_staff.email_verified is not true then
    raise exception '이메일 인증 후 직원모드를 사용할 수 있습니다.';
  end if;

  if v_staff.role not in ('staff'::public.user_role, 'admin'::public.user_role) then
    raise exception '직원 또는 관리자 권한이 필요합니다.';
  end if;

  select * into v_coupon
  from public.member_coupons
  where token = trim(p_token)
  for update;

  if v_coupon.id is null then
    raise exception '쿠폰을 찾을 수 없습니다.';
  end if;

  select * into v_issue
  from public.coupon_issues
  where id = v_coupon.issue_id
  for update;

  if v_coupon.status = 'used'::public.member_coupon_status then
    raise exception '이미 사용 완료된 쿠폰입니다.';
  end if;

  if v_coupon.status = 'expired'::public.member_coupon_status
    or v_coupon.valid_until < now() then
    if v_coupon.status <> 'expired'::public.member_coupon_status then
      update public.member_coupons
      set status = 'expired',
          updated_at = now()
      where id = v_coupon.id;

      update public.coupon_issues
      set expired_count = expired_count + 1,
          updated_at = now()
      where id = v_coupon.issue_id;

      insert into public.coupon_events (
        issue_id,
        member_coupon_id,
        actor_id,
        event_type,
        metadata
      )
      values (
        v_coupon.issue_id,
        v_coupon.id,
        p_staff_id,
        'coupon_expired',
        jsonb_build_object('valid_until', v_coupon.valid_until)
      );
    end if;

    raise exception '사용기간이 만료된 쿠폰입니다.';
  end if;

  update public.member_coupons
  set status = 'used',
      used_at = now(),
      used_by_staff_id = p_staff_id,
      updated_at = now()
  where id = v_coupon.id;

  update public.coupon_issues
  set used_count = used_count + 1,
      updated_at = now()
  where id = v_coupon.issue_id;

  insert into public.coupon_events (
    issue_id,
    member_coupon_id,
    actor_id,
    event_type,
    metadata
  )
  values (
    v_coupon.issue_id,
    v_coupon.id,
    p_staff_id,
    'coupon_used',
    jsonb_build_object('use_flow', v_issue.use_flow)
  );

  return v_coupon.id;
end;
$$;

revoke all on function public.use_coupon(uuid, text)
  from public, anon, authenticated;

grant execute on function public.use_coupon(uuid, text)
  to service_role;
