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
import { filtrarPlatos } from "@/lib/catalogo";
import { getCartas } from "@/lib/datos";
import { esquemaPlato, parcial } from "@/lib/esquemas";
import { aFilaPlato } from "@/lib/mapear";
import { revalidarSitio } from "@/lib/revalidar";

type Contexto = RouteContext<"/api/v1/platos/[slug]">;

/** GET /api/v1/platos/:slug — un plato o trago, con su carta y sección. */
export const GET = conErrores(async (_request: Request, ctx: Contexto) => {
  const slug = validar(esquemaSlug, (await ctx.params).slug);
  const plato = filtrarPlatos(await getCartas(), {}).find((p) => p.id === slug);
  if (!plato) throw noEncontrado("El plato");
  return ok({ datos: plato }, { cache: true });
});

/** PATCH /api/v1/platos/:slug — cambia los campos enviados. Solo admin. */
export const PATCH = conErrores(async (request: Request, ctx: Contexto) => {
  const { db } = await exigirAdminApi();
  const slug = validar(esquemaSlug, (await ctx.params).slug);
  const cambios = validar(parcial(esquemaPlato), await leerJson(request));
  const { data, error } = await db
    .from("platos")
    .update(aFilaPlato(cambios))
    .eq("slug", slug)
    .select("slug")
    .maybeSingle();
  if (error) throw errorDeBase(error);
  if (!data) throw noEncontrado("El plato");
  revalidarSitio();
  return ok({ datos: data });
});

/** DELETE /api/v1/platos/:slug — borra el plato. Solo admin. 204 sin cuerpo. */
export const DELETE = conErrores(async (_request: Request, ctx: Contexto) => {
  const { db } = await exigirAdminApi();
  const slug = validar(esquemaSlug, (await ctx.params).slug);
  const { data, error } = await db
    .from("platos")
    .delete()
    .eq("slug", slug)
    .select("slug");
  if (error) throw errorDeBase(error);
  if (!data?.length) throw noEncontrado("El plato");
  revalidarSitio();
  return new Response(null, { status: 204 });
});
