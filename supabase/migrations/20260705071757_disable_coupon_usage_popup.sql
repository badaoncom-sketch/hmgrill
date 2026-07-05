update public.site_popups
set is_active = false,
    updated_at = now()
where title = '쿠폰 사용 안내'
and body = '계산 전 직원에게 QR 쿠폰을 제시해 주세요.';
