import { describe, expect, it } from "vitest";
import { filtrarPlatos, normalizar } from "./catalogo";
import type { Carta } from "./tipos";

const plato = (id: string, nombre: string, precio: number | null, en = "") => ({
  id,
  nombre,
  descripcion: { es: "", en },
  precio,
});

const cartas: Carta[] = [
  {
    id: "cena",
    titulo: { es: "Cena", en: "Dinner" },
    secciones: [
      {
        id: "chicos",
        titulo: { es: "Chicos", en: "Small" },
        platos: [
          plato("tartar", "Tartar de Ciervo", 29000, "Venison tartare"),
          plato("papas", "Papas Ámbar", 12000),
        ],
      },
    ],
  },
  {
    id: "tragos",
    titulo: { es: "Tragos", en: "Drinks" },
    secciones: [
      {
        id: "martinis",
        titulo: { es: "Martinis", en: "Martinis" },
        platos: [plato("dry", "Dry Martini", null)],
      },
    ],
  },
];

const ids = (lista: { id: string }[]) => lista.map((p) => p.id);

describe("normalizar", () => {
  it("ignora mayúsculas, tildes y espacios de los bordes", () => {
    expect(normalizar("  Ámbar ")).toBe("ambar");
  });
});

describe("filtrarPlatos", () => {
  it("sin filtros devuelve todos, con su carta y sección", () => {
    const todos = filtrarPlatos(cartas, {});
    expect(ids(todos)).toEqual(["tartar", "papas", "dry"]);
    expect(todos[2]).toMatchObject({ carta: "tragos", seccion: "martinis" });
  });

  it("filtra por carta", () => {
    expect(ids(filtrarPlatos(cartas, { carta: "tragos" }))).toEqual(["dry"]);
  });

  it("busca sin tildes, en cualquier orden y en inglés", () => {
    expect(ids(filtrarPlatos(cartas, { q: "ambar" }))).toEqual(["papas"]);
    expect(ids(filtrarPlatos(cartas, { q: "ciervo tartar" }))).toEqual([
      "tartar",
    ]);
    expect(ids(filtrarPlatos(cartas, { q: "venison" }))).toEqual(["tartar"]);
  });

  it("exige todas las palabras", () => {
    expect(filtrarPlatos(cartas, { q: "tartar martini" })).toEqual([]);
  });

  it("el precio máximo incluye el límite y deja afuera lo que no tiene precio", () => {
    expect(ids(filtrarPlatos(cartas, { precioMax: 29000 }))).toEqual([
      "tartar",
      "papas",
    ]);
    expect(ids(filtrarPlatos(cartas, { precioMax: 12000 }))).toEqual(["papas"]);
  });

  it("combina filtros", () => {
    expect(filtrarPlatos(cartas, { carta: "tragos", q: "tartar" })).toEqual([]);
  });
});
