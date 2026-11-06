import { firmaValida } from "@/lib/mercadopago";
import { procesarPago } from "@/lib/pagos";

/**
 * POST /api/v1/webhooks/mercadopago — Mercado Pago avisa que un pago cambió.
 *
 *   1. Validar la firma (x-signature) con la clave secreta del webhook → si no, 401.
 *   2. Si no es un aviso de pago, responder 200 y listo.
 *   3. Consultar el pago real a la API y conciliar el pedido (procesarPago).
 *   4. Responder 200. Si algo falla de nuestro lado, 500: Mercado Pago reintenta.
 *
 * No usa `conErrores` a propósito: acá el cliente es Mercado Pago, que solo
 * mira el código HTTP para decidir si reintenta.
 */
export async function POST(request: Request) {
  const url = new URL(request.url);
  const cuerpo = (await request.json().catch(() => ({}))) as {
    type?: string;
    data?: { id?: string | number };
  };
  const tipo = url.searchParams.get("type") ?? cuerpo.type;
  const dataId =
    url.searchParams.get("data.id") ??
    (cuerpo.data?.id === undefined ? null : String(cuerpo.data.id));

  const secreto = process.env.MP_WEBHOOK_SECRET;
  if (!secreto) {
    console.error("[webhook] falta MP_WEBHOOK_SECRET");
    return new Response(null, { status: 500 });
  }
  const firmado = firmaValida({
    xSignature: request.headers.get("x-signature"),
    xRequestId: request.headers.get("x-request-id"),
    dataId: url.searchParams.get("data.id"),
    secreto,
  });
  if (!firmado) return new Response(null, { status: 401 });

  if (tipo !== "payment" || !dataId) return new Response(null, { status: 200 });

  try {
    const resultado = await procesarPago(dataId);
    console.info("[webhook] pago", dataId, resultado);
    return Response.json({ resultado });
  } catch (error) {
    console.error("[webhook] error procesando", dataId, error);
    return new Response(null, { status: 500 });
  }
}
