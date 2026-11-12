-- =============================================================================
-- Cuentas de clientes.
-- Cualquiera puede crear una cuenta (email y contraseña, o Google). Con sesión,
-- sus compras y consultas quedan asociadas a su usuario y las ve en "Mi cuenta".
-- Sin sesión se puede comprar y consultar igual: la cuenta es opcional.
-- =============================================================================

alter table pedidos
  add column usuario_id uuid references auth.users (id) on delete set null;
alter table consultas_eventos
  add column usuario_id uuid references auth.users (id) on delete set null;

create index pedidos_usuario_idx on pedidos (usuario_id);
create index consultas_usuario_idx on consultas_eventos (usuario_id);

-- Cada cliente lee lo suyo (y nada más). El admin ya lee todo.
-- Escribir sigue siendo solo del servidor, que valida antes.
create policy "Cliente lee sus pedidos" on pedidos
  for select using (usuario_id = auth.uid());

create policy "Cliente lee los items de sus pedidos" on pedido_items
  for select using (
    exists (
      select 1 from pedidos p
      where p.id = pedido_items.pedido_id and p.usuario_id = auth.uid()
    )
  );

create policy "Cliente lee sus consultas" on consultas_eventos
  for select using (usuario_id = auth.uid());

-- La seña se asocia a la cuenta del cliente que consultó, así la ve en "Mi cuenta".
create or replace function crear_sena(p_consulta uuid, p_monto integer)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_consulta consultas_eventos%rowtype;
  v_pedido   uuid;
begin
  if not es_admin() then
    raise exception 'sin_permiso';
  end if;
  select * into v_consulta from consultas_eventos where id = p_consulta;
  if not found then
    raise exception 'consulta_inexistente';
  end if;
  if v_consulta.estado in ('senada', 'descartada') then
    raise exception 'consulta_cerrada';
  end if;

  -- Si ya había una seña sin pagar para esta consulta, queda cancelada:
  -- vale solo el último link.
  update pedidos set estado = 'cancelado'
    where consulta_id = p_consulta and tipo = 'sena' and estado = 'pendiente';

  -- La seña queda en la cuenta de quien hizo la consulta (si tenía cuenta).
  insert into pedidos (tipo, nombre, email, total, consulta_id, usuario_id)
  values ('sena', v_consulta.nombre, v_consulta.email, p_monto, p_consulta, v_consulta.usuario_id)
  returning id into v_pedido;

  insert into pedido_items (pedido_id, descripcion, precio_unitario, cantidad)
  values (
    v_pedido,
    'Seña evento ' || to_char(v_consulta.fecha, 'DD/MM/YYYY') || ' · ' || v_consulta.personas || ' personas',
    p_monto,
    1
  );
  return v_pedido;
end;
$$;
