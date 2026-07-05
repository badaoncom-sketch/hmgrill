alter table public.menu_items
  add column image_url text;

comment on column public.menu_items.image_url
  is 'Public menu image path. Prefer local static paths such as /images/menu/example.webp.';
