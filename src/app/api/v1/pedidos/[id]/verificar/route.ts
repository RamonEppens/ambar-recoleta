import { z } from "zod";
import { conErrores, leerJson, ok, validar } from "@/lib/api/respuestas";
import { procesarPago } from "@/lib/pagos";

const cuerpo = z.strictObject({
  paymentId: z.string().regex(/^\d{1,20}$/),
});

/**
 * POST /api/v1/pedidos/:id/verificar — la página de vuelta pide revisar el pago
 * por si el webhook todavía no llegó. No confía en lo que dice el navegador:
 * con el id del pago, el servidor le pregunta el estado real a Mercado Pago,
 * exactamente igual que el webhook.
 */
export const POST = conErrores(
  async (
    request: Request,
    ctx: RouteContext<"/api/v1/pedidos/[id]/verificar">,
  ) => {
    const id = validar(z.uuid(), (await ctx.params).id);
    const { paymentId } = validar(cuerpo, await leerJson(request));
    const resultado = await procesarPago(paymentId, id);
    return ok({ datos: { resultado } });
  },
);
