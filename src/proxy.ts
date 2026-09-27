import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, hasLocale, locales } from "@/i18n/config";

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

/** Toda URL sin idioma (/, /carta) redirige a su versión con idioma (/es, /es/carta). */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const pathnameHasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (pathnameHasLocale) return;

  request.nextUrl.pathname = `/${preferredLocale(request)}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Ignora los archivos internos de Next y cualquier archivo con extensión (robots.txt, icon.svg…).
  matcher: ["/((?!_next|.*\\..*).*)"],
};
