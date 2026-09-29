import { describe, expect, it } from "vitest";
import { linkWhatsApp } from "./enlaces";

describe("linkWhatsApp", () => {
  it("codifica el mensaje para que llegue completo, con acentos y signos", () => {
    const link = linkWhatsApp("¡Hola! ¿Hacen eventos? 20 personas & más");
    expect(link.startsWith("https://wa.me/5491123356470?text=")).toBe(true);
    const texto = new URL(link).searchParams.get("text");
    expect(texto).toBe("¡Hola! ¿Hacen eventos? 20 personas & más");
  });
});
