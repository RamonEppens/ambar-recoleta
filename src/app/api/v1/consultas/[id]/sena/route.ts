import { z } from "zod";
import {
  ErrorApi,
  conErrores,
  errorDeBase,
  leerJson,
  ok,
  validar,
} from "@/lib/api/respuestas";
import { exigirAdminApi } from "@/lib/auth";

const cuerpo = z.strictObject({
  monto: z
    .number({ error: "Tiene que ser un número." })
    .int("En pesos, sin centavos.")
    .min(1000, "Mínimo $ 1.000.")
    .max(10_000_000, "Revisá el monto: parece demasiado alto."),
});

/**
 * POST /api/v1/consultas/:id/sena — el admin pide la seña de un evento.
 * Crea un pedido de tipo "sena" y devuelve el link que se le manda al cliente.
 * Corre con la sesión del admin: la función crear_sena() vuelve a exigir el rol.
 */
export const POST = conErrores(
  async (
    request: Request,
    ctx: RouteContext<"/api/v1/consultas/[id]/sena">,
  ) => {
    const { db } = await exigirAdminApi();
    const id = validar(z.uuid(), (await ctx.params).id);
    const { monto } = validar(cuerpo, await leerJson(request));
    const { data: pedidoId, error } = await db.rpc("crear_sena", {
      p_consulta: id,
      p_monto: monto,
    });
    if (error) {
      const codigo = error.message.split(":")[0];
      if (codigo === "consulta_inexistente")
        throw new ErrorApi(404, "no_encontrado", "La consulta no existe.");
      if (codigo === "consulta_cerrada")
        throw new ErrorApi(
          409,
          codigo,
          "La consulta ya está señada o descartada.",
        );
      throw errorDeBase(error);
    }
    return ok(
      { datos: { pedidoId, link: `/es/sena/${pedidoId}` } },
      { status: 201 },
    );
  },
);
