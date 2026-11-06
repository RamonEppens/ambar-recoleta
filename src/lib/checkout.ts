import "server-only";
import { ErrorApi } from "./api/respuestas";
import { crearPreferencia } from "./mercadopago";
import { clienteServicio } from "./supabase/servicio";

/** La URL pública del sitio, para las back_urls. En Vercel conviene fijarla con SITIO_URL. */
export const urlSitio = (request: Request) =>
  (process.env.SITIO_URL ?? new URL(request.url).origin).replace(/\/$/, "");

/**
 * Crea la preferencia de Mercado Pago para un pedido que ya existe y está
 * pendiente. Los items salen de la base (precio_unitario guardado al crear el
 * pedido), no del navegador. Devuelve la URL de Checkout Pro.
 */
export async function cobrarPedido(
  pedidoId: string,
  { sitio, idioma }: { sitio: string; idioma: "es" | "en" },
) {
  const db = clienteServicio();
  const { data: pedido, error } = await db
    .from("pedidos")
    .select(
      "id, estado, nombre, email, pedido_items (id, descripcion, cantidad, precio_unitario)",
    )
    .eq("id", pedidoId)
    .maybeSingle();
  if (error) throw new Error(`Supabase: ${error.message}`);
  if (!pedido) throw new ErrorApi(404, "no_encontrado", "El pedido no existe.");
  if (pedido.estado !== "pendiente")
    throw new ErrorApi(
      409,
      "pedido_cerrado",
      "Este pedido ya no se puede pagar.",
    );

  let preferencia;
  try {
    preferencia = await crearPreferencia({
      pedidoId: pedido.id,
      items: pedido.pedido_items.map((i) => ({
        id: i.id,
        titulo: i.descripcion,
        cantidad: i.cantidad,
        precioUnitario: i.precio_unitario,
      })),
      comprador: { nombre: pedido.nombre, email: pedido.email },
      urlVuelta: `${sitio}/${idioma}/pedido/${pedido.id}`,
    });
  } catch (e) {
    console.error("[checkout]", e);
    throw new ErrorApi(
      502,
      "pago_no_disponible",
      "Mercado Pago no respondió. Probá de nuevo en un rato.",
    );
  }

  await db
    .from("pedidos")
    .update({ mp_preference_id: preferencia.id })
    .eq("id", pedido.id);
  return preferencia.url;
}
