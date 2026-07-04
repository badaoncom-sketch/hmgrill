create type public.user_role as enum ('member', 'staff', 'admin');
create type public.coupon_issue_status as enum ('issuing', 'ended');
create type public.coupon_end_reason as enum ('quantity_sold_out', 'admin_stopped');
create type public.coupon_redownload_policy as enum ('after_use_allowed', 'once_per_member');
create type public.coupon_use_flow as enum ('auto_complete', 'staff_confirm');
create type public.member_coupon_status as enum ('available', 'used', 'expired');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'member',
  name text not null,
  phone text,
  email text not null,
  email_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.coupon_issues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  amount integer not null check (amount >= 0),
  quantity integer not null check (quantity > 0),
  downloaded_count integer not null default 0 check (downloaded_count >= 0),
  used_count integer not null default 0 check (used_count >= 0),
  expired_count integer not null default 0 check (expired_count >= 0),
  validity_days integer not null check (validity_days > 0),
  condition_text text,
  qr_notice text not null,
  redownload_policy public.coupon_redownload_policy not null default 'after_use_allowed',
  use_flow public.coupon_use_flow not null default 'staff_confirm',
  status public.coupon_issue_status not null default 'issuing',
  end_reason public.coupon_end_reason,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint downloaded_count_cannot_exceed_quantity check (downloaded_count <= quantity)
);

create table public.member_coupons (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.coupon_issues(id),
  member_id uuid not null references public.profiles(id),
  token text not null unique,
  downloaded_at timestamptz not null default now(),
  valid_from timestamptz not null default now(),
  valid_until timestamptz not null,
  status public.member_coupon_status not null default 'available',
  used_at timestamptz,
  used_by_staff_id uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.coupon_events (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid references public.coupon_issues(id),
  member_coupon_id uuid references public.member_coupons(id),
  actor_id uuid references public.profiles(id),
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index coupon_issues_status_idx on public.coupon_issues(status);
create index member_coupons_member_id_idx on public.member_coupons(member_id);
create index member_coupons_issue_id_idx on public.member_coupons(issue_id);
create index member_coupons_status_idx on public.member_coupons(status);
create index coupon_events_issue_id_idx on public.coupon_events(issue_id);

alter table public.profiles enable row level security;
alter table public.coupon_issues enable row level security;
alter table public.member_coupons enable row level security;
alter table public.coupon_events enable row level security;

create policy "Profiles are readable by owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Members can read issuing coupons"
  on public.coupon_issues for select
  using (status = 'issuing');

create policy "Members can read own coupons"
  on public.member_coupons for select
  using (auth.uid() = member_id);

create policy "Members can read own coupon events"
  on public.coupon_events for select
  using (
    exists (
      select 1
      from public.member_coupons mc
      where mc.id = coupon_events.member_coupon_id
      and mc.member_id = auth.uid()
    )
  );
