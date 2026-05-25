create table if not exists public.info (
  env text primary key,
  commit text not null,
  "timestamp" text not null
);

create table if not exists public.columns (
  env text primary key,
  columns jsonb not null
);

create table if not exists public.websites (
  env text not null,
  website text not null,
  data jsonb not null,
  primary key (env, website)
);

create index if not exists websites_env_idx on public.websites (env);

alter table public.info enable row level security;
alter table public.columns enable row level security;
alter table public.websites enable row level security;

grant usage on schema public to service_role;
grant select, insert, update, delete on table public.info to service_role;
grant select, insert, update, delete on table public.columns to service_role;
grant select, insert, update, delete on table public.websites to service_role;
