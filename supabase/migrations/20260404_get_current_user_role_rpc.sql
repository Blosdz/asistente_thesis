create or replace function "AT".obtener_mi_rol()
returns table (
  usuario_id uuid,
  auth_usuario_id uuid,
  rol varchar,
  verificado boolean
)
language plpgsql
security definer
set search_path to 'AT', 'public', 'auth'
as $$
declare
  v_auth_user_id uuid;
begin
  v_auth_user_id := auth.uid();

  if v_auth_user_id is null then
    raise exception 'Usuario no autenticado';
  end if;

  return query
  select
    u.id,
    u.auth_usuario_id,
    u.rol,
    coalesce(u.verificado, false)
  from "AT".usuarios u
  where u.auth_usuario_id = v_auth_user_id
  limit 1;
end;
$$;

grant execute on function "AT".obtener_mi_rol() to authenticated;
