import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase para LEER datos públicos desde el servidor (Server Components).
 * Usa la clave publicable: RLS solo le deja leer el catálogo activo.
 * No guarda sesión: estas lecturas no dependen de quién visita la página.
 */
export function clientePublico() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const clave = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !clave) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (ver README).",
    );
  }
  return createClient(url, clave, { auth: { persistSession: false } });
}
