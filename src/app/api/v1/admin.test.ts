/**
 * Tests de las escrituras del admin (POST, PATCH, DELETE): quién puede (401/403),
 * qué se valida (400), cómo se traducen los errores de la base (404/409) y que
 * se regenere el sitio después de cada cambio.
 * La sesión y la base se reemplazan por dobles de prueba.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ErrorApi } from "@/lib/api/respuestas";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/datos", () => ({}));
vi.mock("@/lib/auth", () => ({ exigirAdminApi: vi.fn() }));
vi.mock("@/lib/revalidar", () => ({ revalidarSitio: vi.fn() }));

const { exigirAdminApi } = await import("@/lib/auth");
const { revalidarSitio } = await import("@/lib/revalidar");
const platos = await import("./platos/route");
const plato = await import("./platos/[slug]/route");
const experiencia = await import("./experiencias/[slug]/route");

/**
 * Imita el cliente de Supabase: cada método devuelve el mismo objeto (para
 * encadenar .from().insert().select()…) y al final responde `resultado`.
 * Guarda las llamadas para revisar qué se le pidió a la base.
 */
function baseFalsa(resultado: { data: unknown; error: unknown }) {
  const llamadas: [string, unknown[]][] = [];
  const consulta: Record<string, unknown> = {
    then: (resolver: (r: unknown) => void) => resolver(resultado),
  };
  for (const metodo of [
    "from",
    "insert",
    "update",
    "delete",
    "select",
    "eq",
    "single",
    "maybeSingle",
  ])
    consulta[metodo] = (...args: unknown[]) => {
      llamadas.push([metodo, args]);
      return consulta;
    };
  return { db: consulta, llamadas };
}

function comoAdmin(resultado: { data: unknown; error: unknown }) {
  const falsa = baseFalsa(resultado);
  vi.mocked(exigirAdminApi).mockResolvedValue({
    db: falsa.db,
  } as unknown as Awaited<ReturnType<typeof exigirAdminApi>>);
  return falsa.llamadas;
}

const enviar = (metodo: string, cuerpo: unknown) =>
  new Request("http://localhost/api/v1/platos", {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: typeof cuerpo === "string" ? cuerpo : JSON.stringify(cuerpo),
  });
const contexto = (slug: string) => ({ params: Promise.resolve({ slug }) });

const platoValido = {
  seccionId: "1b4e28ba-2fa1-41d2-883f-0016d3cca427",
  slug: "provoleta",
  nombre: "Provoleta",
  descripcionEs: "Con orégano.",
  descripcionEn: "With oregano.",
  precio: 15000,
  activo: true,
  orden: 3,
};

beforeEach(() => vi.clearAllMocks());

describe("permisos", () => {
  it.each([
    [401, "no_autenticado"],
    [403, "sin_permiso"],
  ] as const)(
    "responde %i si exigirAdminApi lo rechaza",
    async (status, codigo) => {
      vi.mocked(exigirAdminApi).mockRejectedValue(
        new ErrorApi(status, codigo, "…"),
      );
      const res = await platos.POST(enviar("POST", platoValido));
      expect(res.status).toBe(status);
      expect((await res.json()).error.codigo).toBe(codigo);
      expect(revalidarSitio).not.toHaveBeenCalled();
    },
  );
});

describe("POST /api/v1/platos", () => {
  it("201: guarda en snake_case y regenera el sitio", async () => {
    const llamadas = comoAdmin({ data: { slug: "provoleta" }, error: null });
    const res = await platos.POST(enviar("POST", platoValido));
    expect(res.status).toBe(201);
    const insert = llamadas.find(([m]) => m === "insert");
    expect(insert?.[1][0]).toMatchObject({
      seccion_id: platoValido.seccionId,
      descripcion_es: "Con orégano.",
      precio: 15000,
    });
    expect(revalidarSitio).toHaveBeenCalledOnce();
  });

  it("400 con el detalle de cada campo inválido", async () => {
    comoAdmin({ data: null, error: null });
    const res = await platos.POST(
      enviar("POST", { ...platoValido, slug: "Con Espacios", precio: 12.5 }),
    );
    expect(res.status).toBe(400);
    const campos = (await res.json()).error.detalles.map(
      (d: { campo: string }) => d.campo,
    );
    expect(campos).toEqual(expect.arrayContaining(["slug", "precio"]));
  });

  it("400 si falta un campo o sobra uno", async () => {
    comoAdmin({ data: null, error: null });
    const incompleto: Partial<typeof platoValido> = { ...platoValido };
    delete incompleto.nombre;
    expect((await platos.POST(enviar("POST", incompleto))).status).toBe(400);
    expect(
      (await platos.POST(enviar("POST", { ...platoValido, admin: true })))
        .status,
    ).toBe(400);
  });

  it("400 si el cuerpo no es JSON", async () => {
    comoAdmin({ data: null, error: null });
    const res = await platos.POST(enviar("POST", "{esto no es json"));
    expect(res.status).toBe(400);
    expect((await res.json()).error.codigo).toBe("json_invalido");
  });

  it("409 si el slug ya existe (unique de Postgres)", async () => {
    comoAdmin({ data: null, error: { code: "23505", message: "duplicate" } });
    const res = await platos.POST(enviar("POST", platoValido));
    expect(res.status).toBe(409);
    expect(revalidarSitio).not.toHaveBeenCalled();
  });
});

describe("PATCH /api/v1/platos/:slug", () => {
  it("200: solo manda los campos que cambiaron", async () => {
    const llamadas = comoAdmin({ data: { slug: "papas" }, error: null });
    const res = await plato.PATCH(
      enviar("PATCH", { precio: 13000 }),
      contexto("papas"),
    );
    expect(res.status).toBe(200);
    expect(llamadas.find(([m]) => m === "update")?.[1][0]).toEqual({
      precio: 13000,
    });
    expect(llamadas.find(([m]) => m === "eq")?.[1]).toEqual(["slug", "papas"]);
  });

  it("400 si no hay ningún cambio", async () => {
    comoAdmin({ data: null, error: null });
    const res = await plato.PATCH(enviar("PATCH", {}), contexto("papas"));
    expect(res.status).toBe(400);
  });

  it("404 si el plato no existe", async () => {
    comoAdmin({ data: null, error: null });
    const res = await plato.PATCH(
      enviar("PATCH", { activo: false }),
      contexto("no-existe"),
    );
    expect(res.status).toBe(404);
  });
});

describe("DELETE", () => {
  it("204 sin cuerpo al borrar un plato", async () => {
    comoAdmin({ data: [{ slug: "papas" }], error: null });
    const res = await plato.DELETE(enviar("DELETE", ""), contexto("papas"));
    expect(res.status).toBe(204);
    expect(await res.text()).toBe("");
  });

  it("404 si no había nada que borrar", async () => {
    comoAdmin({ data: [], error: null });
    const res = await plato.DELETE(enviar("DELETE", ""), contexto("papas"));
    expect(res.status).toBe(404);
  });

  it("409 al borrar una experiencia que ya se vendió", async () => {
    comoAdmin({ data: null, error: { code: "23503", message: "fk" } });
    const res = await experiencia.DELETE(
      enviar("DELETE", ""),
      contexto("cena-para-dos"),
    );
    expect(res.status).toBe(409);
    expect((await res.json()).error.codigo).toBe("en_uso");
  });
});
