import { z } from "zod";
import {
  conErrores,
  errorDeBase,
  leerJson,
  noEncontrado,
  ok,
  validar,
} from "@/lib/api/respuestas";
import { exigirAdminApi } from "@/lib/auth";
import { ESTADOS_CONSULTA } from "@/lib/esquemas";

const cambioEstado = z.strictObject({ estado: z.enum(ESTADOS_CONSULTA) });

/** PATCH /api/v1/consultas/:id — el admin marca la consulta (contactada, descartada…). */
export const PATCH = conErrores(
  async (request: Request, ctx: RouteContext<"/api/v1/consultas/[id]">) => {
    const { db } = await exigirAdminApi();
    const id = validar(z.uuid(), (await ctx.params).id);
    const { estado } = validar(cambioEstado, await leerJson(request));
    const { data, error } = await db
      .from("consultas_eventos")
      .update({ estado })
      .eq("id", id)
      .select("id, estado")
      .maybeSingle();
    if (error) throw errorDeBase(error);
    if (!data) throw noEncontrado("La consulta");
    return ok({ datos: data });
  },
);
