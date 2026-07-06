create or replace function public.generate_profile_member_uid()
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_candidate text;
begin
  loop
    v_candidate := lpad((floor(random() * 90000000) + 10000000)::bigint::text, 8, '0');

    exit when not exists (
      select 1
      from public.profiles
      where member_uid = v_candidate
    );
  end loop;

  return v_candidate;
end;
$$;

create or replace function public.generate_coupon_number()
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_candidate text;
begin
  loop
    v_candidate := lpad((floor(random() * 90000000) + 10000000)::bigint::text, 8, '0');

    exit when not exists (
      select 1
      from public.member_coupons
      where coupon_number = v_candidate
    );
  end loop;

  return v_candidate;
end;
$$;

alter table public.profiles
  add column if not exists member_uid text;

update public.profiles
set member_uid = public.generate_profile_member_uid()
where member_uid is null;

alter table public.profiles
  alter column member_uid set default public.generate_profile_member_uid(),
  alter column member_uid set not null;

alter table public.profiles
  add constraint profiles_member_uid_format_check
  check (member_uid ~ '^[0-9]{8}$');

create unique index if not exists profiles_member_uid_key
  on public.profiles(member_uid);

alter table public.member_coupons
  add column if not exists coupon_number text;

update public.member_coupons
set coupon_number = public.generate_coupon_number()
where coupon_number is null;

alter table public.member_coupons
  alter column coupon_number set default public.generate_coupon_number(),
  alter column coupon_number set not null;

alter table public.member_coupons
  add constraint member_coupons_coupon_number_format_check
  check (coupon_number ~ '^[0-9]{8}$');

create unique index if not exists member_coupons_coupon_number_key
  on public.member_coupons(coupon_number);

revoke all on function public.generate_profile_member_uid() from public;
revoke all on function public.generate_coupon_number() from public;
grant execute on function public.generate_profile_member_uid() to service_role;
grant execute on function public.generate_coupon_number() to service_role;
