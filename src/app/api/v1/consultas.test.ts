/**
 * Tests de las consultas de eventos: el POST público (validación, trampa para
 * bots, se guarda con la clave secreta) y el PATCH del admin.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ErrorApi } from "@/lib/api/respuestas";
import { baseFalsa } from "@/test/dobles";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth", () => ({
  exigirAdminApi: vi.fn(),
  usuarioActualId: vi.fn().mockResolvedValue(null),
}));
vi.mock("@/lib/supabase/servicio", () => ({ clienteServicio: vi.fn() }));

const { exigirAdminApi } = await import("@/lib/auth");
const { clienteServicio } = await import("@/lib/supabase/servicio");
const consultas = await import("./consultas/route");
const consulta = await import("./consultas/[id]/route");

const ID = "2b0f7c1e-0000-4000-8000-000000000001";
const enviar = (cuerpo: unknown, metodo = "POST") =>
  new Request("http://localhost/api/v1/consultas", {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cuerpo),
  });

const valida = {
  nombre: "Caro",
  email: "caro@mail.com",
  telefono: "",
  fecha: "2026-12-12",
  personas: 40,
  tipo: "empresa",
  mensaje: "  Cena y después barra.  ",
  sitio: "",
};

let llamadas: ReturnType<typeof baseFalsa>["llamadas"];
beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-11-05T15:00:00Z"));
  const falsa = baseFalsa({ data: { id: ID }, error: null });
  llamadas = falsa.llamadas;
  vi.mocked(clienteServicio).mockReturnValue(
    falsa.db as unknown as ReturnType<typeof clienteServicio>,
  );
});

describe("POST /api/v1/consultas", () => {
  it("201: guarda lo validado, con los opcionales vacíos como null", async () => {
    const res = await consultas.POST(enviar(valida));
    expect(res.status).toBe(201);
    expect((await res.json()).datos.id).toBe(ID);
    expect(llamadas.find(([m]) => m === "from")?.[1]).toEqual([
      "consultas_eventos",
    ]);
    expect(llamadas.find(([m]) => m === "insert")?.[1][0]).toEqual({
      nombre: "Caro",
      email: "caro@mail.com",
      telefono: null,
      fecha: "2026-12-12",
      personas: 40,
      tipo: "empresa",
      mensaje: "Cena y después barra.",
      usuario_id: null, // sin sesión: queda como invitado
    });
  });

  it("400 con claves de error por campo", async () => {
    const res = await consultas.POST(
      enviar({ ...valida, fecha: "2026-01-01", personas: 1000 }),
    );
    expect(res.status).toBe(400);
    const { error } = await res.json();
    expect(error.detalles).toEqual(
      expect.arrayContaining([
        { campo: "fecha", mensaje: "fecha_pasada" },
        { campo: "personas", mensaje: "personas_maximo" },
      ]),
    );
    expect(clienteServicio).not.toHaveBeenCalled();
  });

  it("un bot que completa el campo trampa recibe 201, pero no se guarda nada", async () => {
    const res = await consultas.POST(
      enviar({ ...valida, sitio: "http://spam.example" }),
    );
    expect(res.status).toBe(201);
    expect(clienteServicio).not.toHaveBeenCalled();
  });

  it("no acepta campos que no existen (por ejemplo, forzar el estado)", async () => {
    const res = await consultas.POST(enviar({ ...valida, estado: "senada" }));
    expect(res.status).toBe(400);
  });
});

describe("PATCH /api/v1/consultas/:id", () => {
  const contexto = (id: string) => ({ params: Promise.resolve({ id }) });

  it("403 si no es admin", async () => {
    vi.mocked(exigirAdminApi).mockRejectedValue(
      new ErrorApi(403, "sin_permiso", "…"),
    );
    const res = await consulta.PATCH(
      enviar({ estado: "contactada" }, "PATCH"),
      contexto(ID),
    );
    expect(res.status).toBe(403);
  });

  it("200 al marcarla como contactada; 400 con un estado inventado", async () => {
    const falsa = baseFalsa({
      data: { id: ID, estado: "contactada" },
      error: null,
    });
    vi.mocked(exigirAdminApi).mockResolvedValue({
      db: falsa.db,
    } as unknown as Awaited<ReturnType<typeof exigirAdminApi>>);
    const ok = await consulta.PATCH(
      enviar({ estado: "contactada" }, "PATCH"),
      contexto(ID),
    );
    expect(ok.status).toBe(200);
    const mal = await consulta.PATCH(
      enviar({ estado: "aprobada" }, "PATCH"),
      contexto(ID),
    );
    expect(mal.status).toBe(400);
  });

  it("400 si el id no es un uuid", async () => {
    vi.mocked(exigirAdminApi).mockResolvedValue({
      db: baseFalsa({ data: null, error: null }).db,
    } as unknown as Awaited<ReturnType<typeof exigirAdminApi>>);
    const res = await consulta.PATCH(
      enviar({ estado: "contactada" }, "PATCH"),
      contexto("1 or 1=1"),
    );
    expect(res.status).toBe(400);
  });
});
