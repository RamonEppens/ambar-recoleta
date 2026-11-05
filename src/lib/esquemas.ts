/*
 * Esquemas de Zod de lo que se puede crear o editar desde el admin.
 * Se usan dos veces: en el navegador, para avisar mientras se escribe, y en
 * la API, que vuelve a validar todo (nunca se confía en el cliente, clase 10).
 * Un mismo contrato en los dos lados: no pueden quedar desincronizados.
 * Los mensajes están escritos a mano porque se le muestran a quien edita.
 */
import { z } from "zod";

export const slug = z
  .string()
  .trim()
  .min(2, "Mínimo 2 caracteres.")
  .max(60, "Máximo 60 caracteres.")
  .regex(
    /^[a-z0-9]+(-[a-z0-9]+)*$/,
    "Solo minúsculas, números y guiones (ej. tartar-de-ciervo).",
  );

const texto = (min: number, max: number) =>
  z
    .string()
    .trim()
    .min(
      min,
      min === 1 ? "No puede quedar vacío." : `Mínimo ${min} caracteres.`,
    )
    .max(max, `Máximo ${max} caracteres.`);

const pesos = z
  .number({ error: "Tiene que ser un número." })
  .int("En pesos, sin centavos.")
  .positive("Tiene que ser mayor a 0.")
  .max(10_000_000, "Revisá el precio: parece demasiado alto.");

const orden = z
  .number({ error: "Tiene que ser un número." })
  .int("Tiene que ser un número entero.")
  .min(0, "No puede ser negativo.")
  .max(999, "Máximo 999.");

export const esquemaPlato = z.strictObject({
  seccionId: z.uuid("Elegí una sección."),
  slug,
  nombre: texto(2, 80),
  descripcionEs: texto(0, 300),
  descripcionEn: texto(0, 300),
  // null = sin precio en la carta (por ejemplo, "consultar")
  precio: pesos.nullable(),
  activo: z.boolean(),
  orden,
});
export type DatosPlato = z.infer<typeof esquemaPlato>;

export const esquemaExperiencia = z.strictObject({
  slug,
  nombreEs: texto(2, 80),
  nombreEn: texto(2, 80),
  descripcionEs: texto(10, 400),
  descripcionEn: texto(10, 400),
  precio: pesos,
  cupos: z
    .number({ error: "Tiene que ser un número." })
    .int("Tiene que ser un número entero.")
    .min(0, "No puede ser negativo.")
    .max(1000, "Máximo 1000."),
  activa: z.boolean(),
  foto: z.string().max(40).nullable(),
  orden,
});
export type DatosExperiencia = z.infer<typeof esquemaExperiencia>;

/** Para PATCH: cualquier subconjunto de campos, pero al menos uno. */
export const parcial = <T extends z.ZodObject>(esquema: T) =>
  esquema
    .partial()
    .refine((cambios) => Object.keys(cambios).length > 0, "No hay cambios.");

/** Los errores de Zod como { campo: mensaje }, para mostrarlos al lado de cada input. */
export function erroresPorCampo(error: z.ZodError) {
  const errores: Record<string, string> = {};
  for (const issue of error.issues) {
    const campo = String(issue.path[0] ?? "");
    errores[campo] ??= issue.message;
  }
  return errores;
}
