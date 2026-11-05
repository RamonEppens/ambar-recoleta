import { filtrosPlatos, queryParams } from "@/lib/api/esquemas";
import {
  conErrores,
  errorDeBase,
  leerJson,
  ok,
  validar,
} from "@/lib/api/respuestas";
import { exigirAdminApi } from "@/lib/auth";
import { filtrarPlatos } from "@/lib/catalogo";
import { getCartas } from "@/lib/datos";
import { esquemaPlato } from "@/lib/esquemas";
import { aFilaPlato } from "@/lib/mapear";
import { revalidarSitio } from "@/lib/revalidar";

/**
 * GET /api/v1/platos?carta=cena&q=ciervo&precioMax=30000&pagina=1&limite=20
 * Lista los platos y tragos activos, con filtros y paginación.
 */
export const GET = conErrores(async (request: Request) => {
  const { pagina, limite, ...filtros } = validar(
    filtrosPlatos,
    queryParams(request.url),
  );
  const encontrados = filtrarPlatos(await getCartas(), filtros);
  const desde = (pagina - 1) * limite;
  return ok(
    {
      datos: encontrados.slice(desde, desde + limite),
      total: encontrados.length,
      pagina,
      limite,
    },
    { cache: true },
  );
});

/** POST /api/v1/platos — crea un plato. Solo admin (401 / 403). */
export const POST = conErrores(async (request: Request) => {
  const { db } = await exigirAdminApi();
  const datos = validar(esquemaPlato, await leerJson(request));
  const { data, error } = await db
    .from("platos")
    .insert(aFilaPlato(datos))
    .select("slug")
    .single();
  if (error) throw errorDeBase(error);
  revalidarSitio();
  return ok({ datos: data }, { status: 201 });
});
