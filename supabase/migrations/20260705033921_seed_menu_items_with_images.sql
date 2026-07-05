update public.menu_items
set
  category = '대표메뉴',
  name = '화목 시그니처 한판',
  description = '한입 크기 구이와 구운 채소를 함께 담은 화목 대표 철판 메뉴입니다.',
  price = 39000,
  image_url = '/images/menu/1783221304773.png',
  featured = true,
  is_active = true,
  sort_order = 10,
  updated_at = now()
where name = '화목 시그니처 구이';

update public.menu_items
set
  category = '세트메뉴',
  name = '숙성 큐브 스테이크 세트',
  description = '진한 육향의 큐브 스테이크와 버섯, 구운 채소를 한 번에 즐기는 세트입니다.',
  price = 59000,
  image_url = '/images/menu/1783221304868.png',
  featured = true,
  is_active = true,
  sort_order = 20,
  updated_at = now()
where name = '가족 세트';

update public.menu_items
set
  category = '사이드',
  name = '하우스 그린 샐러드',
  description = '신선한 잎채소와 토마토, 과일을 산뜻하게 곁들이는 샐러드입니다.',
  price = 9000,
  image_url = '/images/menu/1783221304957.png',
  featured = false,
  is_active = true,
  sort_order = 70,
  updated_at = now()
where name = '마무리 면';

update public.menu_items
set
  category = '세트메뉴',
  name = '화목 모둠 구이 플래터',
  description = '삼겹, 목살, 항정, 갈비리살을 한 판에 구성한 넉넉한 모둠 메뉴입니다.',
  price = 89000,
  image_url = '/images/menu/1783221305035.png',
  featured = true,
  is_active = true,
  sort_order = 30,
  updated_at = now()
where name = '하우스 음료';

insert into public.menu_items (
  category,
  name,
  description,
  price,
  image_url,
  featured,
  is_active,
  sort_order
)
select
  seed.category,
  seed.name,
  seed.description,
  seed.price,
  seed.image_url,
  seed.featured,
  true,
  seed.sort_order
from (
  values
    (
      '세트메뉴',
      '부위별 모둠 가이드',
      '삼겹, 목살, 항정, 갈비리살 구성을 한눈에 보기 좋게 담은 안내형 모둠 메뉴입니다.',
      89000,
      '/images/menu/1783221305136.png',
      false,
      40
    ),
    (
      '대표메뉴',
      '프리미엄 스테이크 구이',
      '두툼하게 구운 스테이크를 부드러운 굽기로 썰어 제공하는 고급 구이 메뉴입니다.',
      69000,
      '/images/menu/1783221305205.png',
      true,
      50
    ),
    (
      '전체메뉴',
      '매콤 양념 큐브구이',
      '달큰하고 매콤한 양념을 입힌 큐브 구이와 구운 채소를 함께 볶아낸 메뉴입니다.',
      42000,
      '/images/menu/1783221305281.png',
      false,
      60
    ),
    (
      '세트메뉴',
      '본갈비 스테이크 세트',
      '뼈대가 있는 갈비 스테이크를 큼직하게 구워 풍성하게 즐기는 세트 메뉴입니다.',
      79000,
      '/images/menu/1783221305383.png',
      false,
      80
    ),
    (
      '전체메뉴',
      '스테이크 라이스볼',
      '스테이크 큐브와 채소, 달걀을 밥 위에 올린 든든한 식사 메뉴입니다.',
      16000,
      '/images/menu/1783221305470.png',
      false,
      90
    ),
    (
      '전체메뉴',
      '페퍼 큐브 스테이크',
      '후추 향을 살린 큐브 스테이크와 파프리카, 양파를 곁들인 철판 구이입니다.',
      43000,
      '/images/menu/1783221305545.png',
      false,
      100
    )
) as seed(category, name, description, price, image_url, featured, sort_order)
where not exists (
  select 1
  from public.menu_items existing
  where existing.name = seed.name
);
