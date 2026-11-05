/*
 * Manejo de errores centralizado de la API (el "Global Error Middleware" de la
 * clase 10, en versión Next): cada Route Handler se envuelve con `conErrores`,
 * que transforma cualquier error en una respuesta JSON con el código HTTP correcto.
 * El cliente nunca ve un stack trace; el detalle queda en los logs del servidor.
 */
import { z } from "zod";

// Mensajes de validación de Zod en castellano.
z.config(z.locales.es());

export type Detalle = { campo: string; mensaje: string };

/** Error esperado: algo que el cliente hizo mal (400, 401, 403, 404…). */
export class ErrorApi extends Error {
  constructor(
    readonly status: 400 | 401 | 403 | 404 | 409,
    readonly codigo: string,
    mensaje: string,
    readonly detalles?: Detalle[],
  ) {
    super(mensaje);
  }
}

export const noEncontrado = (recurso: string) =>
  new ErrorApi(404, "no_encontrado", `${recurso} no existe.`);

/** Valida con un esquema de Zod; si no cumple, error 400 con el detalle por campo. */
export function validar<T extends z.ZodType>(
  esquema: T,
  datos: unknown,
): z.infer<T> {
  const resultado = esquema.safeParse(datos);
  if (resultado.success) return resultado.data;
  throw new ErrorApi(
    400,
    "datos_invalidos",
    "Los datos enviados no son válidos.",
    resultado.error.issues.flatMap((issue) =>
      // Un parámetro desconocido no tiene ruta: el campo es el propio nombre.
      issue.code === "unrecognized_keys"
        ? issue.keys.map((campo) => ({
            campo,
            mensaje: "Parámetro desconocido.",
          }))
        : [
            {
              campo: issue.path.join(".") || "(general)",
              mensaje: issue.message,
            },
          ],
    ),
  );
}

/** Respuesta exitosa. Las lecturas públicas se pueden cachear un minuto en la CDN. */
export function ok(datos: unknown, { status = 200, cache = false } = {}) {
  return Response.json(datos, {
    status,
    headers: cache
      ? { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" }
      : { "Cache-Control": "no-store" },
  });
}

export function respuestaDeError(error: unknown) {
  if (error instanceof ErrorApi) {
    return Response.json(
      {
        error: {
          codigo: error.codigo,
          mensaje: error.message,
          ...(error.detalles ? { detalles: error.detalles } : {}),
        },
      },
      { status: error.status, headers: { "Cache-Control": "no-store" } },
    );
  }
  // Error inesperado (la base no responde, un bug): se registra completo
  // y al cliente le llega un mensaje genérico.
  console.error("[api] error inesperado:", error);
  return Response.json(
    {
      error: {
        codigo: "error_interno",
        mensaje: "Algo salió mal. Probá de nuevo en un rato.",
      },
    },
    { status: 500, headers: { "Cache-Control": "no-store" } },
  );
}

/** Envuelve un Route Handler: cualquier error termina en `respuestaDeError`. */
export function conErrores<A extends unknown[]>(
  handler: (...args: A) => Promise<Response>,
) {
  return async (...args: A) => {
    try {
      return await handler(...args);
    } catch (error) {
      return respuestaDeError(error);
    }
  };
}
