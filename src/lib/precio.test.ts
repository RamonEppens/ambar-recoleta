import { describe, expect, it } from "vitest";
import { formatearPrecio } from "./precio";

// Intl usa un espacio que no corta (U+00A0) entre el símbolo y el número.
const normalizar = (texto: string) => texto.replace(/\s/g, " ");

describe("formatearPrecio", () => {
  it("convierte miles a pesos con formato argentino", () => {
    expect(normalizar(formatearPrecio(29, "es"))).toBe("$ 29.000");
  });

  it("en inglés aclara la moneda", () => {
    expect(normalizar(formatearPrecio(29, "en"))).toBe("ARS 29,000");
  });
});
