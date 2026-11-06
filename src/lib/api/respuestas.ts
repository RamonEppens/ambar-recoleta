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
    readonly status: 400 | 401 | 403 | 404 | 409 | 502,
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

/** El cuerpo del pedido como JSON; si no es JSON válido, 400. */
export async function leerJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ErrorApi(400, "json_invalido", "El cuerpo no es JSON válido.");
  }
}

/**
 * Traduce los errores de Postgres que son culpa del pedido (no del servidor)
 * a códigos HTTP. Cualquier otro error sigue de largo y termina en 500.
 */
export function errorDeBase(error: { code?: string; message: string }) {
  switch (error.code) {
    case "23505": // unique_violation
      return new ErrorApi(409, "ya_existe", "Ya existe uno con ese slug.", [
        { campo: "slug", mensaje: "Ya está en uso." },
      ]);
    case "23503": // foreign_key_violation
      return new ErrorApi(
        409,
        "en_uso",
        "Está relacionado con otros datos (por ejemplo, pedidos). Desactivalo en vez de borrarlo.",
      );
    case "23514": // check_violation
      return new ErrorApi(
        400,
        "datos_invalidos",
        "La base rechazó un valor fuera de rango.",
      );
    case "42501": // RLS: sin permiso
      return new ErrorApi(
        403,
        "sin_permiso",
        "Tu usuario no puede hacer esto.",
      );
    default:
      return new Error(`Supabase: ${error.message}`);
  }
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
