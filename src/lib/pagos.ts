import "server-only";
import { z } from "zod";
import { obtenerPago } from "./mercadopago";
import { clienteServicio } from "./supabase/servicio";

/*
 * Conciliación (clase 11): dado el id de un pago, se consulta a Mercado Pago
 * y se actualiza el pedido. La usan el webhook y la página de vuelta.
 * Es idempotente: procesar el mismo pago dos veces no cambia nada la segunda.
 */

export type Resultado =
  | "confirmado" // pagado ahora: cupos descontados y códigos generados
  | "ya_procesado" // el aviso llegó repetido
  | "pendiente" // MP todavía lo está procesando
  | "rechazado"
  | "reembolsado"
  | "sin_pedido" // la external_reference no es un pedido nuestro
  | "monto_distinto" // lo cobrado no coincide con el total: no se confirma
  | "sin_cupos"; // se pagó, pero mientras tanto se agotó: requiere devolución

const ESTADOS_FALLIDOS: Record<string, "rechazado" | "cancelado"> = {
  rejected: "rechazado",
  cancelled: "cancelado",
};

export async function procesarPago(
  paymentId: string,
  pedidoEsperado?: string,
): Promise<Resultado> {
  const pago = await obtenerPago(paymentId);
  if (!pago) return "sin_pedido";
  const pedidoId = z.uuid().safeParse(pago.external_reference);
  if (!pedidoId.success) return "sin_pedido";
  // La página de vuelta solo puede verificar SU pedido, no uno ajeno.
  if (pedidoEsperado && pedidoId.data !== pedidoEsperado) return "sin_pedido";

  const db = clienteServicio();
  const { data: pedido, error } = await db
    .from("pedidos")
    .select("id, total, estado")
    .eq("id", pedidoId.data)
    .maybeSingle();
  if (error) throw new Error(`Supabase: ${error.message}`);
  if (!pedido) return "sin_pedido";

  if (pago.status === "approved") {
    if (
      pago.currency_id !== "ARS" ||
      pago.transaction_amount !== pedido.total
    ) {
      console.error("[pagos] monto distinto", { paymentId, pedido: pedido.id });
      return "monto_distinto";
    }
    const { data: confirmado, error: e } = await db.rpc("confirmar_pago", {
      p_pedido: pedido.id,
      p_payment_id: String(pago.id),
    });
    if (e?.code === "23514") {
      // check (cupos >= 0): alguien compró los últimos cupos antes de que este
      // pago llegara. La función ya revirtió todo; el pedido se cancela y el
      // caso queda en el log para devolver el dinero desde Mercado Pago.
      await db
        .from("pedidos")
        .update({ estado: "cancelado", mp_payment_id: String(pago.id) })
        .eq("id", pedido.id)
        .eq("estado", "pendiente");
      console.error("[pagos] pagado sin cupos, devolver", { paymentId });
      return "sin_cupos";
    }
    if (e) throw new Error(`Supabase: ${e.message}`);
    return confirmado ? "confirmado" : "ya_procesado";
  }

  const fallido = ESTADOS_FALLIDOS[pago.status];
  if (fallido) {
    await actualizar(db, pedido.id, "pendiente", fallido, pago.id);
    return "rechazado";
  }
  if (pago.status === "refunded" || pago.status === "charged_back") {
    await actualizar(db, pedido.id, "pagado", "reembolsado", pago.id);
    return "reembolsado";
  }
  return "pendiente"; // pending, in_process, authorized
}

/** Cambia el estado solo si el pedido está en el estado esperado (nunca "despaga" uno pagado). */
async function actualizar(
  db: ReturnType<typeof clienteServicio>,
  id: string,
  desde: string,
  hacia: string,
  paymentId: number,
) {
  const { error } = await db
    .from("pedidos")
    .update({ estado: hacia, mp_payment_id: String(paymentId) })
    .eq("id", id)
    .eq("estado", desde);
  if (error) throw new Error(`Supabase: ${error.message}`);
}
