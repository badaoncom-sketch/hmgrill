-- 관리자 콘텐츠 변경을 접속 중인 화면에 실시간 반영하기 위해
-- 공개 콘텐츠 테이블을 realtime publication에 추가한다.
-- (postgres_changes는 RLS를 따르므로 비공개 행 변경은 익명 구독자에게 전달되지 않는다)
do $$
declare
  target_table text;
begin
  foreach target_table in array array[
    'site_settings',
    'site_copy',
    'menu_items',
    'menu_categories',
    'content_posts',
    'site_banners',
    'site_popups'
  ]
  loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', target_table);
    exception
      when duplicate_object then null;
    end;
  end loop;
end $$;
