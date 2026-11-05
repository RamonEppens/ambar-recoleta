import { describe, expect, it } from "vitest";
import { armarCartas, armarSemana, buscarPlato } from "./mapear";

describe("armarSemana", () => {
  it("convierte las horas de Postgres y deja null los días cerrados", () => {
    const semana = armarSemana([
      {
        dia: 0,
        abierto: false,
        abre: null,
        aperitivo_hasta: null,
        cocina_hasta: null,
        dj_desde: null,
        cierra: null,
      },
      {
        dia: 5,
        abierto: true,
        abre: "17:00:00",
        aperitivo_hasta: "20:00:00",
        cocina_hasta: "23:30:00",
        dj_desde: "23:00:00",
        cierra: "02:00:00",
      },
      {
        dia: 2,
        abierto: true,
        abre: "17:00:00",
        aperitivo_hasta: "20:00:00",
        cocina_hasta: "23:30:00",
        dj_desde: null,
        cierra: "01:00:00",
      },
    ]);
    expect(semana).toHaveLength(7);
    expect(semana[0]).toBeNull();
    expect(semana[1]).toBeNull(); // sin fila = cerrado
    expect(semana[5]).toEqual({
      abre: "17:00",
      aperitivoHasta: "20:00",
      cocinaHasta: "23:30",
      djDesde: "23:00",
      cierra: "02:00",
    });
    expect(semana[2]).not.toHaveProperty("djDesde");
  });
});

describe("armarCartas", () => {
  const cartas = armarCartas(
    [
      { id: "tragos", titulo_es: "Tragos", titulo_en: "Drinks", orden: 2 },
      { id: "cena", titulo_es: "Cena", titulo_en: "Dinner", orden: 1 },
    ],
    [
      {
        id: "s2",
        carta_id: "cena",
        slug: "grandes",
        titulo_es: "Grandes",
        titulo_en: "Large",
        orden: 1,
      },
      {
        id: "s1",
        carta_id: "cena",
        slug: "chicos",
        titulo_es: "Chicos",
        titulo_en: "Small",
        orden: 0,
      },
      {
        id: "s3",
        carta_id: "tragos",
        slug: "martinis",
        titulo_es: "Martinis",
        titulo_en: "Martinis",
        orden: 0,
      },
    ],
    [
      {
        seccion_id: "s1",
        slug: "papas",
        nombre: "Papas",
        descripcion_es: "Fritas.",
        descripcion_en: "Fries.",
        precio: 14000,
        orden: 1,
      },
      {
        seccion_id: "s1",
        slug: "chipa",
        nombre: "Chipá",
        descripcion_es: "Frito.",
        descripcion_en: "Fried.",
        precio: 15000,
        orden: 0,
      },
      {
        seccion_id: "s3",
        slug: "dirty",
        nombre: "Dirty",
        descripcion_es: "Gin.",
        descripcion_en: "Gin.",
        precio: null,
        orden: 0,
      },
    ],
  );

  it("anida y ordena cartas, secciones y platos", () => {
    expect(cartas.map((c) => c.id)).toEqual(["cena", "tragos"]);
    expect(cartas[0].secciones.map((s) => s.id)).toEqual(["chicos", "grandes"]);
    expect(cartas[0].secciones[0].platos.map((p) => p.id)).toEqual([
      "chipa",
      "papas",
    ]);
    expect(cartas[0].secciones[1].platos).toEqual([]);
  });

  it("busca platos por slug en todas las cartas", () => {
    expect(buscarPlato(cartas, "dirty")?.nombre).toBe("Dirty");
    expect(buscarPlato(cartas, "no-existe")).toBeNull();
  });
});
