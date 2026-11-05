import "server-only";
import { createClient } from "@supabase/supabase-js";
import { clavesPublicas } from "./claves";

/**
 * Cliente de Supabase para LEER datos públicos desde el servidor (Server Components).
 * Usa la clave publicable: RLS solo le deja leer el catálogo activo.
 * No guarda sesión: estas lecturas no dependen de quién visita la página.
 */
export function clientePublico() {
  const { url, clave } = clavesPublicas();
  return createClient(url, clave, { auth: { persistSession: false } });
}
