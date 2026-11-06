// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  agregar,
  cambiarCantidad,
  leerCarrito,
  quitar,
  suscribirCarrito,
  vaciar,
} from "./carrito";

beforeEach(() => {
  localStorage.clear();
  vaciar();
});

describe("carrito", () => {
  it("agrega, suma al repetir y no pasa de 10 por experiencia", () => {
    agregar("cena-para-dos", 2);
    agregar("cena-para-dos", 3);
    agregar("ronda-de-la-casa", 1);
    expect(leerCarrito()).toEqual([
      { slug: "cena-para-dos", cantidad: 5 },
      { slug: "ronda-de-la-casa", cantidad: 1 },
    ]);
    agregar("cena-para-dos", 50);
    expect(leerCarrito()[0].cantidad).toBe(10);
  });

  it("cambiar a 0 o quitar lo saca del carrito", () => {
    agregar("cena-para-dos", 2);
    agregar("ronda-de-la-casa", 1);
    cambiarCantidad("cena-para-dos", 0);
    quitar("ronda-de-la-casa");
    expect(leerCarrito()).toEqual([]);
  });

  it("devuelve el mismo array mientras no cambie (lo necesita useSyncExternalStore)", () => {
    agregar("cena-para-dos", 1);
    expect(leerCarrito()).toBe(leerCarrito());
  });

  it("ignora datos rotos o manipulados en localStorage", () => {
    localStorage.setItem("ambar-carrito", "{no es json");
    expect(leerCarrito()).toEqual([]);
    localStorage.setItem(
      "ambar-carrito",
      JSON.stringify([
        { slug: "ok", cantidad: 1 },
        { slug: "negativo", cantidad: -3 },
        { cantidad: 2 },
      ]),
    );
    expect(leerCarrito()).toEqual([{ slug: "ok", cantidad: 1 }]);
  });

  it("avisa a los componentes suscriptos en cada cambio", () => {
    const avisar = vi.fn();
    const desuscribir = suscribirCarrito(avisar);
    agregar("cena-para-dos", 1);
    vaciar();
    expect(avisar).toHaveBeenCalledTimes(2);
    desuscribir();
    agregar("cena-para-dos", 1);
    expect(avisar).toHaveBeenCalledTimes(2);
  });
});
