import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { clavesPublicas } from "./claves";

/**
 * Corre en el proxy antes de cada página del admin: refresca el token de la
 * sesión si venció (y escribe las cookies nuevas en la respuesta) y devuelve
 * quién es el usuario, o null si no ingresó.
 */
export async function refrescarSesion(request: NextRequest) {
  let respuesta = NextResponse.next({ request });
  const { url, clave } = clavesPublicas();

  const supabase = createServerClient(url, clave, {
    // httpOnly: el JavaScript del navegador no puede leer la sesión (el sitio
    // nunca usa Supabase desde el navegador, así que no lo necesita).
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (aGuardar, headers) => {
        for (const { name, value } of aGuardar)
          request.cookies.set(name, value);
        respuesta = NextResponse.next({ request });
        for (const { name, value, options } of aGuardar)
          respuesta.cookies.set(name, value, options);
        for (const [nombre, valor] of Object.entries(headers ?? {}))
          respuesta.headers.set(nombre, valor);
      },
    },
  });

  // getUser() valida el token contra Supabase: no alcanza con que la cookie exista.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { respuesta, usuario: user };
}
