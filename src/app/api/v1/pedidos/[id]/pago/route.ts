import { z } from "zod";
import { conErrores, leerJson, ok, validar } from "@/lib/api/respuestas";
import { cobrarPedido, urlSitio } from "@/lib/checkout";

const cuerpo = z.strictObject({ idioma: z.enum(["es", "en"]) });

/**
 * POST /api/v1/pedidos/:id/pago — una URL de pago nueva para un pedido
 * pendiente. Lo usa el link de la seña, y sirve para reintentar un pago.
 */
export const POST = conErrores(
  async (request: Request, ctx: RouteContext<"/api/v1/pedidos/[id]/pago">) => {
    const id = validar(z.uuid(), (await ctx.params).id);
    const { idioma } = validar(cuerpo, await leerJson(request));
    const url = await cobrarPedido(id, { sitio: urlSitio(request), idioma });
    return ok({ datos: { url } });
  },
);
