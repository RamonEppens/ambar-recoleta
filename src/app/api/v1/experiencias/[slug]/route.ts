import { slug as esquemaSlug } from "@/lib/api/esquemas";
import { conErrores, noEncontrado, ok, validar } from "@/lib/api/respuestas";
import { getExperiencia } from "@/lib/datos";

/**
 * GET /api/v1/experiencias/:slug — una experiencia, con los cupos al momento.
 * No se cachea: la página de la experiencia la consulta para mostrar
 * cuántos cupos quedan de verdad, aunque la página en sí sea estática.
 */
export const GET = conErrores(
  async (
    _request: Request,
    ctx: RouteContext<"/api/v1/experiencias/[slug]">,
  ) => {
    const slug = validar(esquemaSlug, (await ctx.params).slug);
    const experiencia = await getExperiencia(slug);
    if (!experiencia) throw noEncontrado("La experiencia");
    return ok({ datos: experiencia });
  },
);
