-- 홈페이지(로고·히어로·섹션·푸터) 문구와 이미지를 키-값으로 관리한다.
create table if not exists public.site_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

create policy "Site settings are publicly readable"
  on public.site_settings for select
  to anon, authenticated
  using (true);

revoke all privileges on table public.site_settings from anon, authenticated;
grant select on public.site_settings to anon, authenticated;
grant all privileges on table public.site_settings to service_role;

-- 홈페이지 이미지 업로드용 공개 버킷
insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do nothing;
