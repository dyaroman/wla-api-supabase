create or replace function public.upsert_websites_data(
  p_env       text,
  p_commit    text,
  p_timestamp text,
  p_columns   jsonb,
  p_websites  jsonb
) returns int
language plpgsql
security invoker
as $$
declare
  v_count int;
begin
  -- Upsert websites
  insert into public.websites (env, website, data)
  select p_env, lower(w->>'website'), w
  from jsonb_array_elements(p_websites) as w
  on conflict (env, website) do update
    set data = excluded.data;

  get diagnostics v_count = row_count;

  -- Upsert commit info
  insert into public.info (env, commit, "timestamp")
  values (p_env, p_commit, p_timestamp)
  on conflict (env) do update
    set commit      = excluded.commit,
        "timestamp" = excluded."timestamp";

  -- Upsert column definitions
  insert into public.columns (env, columns)
  values (p_env, p_columns)
  on conflict (env) do update
    set columns = excluded.columns;

  return v_count;
end;
$$;

grant execute on function public.upsert_websites_data(text, text, text, jsonb, jsonb) to service_role;
