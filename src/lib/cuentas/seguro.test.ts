import { describe, expect, it } from "vitest";
import { rutaSegura } from "./seguro";

describe("rutaSegura (a dónde volver después de ingresar)", () => {
  it("acepta rutas internas del sitio", () => {
    expect(rutaSegura("/es/carrito", "/es/cuenta")).toBe("/es/carrito");
    expect(rutaSegura("/en/experiencias/cena-para-dos", "/x")).toBe(
      "/en/experiencias/cena-para-dos",
    );
  });

  it("rechaza otros sitios y rutas raras (open redirect)", () => {
    for (const malo of [
      "https://estafa.com",
      "//estafa.com",
      "/\\estafa.com",
      "javascript:alert(1)",
      "/admin",
      "",
      null,
      42,
    ])
      expect(rutaSegura(malo, "/es/cuenta")).toBe("/es/cuenta");
  });
});
