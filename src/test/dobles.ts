/* Dobles de prueba compartidos por los tests de la API. */

/**
 * Imita el cliente de Supabase: cada método devuelve el mismo objeto (para
 * encadenar .from().insert().select()…) y al final responde `resultado`.
 * Guarda las llamadas para revisar qué se le pidió a la base.
 */
export function baseFalsa(resultado: { data: unknown; error: unknown }) {
  const llamadas: [string, unknown[]][] = [];
  const consulta: Record<string, unknown> = {
    then: (resolver: (r: unknown) => void) => resolver(resultado),
  };
  for (const metodo of [
    "from",
    "insert",
    "update",
    "delete",
    "select",
    "eq",
    "single",
    "maybeSingle",
    "rpc",
    "in",
    "order",
    "limit",
  ])
    consulta[metodo] = (...args: unknown[]) => {
      llamadas.push([metodo, args]);
      return consulta;
    };
  return { db: consulta, llamadas };
}
