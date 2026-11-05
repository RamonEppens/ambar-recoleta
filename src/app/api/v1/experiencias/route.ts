import {
  conErrores,
  errorDeBase,
  leerJson,
  ok,
  validar,
} from "@/lib/api/respuestas";
import { exigirAdminApi } from "@/lib/auth";
import { getExperiencias } from "@/lib/datos";
import { esquemaExperiencia } from "@/lib/esquemas";
import { aFilaExperiencia } from "@/lib/mapear";
import { revalidarSitio } from "@/lib/revalidar";

/** GET /api/v1/experiencias — las experiencias para regalar que están a la venta. */
export const GET = conErrores(async () => {
  const datos = await getExperiencias();
  return ok({ datos, total: datos.length });
});

/** POST /api/v1/experiencias — crea una experiencia. Solo admin. */
export const POST = conErrores(async (request: Request) => {
  const { db } = await exigirAdminApi();
  const datos = validar(esquemaExperiencia, await leerJson(request));
  const { data, error } = await db
    .from("experiencias")
    .insert(aFilaExperiencia(datos))
    .select("slug")
    .single();
  if (error) throw errorDeBase(error);
  revalidarSitio();
  return ok({ datos: data }, { status: 201 });
});
