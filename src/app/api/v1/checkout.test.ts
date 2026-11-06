/**
 * Tests del checkout (E6): crear el pedido, el webhook de Mercado Pago y la
 * conciliación del pago. Mercado Pago y la base se reemplazan por dobles:
 * se prueba qué hace NUESTRO código en cada caso, incluidos los raros
 * (aviso repetido, monto distinto, firma falsa, stock agotado, MP caído).
 */
import { createHmac } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Pago } from "@/lib/mercadopago";
import { baseSecuencia } from "@/test/dobles";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/servicio", () => ({ clienteServicio: vi.fn() }));
vi.mock("@/lib/mercadopago", async (original) => ({
  ...(await original<typeof import("@/lib/mercadopago")>()),
  obtenerPago: vi.fn(),
  crearPreferencia: vi.fn(),
}));

const { clienteServicio } = await import("@/lib/supabase/servicio");
const { obtenerPago, crearPreferencia } = await import("@/lib/mercadopago");
const webhook = await import("./webhooks/mercadopago/route");
const pedidos = await import("./pedidos/route");
const verificar = await import("./pedidos/[id]/verificar/route");

const PEDIDO = "6f1c0b6e-0000-4000-8000-000000000001";
const SECRETO = "secreto-webhook";

function usarBase(resultados: Parameters<typeof baseSecuencia>[0]) {
  const base = baseSecuencia(resultados);
  vi.mocked(clienteServicio).mockReturnValue(
    base.db as unknown as ReturnType<typeof clienteServicio>,
  );
  return base.consultas;
}

const pago = (cambios: Partial<Pago> = {}): Pago => ({
  id: 555,
  status: "approved",
  external_reference: PEDIDO,
  transaction_amount: 240000,
  currency_id: "ARS",
  ...cambios,
});
const pedidoEnBase = {
  data: { id: PEDIDO, total: 240000, estado: "pendiente" },
  error: null,
};

/** Un aviso como el que manda Mercado Pago, firmado (o no) con el secreto. */
function aviso({
  dataId = "555",
  tipo = "payment",
  secreto = SECRETO,
}: { dataId?: string; tipo?: string; secreto?: string } = {}) {
  const ts = "1762354800";
  const firma = createHmac("sha256", secreto)
    .update(`id:${dataId};request-id:req-9;ts:${ts};`)
    .digest("hex");
  return new Request(
    `https://ambar.test/api/v1/webhooks/mercadopago?data.id=${dataId}&type=${tipo}`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-signature": `ts=${ts},v1=${firma}`,
        "x-request-id": "req-9",
      },
      body: JSON.stringify({
        type: tipo,
        action: "payment.updated",
        data: { id: dataId },
      }),
    },
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("MP_WEBHOOK_SECRET", SECRETO);
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "info").mockImplementation(() => {});
});

describe("webhook de Mercado Pago", () => {
  it("401 con una firma falsa: no consulta nada ni toca la base", async () => {
    const res = await webhook.POST(aviso({ secreto: "inventado" }));
    expect(res.status).toBe(401);
    expect(obtenerPago).not.toHaveBeenCalled();
    expect(clienteServicio).not.toHaveBeenCalled();
  });

  it("200 sin hacer nada si el aviso no es de un pago", async () => {
    const res = await webhook.POST(aviso({ tipo: "merchant_order" }));
    expect(res.status).toBe(200);
    expect(obtenerPago).not.toHaveBeenCalled();
  });

  it("pago aprobado: consulta el pago real y confirma el pedido", async () => {
    vi.mocked(obtenerPago).mockResolvedValue(pago());
    const consultas = usarBase([pedidoEnBase, { data: true, error: null }]);
    const res = await webhook.POST(aviso());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ resultado: "confirmado" });
    expect(obtenerPago).toHaveBeenCalledWith("555");
    expect(consultas[1][0]).toEqual([
      "rpc",
      ["confirmar_pago", { p_pedido: PEDIDO, p_payment_id: "555" }],
    ]);
  });

  it("aviso repetido: confirmar_pago devuelve false y responde 200 igual", async () => {
    vi.mocked(obtenerPago).mockResolvedValue(pago());
    usarBase([
      { data: { ...pedidoEnBase.data, estado: "pagado" }, error: null },
      { data: false, error: null },
    ]);
    const res = await webhook.POST(aviso());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ resultado: "ya_procesado" });
  });

  it("monto distinto al total: NO confirma", async () => {
    vi.mocked(obtenerPago).mockResolvedValue(pago({ transaction_amount: 1 }));
    const consultas = usarBase([pedidoEnBase]);
    const res = await webhook.POST(aviso());
    expect(await res.json()).toEqual({ resultado: "monto_distinto" });
    expect(consultas).toHaveLength(1); // solo leyó el pedido
  });

  it("pago rechazado: marca el pedido, solo si seguía pendiente", async () => {
    vi.mocked(obtenerPago).mockResolvedValue(pago({ status: "rejected" }));
    const consultas = usarBase([pedidoEnBase, { data: null, error: null }]);
    const res = await webhook.POST(aviso());
    expect(await res.json()).toEqual({ resultado: "rechazado" });
    expect(consultas[1]).toEqual(
      expect.arrayContaining([
        ["update", [{ estado: "rechazado", mp_payment_id: "555" }]],
        ["eq", ["estado", "pendiente"]],
      ]),
    );
  });

  it("pago reembolsado: pasa de pagado a reembolsado", async () => {
    vi.mocked(obtenerPago).mockResolvedValue(pago({ status: "refunded" }));
    const consultas = usarBase([pedidoEnBase, { data: null, error: null }]);
    expect(await (await webhook.POST(aviso())).json()).toEqual({
      resultado: "reembolsado",
    });
    expect(consultas[1]).toContainEqual(["eq", ["estado", "pagado"]]);
  });

  it("pago en proceso: no cambia nada", async () => {
    vi.mocked(obtenerPago).mockResolvedValue(pago({ status: "in_process" }));
    const consultas = usarBase([pedidoEnBase]);
    expect(await (await webhook.POST(aviso())).json()).toEqual({
      resultado: "pendiente",
    });
    expect(consultas).toHaveLength(1);
  });

  it("pagado sin cupos (se agotaron mientras pagaba): cancela y lo deja en el log", async () => {
    vi.mocked(obtenerPago).mockResolvedValue(pago());
    const consultas = usarBase([
      pedidoEnBase,
      { data: null, error: { code: "23514", message: "cupos_check" } },
      { data: null, error: null },
    ]);
    expect(await (await webhook.POST(aviso())).json()).toEqual({
      resultado: "sin_cupos",
    });
    expect(consultas[2]).toContainEqual([
      "update",
      [{ estado: "cancelado", mp_payment_id: "555" }],
    ]);
    expect(console.error).toHaveBeenCalled();
  });

  it("external_reference ajena: 200 sin tocar nada (no tiene sentido reintentar)", async () => {
    vi.mocked(obtenerPago).mockResolvedValue(
      pago({ external_reference: "otra-cosa" }),
    );
    const res = await webhook.POST(aviso());
    expect(await res.json()).toEqual({ resultado: "sin_pedido" });
    expect(clienteServicio).not.toHaveBeenCalled();
  });

  it("pago inexistente (la notificación simulada del panel): 200 sin tocar nada", async () => {
    vi.mocked(obtenerPago).mockResolvedValue(null);
    const res = await webhook.POST(aviso({ dataId: "123456" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ resultado: "sin_pedido" });
    expect(clienteServicio).not.toHaveBeenCalled();
  });

  it("500 si Mercado Pago no responde: así reintenta más tarde", async () => {
    vi.mocked(obtenerPago).mockRejectedValue(new Error("timeout"));
    expect((await webhook.POST(aviso())).status).toBe(500);
  });

  it("500 si falta el secreto del webhook (error de configuración)", async () => {
    vi.stubEnv("MP_WEBHOOK_SECRET", "");
    expect((await webhook.POST(aviso())).status).toBe(500);
  });
});

describe("POST /api/v1/pedidos", () => {
  const compra = {
    nombre: "Ana",
    email: "ana@mail.com",
    items: [{ slug: "cena-para-dos", cantidad: 2 }],
    idioma: "es",
  };
  const enviar = (cuerpo: unknown) =>
    new Request("https://ambar.test/api/v1/pedidos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(cuerpo),
    });

  it("201: crea el pedido en la base y devuelve la URL de Mercado Pago", async () => {
    const consultas = usarBase([
      { data: PEDIDO, error: null },
      {
        data: {
          id: PEDIDO,
          estado: "pendiente",
          nombre: "Ana",
          email: "ana@mail.com",
          pedido_items: [
            {
              id: "i1",
              descripcion: "Cena para dos",
              cantidad: 2,
              precio_unitario: 120000,
            },
          ],
        },
        error: null,
      },
      { data: null, error: null },
    ]);
    vi.mocked(crearPreferencia).mockResolvedValue({
      id: "pref-1",
      url: "https://mp/pagar",
    });
    const res = await pedidos.POST(enviar(compra));
    expect(res.status).toBe(201);
    expect((await res.json()).datos).toEqual({
      id: PEDIDO,
      url: "https://mp/pagar",
    });
    // A la base solo van QUÉ y CUÁNTO; el precio de MP sale de la base.
    expect(consultas[0][0]).toEqual([
      "rpc",
      [
        "crear_pedido",
        { p_nombre: "Ana", p_email: "ana@mail.com", p_items: compra.items },
      ],
    ]);
    expect(vi.mocked(crearPreferencia).mock.calls[0][0]).toMatchObject({
      pedidoId: PEDIDO,
      items: [{ titulo: "Cena para dos", cantidad: 2, precioUnitario: 120000 }],
      urlVuelta: `https://ambar.test/es/pedido/${PEDIDO}`,
    });
    expect(consultas[2]).toContainEqual([
      "update",
      [{ mp_preference_id: "pref-1" }],
    ]);
  });

  it("400 si el carrito intenta mandar precios, o está vacío", async () => {
    usarBase([]);
    const conPrecio = await pedidos.POST(
      enviar({
        ...compra,
        items: [{ slug: "cena-para-dos", cantidad: 1, precio: 1 }],
      }),
    );
    expect(conPrecio.status).toBe(400);
    const vacio = await pedidos.POST(enviar({ ...compra, items: [] }));
    expect((await vacio.json()).error.detalles[0]).toEqual({
      campo: "items",
      mensaje: "carrito_vacio",
    });
    expect(clienteServicio).not.toHaveBeenCalled();
  });

  it("409 si no quedan cupos", async () => {
    usarBase([
      {
        data: null,
        error: { code: "P0001", message: "sin_cupos: cena-para-dos" },
      },
    ]);
    const res = await pedidos.POST(enviar(compra));
    expect(res.status).toBe(409);
    expect((await res.json()).error.codigo).toBe("sin_cupos");
    expect(crearPreferencia).not.toHaveBeenCalled();
  });

  it("502 si Mercado Pago falla al crear la preferencia", async () => {
    usarBase([
      { data: PEDIDO, error: null },
      {
        data: {
          id: PEDIDO,
          estado: "pendiente",
          nombre: "A",
          email: "a@a.com",
          pedido_items: [],
        },
        error: null,
      },
    ]);
    vi.mocked(crearPreferencia).mockRejectedValue(new Error("MP caído"));
    const res = await pedidos.POST(enviar(compra));
    expect(res.status).toBe(502);
    expect((await res.json()).error.codigo).toBe("pago_no_disponible");
  });
});

describe("POST /api/v1/pedidos/:id/verificar (página de vuelta)", () => {
  const contexto = (id: string) => ({ params: Promise.resolve({ id }) });
  const enviar = (cuerpo: unknown) =>
    new Request("https://ambar.test/x", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(cuerpo),
    });

  it("verifica contra Mercado Pago y confirma, igual que el webhook", async () => {
    vi.mocked(obtenerPago).mockResolvedValue(pago());
    usarBase([pedidoEnBase, { data: true, error: null }]);
    const res = await verificar.POST(
      enviar({ paymentId: "555" }),
      contexto(PEDIDO),
    );
    expect((await res.json()).datos.resultado).toBe("confirmado");
  });

  it("no deja usar el pago de OTRO pedido para marcar este", async () => {
    vi.mocked(obtenerPago).mockResolvedValue(pago());
    const otro = "6f1c0b6e-0000-4000-8000-000000000999";
    const res = await verificar.POST(
      enviar({ paymentId: "555" }),
      contexto(otro),
    );
    expect((await res.json()).datos.resultado).toBe("sin_pedido");
    expect(clienteServicio).not.toHaveBeenCalled();
  });

  it("400 si el id del pago no es numérico", async () => {
    const res = await verificar.POST(
      enviar({ paymentId: "../../admin" }),
      contexto(PEDIDO),
    );
    expect(res.status).toBe(400);
  });
});
