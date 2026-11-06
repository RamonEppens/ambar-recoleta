import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  crearPreferencia,
  cuerpoPreferencia,
  firmaValida,
  obtenerPago,
} from "./mercadopago";

const SECRETO = "clave-del-webhook";
const firmar = (manifiesto: string, secreto = SECRETO) =>
  createHmac("sha256", secreto).update(manifiesto).digest("hex");

describe("firmaValida (x-signature de los webhooks)", () => {
  const ts = "1762354800";
  const v1 = firmar(`id:123456;request-id:req-1;ts:${ts};`);
  const base = {
    xSignature: `ts=${ts},v1=${v1}`,
    xRequestId: "req-1",
    dataId: "123456",
    secreto: SECRETO,
  };

  it("acepta un aviso firmado con la clave correcta", () => {
    expect(firmaValida(base)).toBe(true);
  });

  it("tolera espacios en el header", () => {
    expect(firmaValida({ ...base, xSignature: ` ts=${ts} , v1=${v1} ` })).toBe(
      true,
    );
  });

  it("rechaza si cambia cualquier dato firmado", () => {
    expect(firmaValida({ ...base, dataId: "999999" })).toBe(false);
    expect(firmaValida({ ...base, xRequestId: "otro" })).toBe(false);
    expect(firmaValida({ ...base, xSignature: `ts=1,v1=${v1}` })).toBe(false);
  });

  it("rechaza una firma hecha con otra clave", () => {
    const falsa = firmar(`id:123456;request-id:req-1;ts:${ts};`, "adivinada");
    expect(firmaValida({ ...base, xSignature: `ts=${ts},v1=${falsa}` })).toBe(
      false,
    );
  });

  it("rechaza headers ausentes o mal formados sin romperse", () => {
    expect(firmaValida({ ...base, xSignature: null })).toBe(false);
    expect(firmaValida({ ...base, xSignature: "basura" })).toBe(false);
    expect(firmaValida({ ...base, xSignature: `ts=${ts},v1=zz` })).toBe(false);
  });

  it("el id va en minúsculas en el texto firmado", () => {
    const firma = firmar(`id:abc123;request-id:req-1;ts:${ts};`);
    expect(
      firmaValida({
        ...base,
        dataId: "ABC123",
        xSignature: `ts=${ts},v1=${firma}`,
      }),
    ).toBe(true);
  });

  it("omite del texto firmado las partes que no llegan", () => {
    const firma = firmar(`id:123456;ts:${ts};`);
    expect(
      firmaValida({
        ...base,
        xRequestId: null,
        xSignature: `ts=${ts},v1=${firma}`,
      }),
    ).toBe(true);
  });
});

describe("preferencia de Checkout Pro", () => {
  const datos = {
    pedidoId: "6f1c0b6e-0000-4000-8000-000000000001",
    items: [
      {
        id: "i1",
        titulo: "Cena para dos",
        cantidad: 2,
        precioUnitario: 120000,
      },
    ],
    comprador: { nombre: "Ana", email: "ana@mail.com" },
    urlVuelta: "https://ambar.test/es/pedido/6f1c0b6e",
  };

  it("arma items, payer, back_urls y external_reference", () => {
    expect(cuerpoPreferencia(datos)).toEqual({
      items: [
        {
          id: "i1",
          title: "Cena para dos",
          quantity: 2,
          unit_price: 120000,
          currency_id: "ARS",
        },
      ],
      payer: { name: "Ana" }, // sin email: ver el comentario en mercadopago.ts
      back_urls: {
        success: datos.urlVuelta,
        pending: datos.urlVuelta,
        failure: datos.urlVuelta,
      },
      auto_return: "approved",
      external_reference: datos.pedidoId,
      statement_descriptor: "AMBAR RECOLETA",
    });
  });

  it("sin https (desarrollo local) no pide auto_return", () => {
    expect(
      cuerpoPreferencia({ ...datos, urlVuelta: "http://localhost:3000/x" }),
    ).not.toHaveProperty("auto_return");
  });

  describe("con la API (fetch simulado)", () => {
    beforeEach(() => vi.stubEnv("MP_ACCESS_TOKEN", "APP_USR-123"));
    afterEach(() => {
      vi.unstubAllEnvs();
      vi.unstubAllGlobals();
    });

    it("manda el token y una clave de idempotencia, y devuelve init_point", async () => {
      const fetchFalso = vi.fn().mockResolvedValue(
        Response.json({
          id: "pref-1",
          init_point: "https://mp/pagar",
          sandbox_init_point: "https://sandbox/pagar",
        }),
      );
      vi.stubGlobal("fetch", fetchFalso);
      expect(await crearPreferencia(datos)).toEqual({
        id: "pref-1",
        url: "https://mp/pagar",
      });
      const [url, opciones] = fetchFalso.mock.calls[0];
      expect(url).toBe("https://api.mercadopago.com/checkout/preferences");
      expect(opciones.headers).toMatchObject({
        Authorization: "Bearer APP_USR-123",
        "X-Idempotency-Key": datos.pedidoId,
      });
    });

    it("con credenciales TEST- usa el sandbox", async () => {
      vi.stubEnv("MP_ACCESS_TOKEN", "TEST-123");
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(
          Response.json({
            id: "p",
            init_point: "https://mp/pagar",
            sandbox_init_point: "https://sandbox/pagar",
          }),
        ),
      );
      expect((await crearPreferencia(datos)).url).toBe("https://sandbox/pagar");
    });

    it("si Mercado Pago responde error, lo informa (no inventa una URL)", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(new Response("invalid", { status: 400 })),
      );
      await expect(crearPreferencia(datos)).rejects.toThrow(/400/);
      await expect(obtenerPago("1")).rejects.toThrow(/400/);
    });

    it("un pago que no existe (404) devuelve null, no un error", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(new Response("not found", { status: 404 })),
      );
      expect(await obtenerPago("123456")).toBeNull();
    });
  });
});
