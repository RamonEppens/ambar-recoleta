import { filtrosPlatos, queryParams } from "@/lib/api/esquemas";
import { conErrores, ok, validar } from "@/lib/api/respuestas";
import { filtrarPlatos } from "@/lib/catalogo";
import { getCartas } from "@/lib/datos";

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
