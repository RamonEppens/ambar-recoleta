import { z } from "zod";
import { conErrores, noEncontrado, ok, validar } from "@/lib/api/respuestas";
import { clienteServicio } from "@/lib/supabase/servicio";

/**
 * GET /api/v1/pedidos/:id — el estado de un pedido, para la página de vuelta.
 * El id es un uuid imposible de adivinar: funciona como el link de un recibo.
 * Los códigos de regalo aparecen recién cuando el pago está confirmado.
 */
export const GET = conErrores(
  async (_request: Request, ctx: RouteContext<"/api/v1/pedidos/[id]">) => {
    const id = validar(z.uuid(), (await ctx.params).id);
    const { data, error } = await clienteServicio()
      .from("pedidos")
      .select(
        "id, tipo, estado, nombre, total, pedido_items (descripcion, cantidad, precio_unitario, codigo)",
      )
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(`Supabase: ${error.message}`);
    if (!data) throw noEncontrado("El pedido");
    return ok({
      datos: {
        id: data.id,
        tipo: data.tipo,
        estado: data.estado,
        nombre: data.nombre,
        total: data.total,
        items: data.pedido_items.map((i) => ({
          descripcion: i.descripcion,
          cantidad: i.cantidad,
          precioUnitario: i.precio_unitario,
          codigo: data.estado === "pagado" ? i.codigo : null,
        })),
      },
    });
  },
);
