/**
 * Pruebas de la base de datos: corren las tres migraciones reales sobre un
 * PostgreSQL de verdad (PGlite: Postgres compilado a WebAssembly, corre dentro
 * de Node sin Docker) y verifican las políticas RLS actuando como visitante
 * anónimo, usuario común y admin. Así la seguridad se prueba en cada PR.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";

const MIGRACIONES = [
  "20261104000001_esquema.sql",
  "20261104000002_seguridad.sql",
  "20261104000003_semilla.sql",
];

let db: PGlite;

// Lo mínimo que Supabase ya trae y PGlite no: roles, esquema auth y auth.uid().
const SIMULACION_SUPABASE = `
  create role anon nologin;
  create role authenticated nologin;
  create schema auth;
  create table auth.users (id uuid primary key default gen_random_uuid(), email text);
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema auth to anon, authenticated;
  grant execute on function auth.uid() to anon, authenticated;
`;

const uno = async <T>(sql: string) => (await db.query<T>(sql)).rows[0];
const contar = async (tabla: string) =>
  Number((await uno<{ n: string }>(`select count(*) n from ${tabla}`)).n);

/** Ejecuta `fn` con el rol y el usuario indicados, como lo haría Supabase. */
async function como(
  rol: "anon" | "authenticated",
  usuario: string,
  fn: () => Promise<void>,
) {
  await db.exec(
    `set role ${rol}; select set_config('request.jwt.claim.sub', '${usuario}', false);`,
  );
  try {
    await fn();
  } finally {
    await db.exec(`reset role;`);
  }
}

async function crearUsuario(email: string, admin = false) {
  const { id } = await uno<{ id: string }>(
    `insert into auth.users (email) values ('${email}') returning id`,
  );
  if (admin)
    await db.exec(`update perfiles set rol = 'admin' where id = '${id}'`);
  return id;
}

beforeAll(async () => {
  db = new PGlite();
  await db.exec(SIMULACION_SUPABASE);
  for (const archivo of MIGRACIONES) {
    await db.exec(readFileSync(join(__dirname, "migrations", archivo), "utf8"));
  }
  // Supabase da estos permisos por defecto; después RLS decide fila por fila.
  await db.exec(`
    grant usage on schema public to anon, authenticated;
    grant select, insert, update, delete on all tables in schema public to anon, authenticated;
  `);
}, 30_000);

describe("semilla", () => {
  it("carga la carta, los horarios y las experiencias", async () => {
    expect(await contar("platos")).toBe(36);
    expect(await contar("horarios")).toBe(7);
    expect(await contar("experiencias")).toBe(3);
  });
});

describe("RLS: visitante anónimo", () => {
  it("lee la carta pero no los pedidos", () =>
    como("anon", "", async () => {
      expect(await contar("platos")).toBe(36);
      expect(await contar("pedidos")).toBe(0);
    }));

  it("no puede crear ni editar platos", () =>
    como("anon", "", async () => {
      await expect(
        db.exec(`insert into platos (seccion_id, slug, nombre, descripcion_es, descripcion_en)
                 select id, 'x', 'x', 'x', 'x' from secciones limit 1`),
      ).rejects.toThrow(/row-level security/);
      const editados = await db.query(
        `update platos set precio = 1 returning id`,
      );
      expect(editados.rows).toHaveLength(0);
    }));

  it("no puede crear consultas salteando la API", () =>
    como("anon", "", async () => {
      await expect(
        db.exec(`insert into consultas_eventos (nombre, email, fecha, personas, tipo)
                 values ('a', 'a@a.com', '2026-12-01', 10, 'otro')`),
      ).rejects.toThrow(/row-level security/);
    }));

  it("no puede confirmar pagos", () =>
    como("anon", "", async () => {
      await expect(
        db.query(`select confirmar_pago(gen_random_uuid(), '1')`),
      ).rejects.toThrow(/permission denied/);
    }));
});

describe("RLS: usuarios y roles", () => {
  it("un usuario nuevo recibe el rol 'usuario' y no puede editar", async () => {
    const id = await crearUsuario("cliente@test.com");
    expect(
      (
        await uno<{ rol: string }>(
          `select rol from perfiles where id = '${id}'`,
        )
      ).rol,
    ).toBe("usuario");
    await como("authenticated", id, async () => {
      expect(
        (await db.query(`update platos set precio = 1 returning id`)).rows,
      ).toHaveLength(0);
    });
  });

  it("el admin edita, y un plato inactivo deja de verse en público", async () => {
    const admin = await crearUsuario("admin@ambar.com", true);
    await como("authenticated", admin, async () => {
      const r = await uno<{ precio: number }>(
        `update platos set precio = 30000 where slug = 'tartar-ciervo' returning precio`,
      );
      expect(r.precio).toBe(30000);
      await db.exec(
        `update platos set activo = false where slug = 'garlic-bread'`,
      );
      expect(await contar("platos")).toBe(36);
    });
    await como("anon", "", async () => {
      expect(await contar("platos")).toBe(35);
    });
  });
});

describe("confirmar_pago (webhook de Mercado Pago)", () => {
  async function crearPedido(slug: string, cantidades: number[]) {
    const { id } = await uno<{ id: string }>(
      `insert into pedidos (tipo, nombre, email, total) values ('experiencias', 'Ana', 'ana@test.com', 1000) returning id`,
    );
    for (const cantidad of cantidades) {
      await db.exec(`insert into pedido_items (pedido_id, experiencia_id, descripcion, precio_unitario, cantidad)
        values ('${id}', (select id from experiencias where slug = '${slug}'), 'x', 1000, ${cantidad})`);
    }
    return id;
  }
  const cupos = async (slug: string) =>
    (
      await uno<{ cupos: number }>(
        `select cupos from experiencias where slug = '${slug}'`,
      )
    ).cupos;

  it("marca pagado, descuenta cupos y genera códigos, una sola vez", async () => {
    const antes = await cupos("cena-para-dos");
    const pedido = await crearPedido("cena-para-dos", [2]);

    expect(
      (
        await uno<{ ok: boolean }>(
          `select confirmar_pago('${pedido}', 'MP-1') ok`,
        )
      ).ok,
    ).toBe(true);
    expect(await cupos("cena-para-dos")).toBe(antes - 2);
    const item = await uno<{ codigo: string }>(
      `select codigo from pedido_items where pedido_id = '${pedido}'`,
    );
    expect(item.codigo).toMatch(/^[0-9A-F]{8}$/);

    // Mercado Pago puede reenviar el mismo aviso: no se descuenta de nuevo.
    expect(
      (
        await uno<{ ok: boolean }>(
          `select confirmar_pago('${pedido}', 'MP-1') ok`,
        )
      ).ok,
    ).toBe(false);
    expect(await cupos("cena-para-dos")).toBe(antes - 2);
  });

  it("sin cupos suficientes revierte toda la transacción", async () => {
    const pedido = await crearPedido("la-noche-entera", [10, 1]);
    await expect(
      db.query(`select confirmar_pago('${pedido}', 'MP-2')`),
    ).rejects.toThrow(/cupos_check/);
    expect(
      (
        await uno<{ estado: string }>(
          `select estado from pedidos where id = '${pedido}'`,
        )
      ).estado,
    ).toBe("pendiente");
    expect(await cupos("la-noche-entera")).toBe(10);
  });

  it("una seña paga marca la consulta como señada", async () => {
    const { id: consulta } = await uno<{ id: string }>(
      `insert into consultas_eventos (nombre, email, fecha, personas, tipo)
       values ('Caro', 'c@test.com', '2026-12-12', 40, 'cumpleanos') returning id`,
    );
    const { id: pedido } = await uno<{ id: string }>(
      `insert into pedidos (tipo, nombre, email, total, consulta_id)
       values ('sena', 'Caro', 'c@test.com', 50000, '${consulta}') returning id`,
    );
    await db.exec(`insert into pedido_items (pedido_id, descripcion, precio_unitario, cantidad)
                   values ('${pedido}', 'Seña evento privado', 50000, 1)`);
    await db.query(`select confirmar_pago('${pedido}', 'MP-3')`);
    expect(
      (
        await uno<{ estado: string }>(
          `select estado from consultas_eventos where id = '${consulta}'`,
        )
      ).estado,
    ).toBe("senada");
  });

  it("una seña sin consulta es inválida", async () => {
    await expect(
      db.exec(
        `insert into pedidos (tipo, nombre, email, total) values ('sena', 'X', 'x@x.com', 1)`,
      ),
    ).rejects.toThrow(/pedidos_check/);
  });
});
