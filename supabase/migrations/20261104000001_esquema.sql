-- =============================================================================
-- Ámbar Recoleta · Esquema de la base de datos
-- Se ejecuta en el SQL Editor de Supabase, en orden: esquema → seguridad → semilla.
-- Precios: enteros en pesos argentinos (sin decimales).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- La carta: cartas (aperitivo, cena, tragos) → secciones → platos.  1:N → 1:N
-- ---------------------------------------------------------------------------
create table cartas (
  id         text primary key check (id in ('aperitivo', 'cena', 'tragos')),
  titulo_es  varchar(60) not null,
  titulo_en  varchar(60) not null,
  orden      smallint not null default 0
);

create table secciones (
  id         uuid primary key default gen_random_uuid(),
  carta_id   text not null references cartas (id) on delete cascade,
  slug       varchar(40) not null,
  titulo_es  varchar(60) not null,
  titulo_en  varchar(60) not null,
  orden      smallint not null default 0,
  unique (carta_id, slug)
);

create table platos (
  id              uuid primary key default gen_random_uuid(),
  seccion_id      uuid not null references secciones (id) on delete cascade,
  slug            varchar(60) not null unique,
  nombre          varchar(80) not null,
  descripcion_es  text not null,
  descripcion_en  text not null,
  precio          integer check (precio is null or precio >= 0),
  activo          boolean not null default true,
  orden           smallint not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index platos_seccion_idx on platos (seccion_id);

-- ---------------------------------------------------------------------------
-- Horarios: una fila por día de la semana (0 = domingo … 6 = sábado).
-- Una hora menor que `abre` es de después de medianoche (la noche sigue).
-- ---------------------------------------------------------------------------
create table horarios (
  dia              smallint primary key check (dia between 0 and 6),
  abierto          boolean not null default false,
  abre             time,
  aperitivo_hasta  time,
  cocina_hasta     time,
  dj_desde         time,
  cierra           time,
  -- Si el día está abierto, las horas principales son obligatorias.
  check (
    not abierto
    or (abre is not null and aperitivo_hasta is not null and cocina_hasta is not null and cierra is not null)
  )
);

-- ---------------------------------------------------------------------------
-- Sets de Colonia Radio grabados en Ámbar (YouTube).
-- ---------------------------------------------------------------------------
create table sets (
  id          uuid primary key default gen_random_uuid(),
  youtube_id  varchar(20) not null unique,
  titulo      varchar(120) not null,
  serie       varchar(40),
  publicado   boolean not null default true,
  orden       smallint not null default 0,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Experiencias para regalar (lo que se vende en el checkout, E6).
-- `cupos` funciona como stock: baja cuando un pago se confirma.
-- ---------------------------------------------------------------------------
create table experiencias (
  id              uuid primary key default gen_random_uuid(),
  slug            varchar(60) not null unique,
  nombre_es       varchar(80) not null,
  nombre_en       varchar(80) not null,
  descripcion_es  text not null,
  descripcion_en  text not null,
  precio          integer not null check (precio > 0),
  cupos           integer not null default 0 check (cupos >= 0),
  activa          boolean not null default true,
  orden           smallint not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Consultas de eventos privados (formulario de E3).
-- ---------------------------------------------------------------------------
create table consultas_eventos (
  id          uuid primary key default gen_random_uuid(),
  nombre      varchar(80) not null,
  email       varchar(120) not null,
  telefono    varchar(30),
  fecha       date not null,
  personas    integer not null check (personas between 1 and 300),
  tipo        varchar(30) not null check (tipo in ('cumpleanos', 'empresa', 'casamiento', 'otro')),
  mensaje     text,
  estado      varchar(20) not null default 'nueva'
              check (estado in ('nueva', 'contactada', 'senada', 'descartada')),
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Pedidos (E6). Un pedido es de experiencias o es la seña de una consulta.
-- `id` viaja a Mercado Pago como external_reference para conciliar el pago.
-- ---------------------------------------------------------------------------
create table pedidos (
  id                 uuid primary key default gen_random_uuid(),
  tipo               varchar(20) not null check (tipo in ('experiencias', 'sena')),
  estado             varchar(20) not null default 'pendiente'
                     check (estado in ('pendiente', 'pagado', 'rechazado', 'cancelado', 'reembolsado')),
  nombre             varchar(80) not null,
  email              varchar(120) not null,
  total              integer not null check (total > 0),
  consulta_id        uuid references consultas_eventos (id) on delete set null,
  mp_preference_id   varchar(80),
  mp_payment_id      varchar(40),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  -- Una seña siempre apunta a su consulta.
  check (tipo <> 'sena' or consulta_id is not null)
);

create table pedido_items (
  id               uuid primary key default gen_random_uuid(),
  pedido_id        uuid not null references pedidos (id) on delete cascade,
  experiencia_id   uuid references experiencias (id) on delete set null,
  descripcion      varchar(120) not null,
  precio_unitario  integer not null check (precio_unitario > 0),
  cantidad         integer not null check (cantidad between 1 and 10),
  -- Código de regalo: se genera recién cuando el pago se confirma.
  codigo           varchar(12) unique
);

create index pedido_items_pedido_idx on pedido_items (pedido_id);

-- ---------------------------------------------------------------------------
-- Perfiles y roles (RBAC, clase 09). Una fila por usuario de Supabase Auth.  1:1
-- ---------------------------------------------------------------------------
create table perfiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  rol         varchar(20) not null default 'usuario' check (rol in ('admin', 'usuario')),
  created_at  timestamptz not null default now()
);

-- Cada usuario nuevo de Auth recibe su perfil con rol 'usuario'.
-- El primer admin se asigna a mano (ver README).
create function crear_perfil() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into perfiles (id) values (new.id);
  return new;
end;
$$;

create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function crear_perfil();

-- ---------------------------------------------------------------------------
-- updated_at automático
-- ---------------------------------------------------------------------------
create function tocar_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger platos_updated_at before update on platos
  for each row execute function tocar_updated_at();
create trigger experiencias_updated_at before update on experiencias
  for each row execute function tocar_updated_at();
create trigger pedidos_updated_at before update on pedidos
  for each row execute function tocar_updated_at();

-- ---------------------------------------------------------------------------
-- Confirmar un pago (lo llama el webhook de Mercado Pago, E6).
-- Todo pasa en una sola transacción (ACID): o se marca pagado, se descuentan
-- los cupos y se generan los códigos, o no pasa nada.
-- Es idempotente: si Mercado Pago reenvía el aviso, el segundo llamado no hace nada.
-- ---------------------------------------------------------------------------
create function confirmar_pago(p_pedido uuid, p_payment_id text) returns boolean
language plpgsql security definer set search_path = public as $$
declare
  v_pedido pedidos%rowtype;
  v_item   pedido_items%rowtype;
begin
  select * into v_pedido from pedidos where id = p_pedido for update;
  if not found or v_pedido.estado <> 'pendiente' then
    return false;
  end if;

  update pedidos set estado = 'pagado', mp_payment_id = p_payment_id where id = p_pedido;

  for v_item in select * from pedido_items where pedido_id = p_pedido loop
    if v_item.experiencia_id is not null then
      -- El check (cupos >= 0) aborta toda la transacción si no alcanza el stock.
      update experiencias set cupos = cupos - v_item.cantidad where id = v_item.experiencia_id;
    end if;
    update pedido_items
      set codigo = upper(substr(md5(gen_random_uuid()::text), 1, 8))
      where id = v_item.id;
  end loop;

  if v_pedido.tipo = 'sena' then
    update consultas_eventos set estado = 'senada' where id = v_pedido.consulta_id;
  end if;

  return true;
end;
$$;
