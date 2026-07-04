create type public.content_post_type as enum ('event', 'notice');
create type public.content_status as enum ('draft', 'published', 'archived');
create type public.inquiry_status as enum ('open', 'answered', 'closed');

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  name text not null,
  description text not null default '',
  price integer not null default 0 check (price >= 0),
  featured boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint menu_items_category_check
    check (category in ('대표메뉴', '전체메뉴', '세트메뉴', '사이드', '음료'))
);

create table public.content_posts (
  id uuid primary key default gen_random_uuid(),
  type public.content_post_type not null,
  title text not null,
  body text not null default '',
  status public.content_status not null default 'draft',
  published_at timestamptz,
  starts_at timestamptz,
  ends_at timestamptz,
  sort_order integer not null default 0,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  status public.inquiry_status not null default 'open',
  admin_note text,
  answered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.site_banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  image_url text,
  href text,
  placement text not null default 'home',
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  sort_order integer not null default 0,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.site_popups (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  href text,
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  sort_order integer not null default 0,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index menu_items_active_sort_idx
  on public.menu_items(is_active, sort_order, created_at desc);

create index content_posts_type_status_sort_idx
  on public.content_posts(type, status, sort_order, published_at desc);

create index inquiries_status_created_at_idx
  on public.inquiries(status, created_at desc);

create index site_banners_active_sort_idx
  on public.site_banners(is_active, sort_order, created_at desc);

create index site_popups_active_sort_idx
  on public.site_popups(is_active, sort_order, created_at desc);

grant select on public.menu_items to anon, authenticated;
grant select on public.content_posts to anon, authenticated;
grant select on public.site_banners to anon, authenticated;
grant select on public.site_popups to anon, authenticated;

grant all on public.menu_items to service_role;
grant all on public.content_posts to service_role;
grant all on public.inquiries to service_role;
grant all on public.site_banners to service_role;
grant all on public.site_popups to service_role;

alter table public.menu_items enable row level security;
alter table public.content_posts enable row level security;
alter table public.inquiries enable row level security;
alter table public.site_banners enable row level security;
alter table public.site_popups enable row level security;

create policy "Public can read active menu items"
  on public.menu_items for select
  to anon, authenticated
  using (is_active = true);

create policy "Public can read published content posts"
  on public.content_posts for select
  to anon, authenticated
  using (
    status = 'published'
    and (published_at is null or published_at <= now())
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at >= now())
  );

create policy "Public can read active banners"
  on public.site_banners for select
  to anon, authenticated
  using (
    is_active = true
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at >= now())
  );

create policy "Public can read active popups"
  on public.site_popups for select
  to anon, authenticated
  using (
    is_active = true
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at >= now())
  );

insert into public.menu_items (
  category,
  name,
  description,
  price,
  featured,
  sort_order
)
values
  ('대표메뉴', '화목 시그니처 구이', '매장 대표 구이 메뉴입니다.', 39000, true, 10),
  ('세트메뉴', '가족 세트', '여러 명이 함께 주문하기 좋은 세트 구성입니다.', 89000, true, 20),
  ('사이드', '마무리 면', '식사 마무리를 위한 사이드 메뉴입니다.', 7000, false, 30),
  ('음료', '하우스 음료', '매장 식사와 어울리는 음료입니다.', 4000, false, 40);

insert into public.content_posts (
  type,
  title,
  body,
  status,
  published_at,
  sort_order
)
values
  ('event', '신규 회원 쿠폰 이벤트', '이메일 인증을 완료한 회원에게 다운로드 가능한 쿠폰을 제공합니다.', 'published', now(), 10),
  ('notice', 'QR 쿠폰 사용 안내', '쿠폰은 계산 전 직원에게 QR코드를 제시한 뒤 사용할 수 있습니다.', 'published', now(), 10),
  ('notice', '직원모드 운영 기준', 'POS 할인은 직원이 수동으로 적용하고, 직원모드에서 사용완료 처리합니다.', 'published', now(), 20);

insert into public.site_banners (
  title,
  body,
  placement,
  is_active,
  sort_order
)
values
  ('화목 QR 쿠폰 운영', '회원은 쿠폰을 다운로드하고 직원은 계산대에서 QR을 처리합니다.', 'home', true, 10);

insert into public.site_popups (
  title,
  body,
  is_active,
  sort_order
)
values
  ('쿠폰 사용 안내', '계산 전 직원에게 QR 쿠폰을 제시해 주세요.', true, 10);
