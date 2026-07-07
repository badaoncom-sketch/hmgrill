create table if not exists public.member_notifications (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('coupon_issued', 'coupon_used', 'coupon_expiring', 'notice', 'event')),
  title text not null,
  body text,
  href text,
  ref_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists member_notifications_dedupe_key
  on public.member_notifications(member_id, type, ref_id)
  where ref_id is not null;

create index if not exists member_notifications_member_created_idx
  on public.member_notifications(member_id, created_at desc);

create index if not exists member_notifications_member_unread_idx
  on public.member_notifications(member_id)
  where read_at is null;

alter table public.member_notifications enable row level security;

create policy "Members can read own notifications"
  on public.member_notifications for select
  to authenticated
  using ((select auth.uid()) = member_id);

create policy "Members can mark own notifications read"
  on public.member_notifications for update
  to authenticated
  using ((select auth.uid()) = member_id)
  with check ((select auth.uid()) = member_id);

revoke all privileges on table public.member_notifications from anon, authenticated;
grant select on public.member_notifications to authenticated;
grant update (read_at) on public.member_notifications to authenticated;
grant all privileges on table public.member_notifications to service_role;

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

drop trigger if exists member_coupons_notify_issued on public.member_coupons;
create trigger member_coupons_notify_issued
  after insert on public.member_coupons
  for each row
  execute function public.notify_member_coupon_issued();

drop trigger if exists member_coupons_notify_used on public.member_coupons;
create trigger member_coupons_notify_used
  after update of status on public.member_coupons
  for each row
  execute function public.notify_member_coupon_used();

create or replace function public.sync_member_notifications()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_member uuid := (select auth.uid());
begin
  if v_member is null then
    return;
  end if;

  -- 3일 이내 만료 예정인 사용 가능 쿠폰
  insert into public.member_notifications (member_id, type, title, body, href, ref_id)
  select
    mc.member_id,
    'coupon_expiring',
    coalesce(ci.name, '쿠폰') || ' 쿠폰이 곧 만료됩니다.',
    '유효기간이 ' || to_char(mc.valid_until at time zone 'Asia/Seoul', 'YYYY-MM-DD') || '까지입니다. 방문 시 잊지 말고 사용해 주세요.',
    '/coupons/my',
    mc.id
  from public.member_coupons mc
  left join public.coupon_issues ci on ci.id = mc.issue_id
  where mc.member_id = v_member
    and mc.status = 'available'
    and mc.valid_until >= now()
    and mc.valid_until <= now() + interval '3 days'
  on conflict (member_id, type, ref_id) where ref_id is not null do nothing;

  -- 최근 30일 내 발행된 공지/이벤트
  insert into public.member_notifications (member_id, type, title, href, ref_id, created_at)
  select
    v_member,
    cp.type,
    cp.title,
    case when cp.type = 'notice' then '/notices/' else '/events/' end || cp.id::text,
    cp.id,
    coalesce(cp.published_at, cp.created_at)
  from public.content_posts cp
  where cp.type in ('notice', 'event')
    and cp.status = 'published'
    and coalesce(cp.published_at, cp.created_at) >= now() - interval '30 days'
  on conflict (member_id, type, ref_id) where ref_id is not null do nothing;
end;
$$;

revoke all on function public.notify_member_coupon_issued() from public;
revoke all on function public.notify_member_coupon_used() from public;
revoke all on function public.sync_member_notifications() from public;
grant execute on function public.sync_member_notifications() to authenticated;
