import { getDictionary } from "@/i18n/dictionaries";

/** Las fotos del sitio con su descripción en castellano, para el select. */
export async function opcionesFotos() {
  const { fotos } = await getDictionary("es");
  return Object.entries(fotos).map(([id, texto]) => ({ id, texto }));
}
