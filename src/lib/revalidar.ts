import "server-only";
import { revalidatePath } from "next/cache";

/**
 * Después de editar desde el admin, el sitio público se regenera en la próxima
 * visita en vez de esperar a la hora del ISR. Invalida todas las páginas bajo
 * /[lang] (carta, home, experiencias…): son pocas y cambian juntas.
 */
export function revalidarSitio() {
  revalidatePath("/[lang]", "layout");
}
