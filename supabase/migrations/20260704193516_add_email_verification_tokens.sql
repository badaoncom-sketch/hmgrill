create table public.email_verification_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index email_verification_tokens_user_id_idx
  on public.email_verification_tokens(user_id);

create index email_verification_tokens_unused_idx
  on public.email_verification_tokens(token_hash)
  where used_at is null;

revoke all privileges on table public.email_verification_tokens from anon, authenticated;
grant all privileges on table public.email_verification_tokens to service_role;

alter table public.email_verification_tokens enable row level security;
