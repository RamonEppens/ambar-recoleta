import { slug as esquemaSlug } from "@/lib/api/esquemas";
import {
  conErrores,
  errorDeBase,
  leerJson,
  noEncontrado,
  ok,
  validar,
} from "@/lib/api/respuestas";
import { exigirAdminApi } from "@/lib/auth";
import { getExperiencia } from "@/lib/datos";
import { esquemaExperiencia, parcial } from "@/lib/esquemas";
import { aFilaExperiencia } from "@/lib/mapear";
import { revalidarSitio } from "@/lib/revalidar";

type Contexto = RouteContext<"/api/v1/experiencias/[slug]">;

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

/** PATCH /api/v1/experiencias/:slug — cambia precio, cupos, textos… Solo admin. */
export const PATCH = conErrores(async (request: Request, ctx: Contexto) => {
  const { db } = await exigirAdminApi();
  const slug = validar(esquemaSlug, (await ctx.params).slug);
  const cambios = validar(parcial(esquemaExperiencia), await leerJson(request));
  const { data, error } = await db
    .from("experiencias")
    .update(aFilaExperiencia(cambios))
    .eq("slug", slug)
    .select("slug")
    .maybeSingle();
  if (error) throw errorDeBase(error);
  if (!data) throw noEncontrado("La experiencia");
  revalidarSitio();
  return ok({ datos: data });
});

/**
 * DELETE /api/v1/experiencias/:slug — solo si nunca se vendió.
 * Si tiene pedidos, la base lo impide (FK) y la API responde 409: hay que desactivarla.
 */
export const DELETE = conErrores(async (_request: Request, ctx: Contexto) => {
  const { db } = await exigirAdminApi();
  const slug = validar(esquemaSlug, (await ctx.params).slug);
  const { data, error } = await db
    .from("experiencias")
    .delete()
    .eq("slug", slug)
    .select("slug");
  if (error) throw errorDeBase(error);
  if (!data?.length) throw noEncontrado("La experiencia");
  revalidarSitio();
  return new Response(null, { status: 204 });
});
