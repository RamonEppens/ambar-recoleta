/*
 * Esquemas de Zod: el contrato de lo que la API acepta. Los query params
 * llegan siempre como texto, por eso los números usan `z.coerce`.
 * `strictObject` rechaza parámetros desconocidos: un `?prcioMax=` mal escrito
 * da 400 en vez de ignorarse en silencio.
 */
import { z } from "zod";

export const slug = z
  .string()
  .regex(
    /^[a-z0-9]+(-[a-z0-9]+)*$/,
    "Debe ser un slug: minúsculas, números y guiones.",
  )
  .max(80);

export const filtrosPlatos = z.strictObject({
  carta: z.enum(["aperitivo", "cena", "tragos"]).optional(),
  q: z.string().trim().min(2).max(60).optional(),
  precioMax: z.coerce.number().int().positive().optional(),
  pagina: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(50).default(50),
});

/** Los query params de una URL como objeto plano (`?a=1&b=2` → `{ a: "1", b: "2" }`). */
export const queryParams = (url: string) =>
  Object.fromEntries(new URL(url).searchParams);
