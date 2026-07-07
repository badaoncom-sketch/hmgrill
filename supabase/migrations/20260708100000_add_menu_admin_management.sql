-- 관리자에서 메뉴 카테고리를 추가/수정/정렬/삭제할 수 있도록 테이블로 분리한다.
create table if not exists public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.menu_categories enable row level security;

create policy "Menu categories are publicly readable"
  on public.menu_categories for select
  to anon, authenticated
  using (true);

revoke all privileges on table public.menu_categories from anon, authenticated;
grant select on public.menu_categories to anon, authenticated;
grant all privileges on table public.menu_categories to service_role;

-- 기본 순서 시드 + 실제 사용 중인 카테고리 보존
insert into public.menu_categories (name, sort_order)
values
  ('대표메뉴', 0),
  ('세트메뉴', 1),
  ('사이드', 2),
  ('음료', 3),
  ('전체메뉴', 4)
on conflict (name) do nothing;

insert into public.menu_categories (name, sort_order)
select distinct mi.category, 99
from public.menu_items mi
on conflict (name) do nothing;

-- 페이지 상단 타이틀/소개 문구를 관리자에서 수정할 수 있게 저장한다.
create table if not exists public.site_copy (
  key text primary key,
  title text not null,
  body text,
  updated_at timestamptz not null default now()
);

alter table public.site_copy enable row level security;

create policy "Site copy is publicly readable"
  on public.site_copy for select
  to anon, authenticated
  using (true);

revoke all privileges on table public.site_copy from anon, authenticated;
grant select on public.site_copy to anon, authenticated;
grant all privileges on table public.site_copy to service_role;

insert into public.site_copy (key, title, body)
values (
  'menu',
  '화목의 메뉴',
  '장작불의 온기, 숙성 고기의 깊이, 구운 채소와 곁들임의 균형을 담았습니다.'
)
on conflict (key) do nothing;

-- 메뉴 이미지 업로드용 공개 버킷
insert into storage.buckets (id, name, public)
values ('menu-images', 'menu-images', true)
on conflict (id) do nothing;
