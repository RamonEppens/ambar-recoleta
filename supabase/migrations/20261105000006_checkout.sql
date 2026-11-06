-- =============================================================================
-- Checkout: crear pedidos y señas dentro de la base.
--
-- Los precios y el stock NUNCA vienen del navegador: el servidor manda solo
-- qué experiencias y cuántas, y estas funciones leen el precio de la tabla.
-- Así, aunque alguien modifique el carrito en su navegador, paga lo que dice la base.
-- =============================================================================

-- Pedido de experiencias para regalar. p_items: [{"slug": "...", "cantidad": 2}, ...]
-- Devuelve el id del pedido (que viaja a Mercado Pago como external_reference).
create function crear_pedido(p_nombre text, p_email text, p_items jsonb)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_pedido uuid;
  v_item   jsonb;
  v_exp    experiencias%rowtype;
  v_cant   integer;
  v_total  integer := 0;
begin
  if jsonb_array_length(p_items) = 0 then
    raise exception 'carrito_vacio';
  end if;

  insert into pedidos (tipo, nombre, email, total)
  values ('experiencias', p_nombre, p_email, 1) -- el total real se calcula abajo
  returning id into v_pedido;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_cant := (v_item ->> 'cantidad')::integer;
    select * into v_exp from experiencias
      where slug = v_item ->> 'slug' and activa;
    if not found then
      raise exception 'experiencia_no_disponible: %', v_item ->> 'slug';
    end if;
    -- Control temprano, para avisar antes de pagar. El definitivo lo hace
    -- confirmar_pago(), porque entre crear el pedido y pagarlo pueden venderse.
    if v_exp.cupos < v_cant then
      raise exception 'sin_cupos: %', v_exp.slug;
    end if;
    insert into pedido_items (pedido_id, experiencia_id, descripcion, precio_unitario, cantidad)
    values (v_pedido, v_exp.id, v_exp.nombre_es, v_exp.precio, v_cant);
    v_total := v_total + v_exp.precio * v_cant;
  end loop;

  update pedidos set total = v_total where id = v_pedido;
  return v_pedido;
end;
$$;

-- Seña de un evento privado: la pide el admin desde el panel, con el monto acordado.
create function crear_sena(p_consulta uuid, p_monto integer)
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

  insert into pedidos (tipo, nombre, email, total, consulta_id)
  values ('sena', v_consulta.nombre, v_consulta.email, p_monto, p_consulta)
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

-- Permisos: crear pedidos y confirmar pagos, solo el servidor (clave secreta).
-- La seña la puede pedir un usuario con sesión, pero la función exige que sea admin.
revoke execute on function crear_pedido(text, text, jsonb) from public, anon, authenticated;
revoke execute on function crear_sena(uuid, integer) from public, anon;
grant execute on function crear_sena(uuid, integer) to authenticated;
grant execute on function crear_pedido(text, text, jsonb) to service_role;
grant execute on function confirmar_pago(uuid, text) to service_role;
