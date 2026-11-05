-- =============================================================================
-- Ámbar Recoleta · Seguridad: Row Level Security (RLS) y roles
--
-- Reglas:
--   · Público (anon y usuarios logueados): solo LEE la carta, los horarios,
--     los sets publicados y las experiencias activas.
--   · Admin: lee y escribe todo el catálogo; lee consultas y pedidos.
--   · Consultas y pedidos los crea el SERVIDOR (Route Handlers) con la clave
--     secreta, que saltea RLS. Por eso no hay políticas de INSERT públicas:
--     nadie puede crear un pedido salteando la validación de la API.
-- =============================================================================

-- ¿El usuario autenticado es admin? security definer: lee perfiles sin
-- depender de las políticas de perfiles (evita recursión).
create function es_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from perfiles where id = auth.uid() and rol = 'admin');
$$;

alter table cartas            enable row level security;
alter table secciones         enable row level security;
alter table platos            enable row level security;
alter table horarios          enable row level security;
alter table sets              enable row level security;
alter table experiencias      enable row level security;
alter table consultas_eventos enable row level security;
alter table pedidos           enable row level security;
alter table pedido_items      enable row level security;
alter table perfiles          enable row level security;

-- ---------------------------------------------------------------------------
-- Lectura pública del catálogo
-- ---------------------------------------------------------------------------
create policy "Leer cartas" on cartas for select using (true);
create policy "Leer secciones" on secciones for select using (true);
create policy "Leer platos activos" on platos for select using (activo or es_admin());
create policy "Leer horarios" on horarios for select using (true);
create policy "Leer sets publicados" on sets for select using (publicado or es_admin());
create policy "Leer experiencias activas" on experiencias for select using (activa or es_admin());

-- ---------------------------------------------------------------------------
-- Escritura del catálogo: solo admin. Una política por operación (clase 08).
-- USING filtra filas existentes; WITH CHECK valida las filas nuevas.
-- ---------------------------------------------------------------------------
create policy "Admin crea platos" on platos for insert with check (es_admin());
create policy "Admin edita platos" on platos for update using (es_admin()) with check (es_admin());
create policy "Admin borra platos" on platos for delete using (es_admin());

create policy "Admin crea secciones" on secciones for insert with check (es_admin());
create policy "Admin edita secciones" on secciones for update using (es_admin()) with check (es_admin());
create policy "Admin borra secciones" on secciones for delete using (es_admin());

create policy "Admin edita horarios" on horarios for update using (es_admin()) with check (es_admin());

create policy "Admin crea sets" on sets for insert with check (es_admin());
create policy "Admin edita sets" on sets for update using (es_admin()) with check (es_admin());
create policy "Admin borra sets" on sets for delete using (es_admin());

create policy "Admin crea experiencias" on experiencias for insert with check (es_admin());
create policy "Admin edita experiencias" on experiencias for update using (es_admin()) with check (es_admin());
create policy "Admin borra experiencias" on experiencias for delete using (es_admin());

-- ---------------------------------------------------------------------------
-- Datos privados: consultas y pedidos solo los ve (y gestiona) el admin.
-- ---------------------------------------------------------------------------
create policy "Admin lee consultas" on consultas_eventos for select using (es_admin());
create policy "Admin edita consultas" on consultas_eventos for update using (es_admin()) with check (es_admin());

create policy "Admin lee pedidos" on pedidos for select using (es_admin());
create policy "Admin lee items" on pedido_items for select using (es_admin());

-- ---------------------------------------------------------------------------
-- Perfiles: cada uno ve el suyo; el admin ve todos. Nadie se cambia el rol
-- desde la app (no hay política de UPDATE): se hace en el SQL Editor.
-- ---------------------------------------------------------------------------
create policy "Ver perfil propio" on perfiles for select using (id = auth.uid() or es_admin());

-- Las funciones de servidor no se pueden llamar desde el navegador.
revoke execute on function confirmar_pago(uuid, text) from public, anon, authenticated;
