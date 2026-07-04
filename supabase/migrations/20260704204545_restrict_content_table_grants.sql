revoke all privileges on table public.menu_items from anon, authenticated;
revoke all privileges on table public.content_posts from anon, authenticated;
revoke all privileges on table public.inquiries from anon, authenticated;
revoke all privileges on table public.site_banners from anon, authenticated;
revoke all privileges on table public.site_popups from anon, authenticated;

revoke all privileges on table public.menu_items from service_role;
revoke all privileges on table public.content_posts from service_role;
revoke all privileges on table public.inquiries from service_role;
revoke all privileges on table public.site_banners from service_role;
revoke all privileges on table public.site_popups from service_role;

grant select on table public.menu_items to anon, authenticated;
grant select on table public.content_posts to anon, authenticated;
grant select on table public.site_banners to anon, authenticated;
grant select on table public.site_popups to anon, authenticated;

grant all privileges on table public.menu_items to service_role;
grant all privileges on table public.content_posts to service_role;
grant all privileges on table public.inquiries to service_role;
grant all privileges on table public.site_banners to service_role;
grant all privileges on table public.site_popups to service_role;
