import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { clavesPublicas } from "./claves";

/**
 * Cliente de Supabase CON la sesión de quien hace el pedido (admin).
 * La sesión viaja en cookies: Supabase las crea al ingresar y las lee acá.
 * Usa la misma clave publicable que el sitio, pero como lleva el token del
 * usuario, RLS lo trata como `authenticated` y `es_admin()` puede dar true.
 * Se crea uno nuevo por pedido: nunca se comparte entre usuarios.
 */
export async function clienteSesion() {
  const { url, clave } = clavesPublicas();
  const almacen = await cookies();
  return createServerClient(url, clave, {
    // httpOnly: el JavaScript del navegador no puede leer la sesión (el sitio
    // nunca usa Supabase desde el navegador, así que no lo necesita).
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
    cookies: {
      getAll: () => almacen.getAll(),
      setAll: (aGuardar) => {
        try {
          for (const { name, value, options } of aGuardar)
            almacen.set(name, value, options);
        } catch {
          // En un Server Component no se pueden escribir cookies; el proxy ya
          // refrescó la sesión antes de llegar acá, así que se puede ignorar.
        }
      },
    },
  });
}
