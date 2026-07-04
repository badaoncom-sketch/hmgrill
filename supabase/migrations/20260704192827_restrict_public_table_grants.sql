revoke all privileges on table public.profiles from anon, authenticated;
revoke all privileges on table public.coupon_issues from anon, authenticated;
revoke all privileges on table public.member_coupons from anon, authenticated;
revoke all privileges on table public.coupon_events from anon, authenticated;

revoke all privileges on table public.profiles from service_role;
revoke all privileges on table public.coupon_issues from service_role;
revoke all privileges on table public.member_coupons from service_role;
revoke all privileges on table public.coupon_events from service_role;

grant usage on schema public to anon, authenticated, service_role;

grant select on table public.coupon_issues to anon, authenticated;
grant select on table public.profiles to authenticated;
grant select on table public.member_coupons to authenticated;
grant select on table public.coupon_events to authenticated;

grant all privileges on table public.profiles to service_role;
grant all privileges on table public.coupon_issues to service_role;
grant all privileges on table public.member_coupons to service_role;
grant all privileges on table public.coupon_events to service_role;
