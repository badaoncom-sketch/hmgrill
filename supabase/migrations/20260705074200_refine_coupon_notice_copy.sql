do $$
begin
  if to_regclass('public.coupon_issues') is not null then
    update public.coupon_issues
    set
      condition_text = replace(condition_text, E'\n계산 전 직원에게 QR쿠폰을 제시해 주세요.', ''),
      qr_notice = replace(qr_notice, '계산 전에 직원에게 QR코드를 제시해 주세요.', '쿠폰 화면의 QR코드 확인 후 사용 처리됩니다.')
    where
      condition_text like '%계산 전 직원에게 QR쿠폰을 제시해 주세요.%'
      or qr_notice like '%계산 전에 직원에게 QR코드를 제시해 주세요.%';
  end if;

  if to_regclass('public.content_posts') is not null then
    update public.content_posts
    set body = '쿠폰 화면의 QR코드 확인 후 사용 처리됩니다.'
    where title = 'QR 쿠폰 사용 안내'
    and body = '쿠폰은 계산 전 직원에게 QR코드를 제시한 뒤 사용할 수 있습니다.';
  end if;

  if to_regclass('public.site_popups') is not null then
    update public.site_popups
    set
      title = '쿠폰 안내',
      body = '쿠폰 화면의 QR코드 확인 후 사용 처리됩니다.'
    where title = '쿠폰 사용 안내'
    and body = '계산 전 직원에게 QR 쿠폰을 제시해 주세요.';
  end if;
end $$;
