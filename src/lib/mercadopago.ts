import { createHmac, timingSafeEqual } from "node:crypto";

/*
 * Integración con Mercado Pago (Checkout Pro), clase 11.
 * Se usa la API REST directamente con fetch (sin SDK): son dos llamadas y así
 * se ve exactamente qué se manda y qué vuelve.
 *
 *   1. crearPreferencia: el servidor describe el cobro (items, payer,
 *      back_urls, external_reference) y Mercado Pago devuelve la URL de pago.
 *   2. obtenerPago: ante un aviso (webhook) se consulta el pago real a la API;
 *      nunca se confía en lo que dice el aviso ni el navegador.
 */

// Configurable solo para los tests de punta a punta (un Mercado Pago simulado).
const API = process.env.MP_API_URL ?? "https://api.mercadopago.com";

function token() {
  const t = process.env.MP_ACCESS_TOKEN;
  if (!t) throw new Error("Falta MP_ACCESS_TOKEN (ver README).");
  return t;
}

export type ItemCobro = {
  id: string;
  titulo: string;
  cantidad: number;
  precioUnitario: number; // pesos
};

export type DatosPreferencia = {
  pedidoId: string;
  items: ItemCobro[];
  comprador: { nombre: string; email: string };
  /** Adónde vuelve la persona después de pagar: /es/pedido/<id>. */
  urlVuelta: string;
};

/** El cuerpo JSON de la preferencia. Función pura: se testea sin red. */
export function cuerpoPreferencia(d: DatosPreferencia) {
  return {
    items: d.items.map((i) => ({
      id: i.id,
      title: i.titulo,
      quantity: i.cantidad,
      unit_price: i.precioUnitario,
      currency_id: "ARS",
    })),
    // Solo el nombre. El email NO se manda: si es de una persona real y el
    // vendedor es una cuenta de prueba (o al revés), Mercado Pago rechaza el
    // pago ("una de las partes es de prueba"). El email queda en nuestro pedido.
    payer: { name: d.comprador.nombre },
    // Las tres vuelven a la misma página, que consulta el estado real del pedido.
    back_urls: {
      success: d.urlVuelta,
      pending: d.urlVuelta,
      failure: d.urlVuelta,
    },
    // auto_return solo funciona con URLs https (en local, http, se omite).
    ...(d.urlVuelta.startsWith("https://") ? { auto_return: "approved" } : {}),
    // El puente entre el cobro y nuestra base: vuelve en el pago y en el webhook.
    external_reference: d.pedidoId,
    statement_descriptor: "AMBAR RECOLETA",
  };
}

/** Crea la preferencia y devuelve su id y la URL de Checkout Pro. */
export async function crearPreferencia(d: DatosPreferencia) {
  const respuesta = await fetch(`${API}/checkout/preferences`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token()}`,
      "Content-Type": "application/json",
      // Si el pedido se reintenta, Mercado Pago no crea dos preferencias.
      "X-Idempotency-Key": d.pedidoId,
    },
    body: JSON.stringify(cuerpoPreferencia(d)),
  });
  if (!respuesta.ok) {
    throw new Error(
      `Mercado Pago (preferencia): ${respuesta.status} ${await respuesta.text()}`,
    );
  }
  const p = (await respuesta.json()) as {
    id: string;
    init_point: string;
    sandbox_init_point?: string;
  };
  // Con credenciales "TEST-" se paga en el sandbox; con las de una cuenta de
  // prueba (APP_USR-), en init_point, como indica Mercado Pago.
  const url =
    token().startsWith("TEST-") && p.sandbox_init_point
      ? p.sandbox_init_point
      : p.init_point;
  return { id: p.id, url };
}

export type Pago = {
  id: number;
  status: string; // approved | pending | in_process | rejected | cancelled | refunded | charged_back
  external_reference: string | null;
  transaction_amount: number;
  currency_id: string;
};

/** GET /v1/payments/:id — el estado verdadero de un pago. `null` si no existe. */
export async function obtenerPago(id: string): Promise<Pago | null> {
  const respuesta = await fetch(
    `${API}/v1/payments/${encodeURIComponent(id)}`,
    {
      headers: { Authorization: `Bearer ${token()}` },
      cache: "no-store",
    },
  );
  // 404: el pago no existe (por ejemplo, la "notificación simulada" del panel).
  if (respuesta.status === 404) return null;
  if (!respuesta.ok) {
    throw new Error(`Mercado Pago (pago ${id}): ${respuesta.status}`);
  }
  return respuesta.json();
}

/**
 * Valida la firma de un webhook (header x-signature: "ts=...,v1=...").
 * Mercado Pago firma con HMAC-SHA256, usando la clave secreta del webhook,
 * el texto "id:<data.id>;request-id:<x-request-id>;ts:<ts>;".
 * Si alguien inventa un aviso, no conoce la clave y la firma no coincide.
 */
export function firmaValida({
  xSignature,
  xRequestId,
  dataId,
  secreto,
}: {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string | null;
  secreto: string;
}) {
  if (!xSignature) return false;
  const partes = Object.fromEntries(
    xSignature.split(",").map((parte) => {
      const [clave, ...valor] = parte.trim().split("=");
      return [clave, valor.join("=")];
    }),
  );
  const { ts, v1 } = partes;
  if (!ts || !v1 || !/^[0-9a-f]{64}$/i.test(v1)) return false;

  // Cada parte va solo si existe; el id, en minúsculas (así lo firma MP).
  const manifiesto =
    (dataId ? `id:${dataId.toLowerCase()};` : "") +
    (xRequestId ? `request-id:${xRequestId};` : "") +
    `ts:${ts};`;
  const esperado = createHmac("sha256", secreto).update(manifiesto).digest();
  // Comparación en tiempo constante: no deja adivinar la firma midiendo cuánto tarda.
  return timingSafeEqual(esperado, Buffer.from(v1, "hex"));
}
