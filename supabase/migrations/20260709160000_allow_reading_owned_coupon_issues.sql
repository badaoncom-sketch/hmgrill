-- 회원이 보유한 쿠폰의 발행 정보(쿠폰명·금액·사용조건)는 발행 상태와 무관하게
-- 읽을 수 있어야 한다. (즉석 지급 발행은 지급 즉시 수량 소진으로 ended가 되고,
-- 일반 발행도 매진되면 ended가 되어 기존 issuing-only 정책으로는 join이 비어
-- 회원 화면에 "₩0 / 쿠폰"으로 표시되는 문제가 있었다.)
drop policy if exists "Members can read issues of own coupons" on public.coupon_issues;
create policy "Members can read issues of own coupons"
  on public.coupon_issues for select
  to authenticated
  using (
    exists (
      select 1
      from public.member_coupons mc
      where mc.issue_id = coupon_issues.id
        and mc.member_id = (select auth.uid())
    )
  );
