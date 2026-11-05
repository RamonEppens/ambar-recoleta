import { slug as esquemaSlug } from "@/lib/api/esquemas";
import { conErrores, noEncontrado, ok, validar } from "@/lib/api/respuestas";
import { filtrarPlatos } from "@/lib/catalogo";
import { getCartas } from "@/lib/datos";

/** GET /api/v1/platos/:slug — un plato o trago, con su carta y sección. */
export const GET = conErrores(
  async (_request: Request, ctx: RouteContext<"/api/v1/platos/[slug]">) => {
    const slug = validar(esquemaSlug, (await ctx.params).slug);
    const plato = filtrarPlatos(await getCartas(), {}).find(
      (p) => p.id === slug,
    );
    if (!plato) throw noEncontrado("El plato");
    return ok({ datos: plato }, { cache: true });
  },
);
