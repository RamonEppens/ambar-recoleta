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

type Resultado = { data: unknown; error: unknown };

/**
 * Como baseFalsa, pero cada consulta (cada `.from()` o `.rpc()`) recibe el
 * siguiente resultado de la lista, en orden. Sirve para flujos de varios pasos
 * (leer el pedido, confirmar el pago…). Guarda cada consulta como lista de llamadas.
 */
export function baseSecuencia(resultados: Resultado[]) {
  const consultas: [string, unknown[]][][] = [];
  const pendientes = [...resultados];
  const nueva = (metodo: string, args: unknown[]) => {
    const llamadas: [string, unknown[]][] = [[metodo, args]];
    consultas.push(llamadas);
    const resultado = pendientes.shift() ?? { data: null, error: null };
    const cadena: Record<string, unknown> = {
      then: (resolver: (r: unknown) => void) => resolver(resultado),
    };
    for (const m of [
      "insert",
      "update",
      "delete",
      "select",
      "eq",
      "single",
      "maybeSingle",
      "in",
      "order",
      "limit",
    ])
      cadena[m] = (...a: unknown[]) => {
        llamadas.push([m, a]);
        return cadena;
      };
    return cadena;
  };
  const db = {
    from: (...a: unknown[]) => nueva("from", a),
    rpc: (...a: unknown[]) => nueva("rpc", a),
  };
  return { db, consultas };
}
