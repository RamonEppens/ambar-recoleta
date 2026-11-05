/**
 * Tests de la API: llaman a los Route Handlers como lo haría Next, con un
 * Request real, y revisan el código HTTP y el JSON. La base se reemplaza por
 * datos fijos (vi.mock), así se prueba la API sola: validación, filtros y errores.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Carta, Experiencia } from "@/lib/tipos";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/datos", () => ({
  getCartas: vi.fn(),
  getExperiencias: vi.fn(),
  getExperiencia: vi.fn(),
}));

const datos = await import("@/lib/datos");
const platos = await import("./platos/route");
const plato = await import("./platos/[slug]/route");
const experiencias = await import("./experiencias/route");
const experiencia = await import("./experiencias/[slug]/route");

const cartas: Carta[] = [
  {
    id: "cena",
    titulo: { es: "Cena", en: "Dinner" },
    secciones: [
      {
        id: "chicos",
        titulo: { es: "Chicos", en: "Small" },
        platos: [
          {
            id: "tartar-de-ciervo",
            nombre: "Tartar de Ciervo",
            descripcion: { es: "Con yema curada", en: "With cured yolk" },
            precio: 29000,
          },
          {
            id: "papas",
            nombre: "Papas",
            descripcion: { es: "", en: "" },
            precio: 12000,
          },
        ],
      },
    ],
  },
];

const regalo: Experiencia = {
  id: "7f1c0b6e-0000-4000-8000-000000000000",
  slug: "cena-para-dos",
  nombre: { es: "Cena para dos", en: "Dinner for two" },
  descripcion: { es: "…", en: "…" },
  precio: 120000,
  cupos: 20,
  foto: "mesaCena",
};

const pedir = (ruta: string) => new Request(`http://localhost${ruta}`);
const contexto = (slug: string) => ({ params: Promise.resolve({ slug }) });

beforeEach(() => {
  vi.mocked(datos.getCartas).mockResolvedValue(cartas);
  vi.mocked(datos.getExperiencias).mockResolvedValue([regalo]);
  vi.mocked(datos.getExperiencia).mockImplementation(async (slug) =>
    slug === regalo.slug ? regalo : null,
  );
});

describe("GET /api/v1/platos", () => {
  it("200 con todos los platos, total y paginación", async () => {
    const res = await platos.GET(pedir("/api/v1/platos"));
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toContain("s-maxage");
    const cuerpo = await res.json();
    expect(cuerpo).toMatchObject({ total: 2, pagina: 1, limite: 50 });
    expect(cuerpo.datos[0]).toMatchObject({ carta: "cena", seccion: "chicos" });
  });

  it("filtra por búsqueda y precio", async () => {
    const res = await platos.GET(
      pedir("/api/v1/platos?q=CIERVO&precioMax=30000"),
    );
    const cuerpo = await res.json();
    expect(cuerpo.total).toBe(1);
    expect(cuerpo.datos[0].id).toBe("tartar-de-ciervo");
  });

  it("pagina los resultados", async () => {
    const res = await platos.GET(pedir("/api/v1/platos?limite=1&pagina=2"));
    const cuerpo = await res.json();
    expect(cuerpo.total).toBe(2);
    expect(cuerpo.datos.map((p: { id: string }) => p.id)).toEqual(["papas"]);
  });

  it.each([
    ["una carta que no existe", "?carta=postres", "carta"],
    ["un precio que no es número", "?precioMax=barato", "precioMax"],
    ["una búsqueda de una letra", "?q=a", "q"],
    ["un límite demasiado alto", "?limite=500", "limite"],
    ["un parámetro mal escrito", "?prcioMax=1000", "prcioMax"],
  ])("400 ante %s, con el campo que falló", async (_caso, query, campo) => {
    const res = await platos.GET(pedir(`/api/v1/platos${query}`));
    expect(res.status).toBe(400);
    const { error } = await res.json();
    expect(error.codigo).toBe("datos_invalidos");
    expect(error.detalles.map((d: { campo: string }) => d.campo)).toContain(
      campo,
    );
  });

  it("500 genérico si la base falla, sin filtrar el error interno", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(datos.getCartas).mockRejectedValue(
      new Error("Supabase: connection refused at 10.0.0.3"),
    );
    const res = await platos.GET(pedir("/api/v1/platos"));
    expect(res.status).toBe(500);
    const texto = await res.text();
    expect(texto).toContain("error_interno");
    expect(texto).not.toContain("10.0.0.3");
  });
});

describe("GET /api/v1/platos/:slug", () => {
  it("200 con el plato", async () => {
    const res = await plato.GET(pedir(""), contexto("papas"));
    expect(res.status).toBe(200);
    expect((await res.json()).datos.nombre).toBe("Papas");
  });

  it("404 si no existe", async () => {
    const res = await plato.GET(pedir(""), contexto("no-existe"));
    expect(res.status).toBe(404);
    expect((await res.json()).error.codigo).toBe("no_encontrado");
  });

  it("400 si el slug no tiene formato de slug", async () => {
    const res = await plato.GET(pedir(""), contexto("DROP TABLE platos"));
    expect(res.status).toBe(400);
  });
});

describe("GET /api/v1/experiencias", () => {
  it("200 con la lista, sin cache (los cupos cambian)", async () => {
    const res = await experiencias.GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(await res.json()).toMatchObject({ total: 1 });
  });

  it("una experiencia: 200 si existe, 404 si no", async () => {
    const existe = await experiencia.GET(pedir(""), contexto("cena-para-dos"));
    expect(existe.status).toBe(200);
    expect((await existe.json()).datos.cupos).toBe(20);
    const falta = await experiencia.GET(pedir(""), contexto("viaje-a-paris"));
    expect(falta.status).toBe(404);
  });
});
