import { conErrores, ok } from "@/lib/api/respuestas";
import { getExperiencias } from "@/lib/datos";

/** GET /api/v1/experiencias — las experiencias para regalar que están a la venta. */
export const GET = conErrores(async () => {
  const datos = await getExperiencias();
  return ok({ datos, total: datos.length });
});
