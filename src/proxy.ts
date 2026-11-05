import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, hasLocale, locales } from "@/i18n/config";
import { refrescarSesion } from "@/lib/supabase/proxy";

/**
 * Elige el idioma a partir del header Accept-Language del navegador.
 * "en-US,en;q=0.9,es;q=0.8" → ["en", "en", "es"] → "en".
 * Los navegadores ya envían los idiomas ordenados por preferencia.
 */
function preferredLocale(request: NextRequest) {
  const header = request.headers.get("accept-language") ?? "";
  const candidates = header
    .split(",")
    .map((part) => part.split(";")[0].trim().slice(0, 2).toLowerCase());
  return candidates.find(hasLocale) ?? defaultLocale;
}

/**
 * El admin no tiene idioma. Sin sesión, cualquier página del admin manda al
 * formulario de ingreso (el equivalente de un 401 para una página).
 * Si ingresó, igual falta ver si es admin: eso se revisa en el layout del admin.
 */
async function protegerAdmin(request: NextRequest) {
  const { respuesta, usuario } = await refrescarSesion(request);
  const esIngreso = request.nextUrl.pathname === "/admin/ingresar";
  if (!usuario && !esIngreso) {
    const ingreso = new URL("/admin/ingresar", request.url);
    return NextResponse.redirect(ingreso);
  }
  if (usuario && esIngreso) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  return respuesta;
}

/** Toda URL sin idioma (/, /carta) redirige a su versión con idioma (/es, /es/carta). */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin" || pathname.startsWith("/admin/"))
    return protegerAdmin(request);

  const pathnameHasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (pathnameHasLocale) return;

  request.nextUrl.pathname = `/${preferredLocale(request)}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Ignora la API, los archivos internos de Next y cualquier archivo con extensión (robots.txt, icon.svg…).
  matcher: ["/((?!api/|_next|.*\\..*).*)"],
};
