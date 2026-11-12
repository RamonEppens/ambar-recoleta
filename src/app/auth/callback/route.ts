import { NextResponse } from "next/server";
import { rutaSegura } from "@/lib/cuentas/seguro";
import { clienteSesion } from "@/lib/supabase/sesion";

/**
 * GET /auth/callback — vuelta de Google. Trae un código de un solo uso que se
 * cambia por la sesión (flujo PKCE de Supabase: el código no sirve sin el
 * "verifier" que quedó en una cookie de este navegador).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const codigo = url.searchParams.get("code");
  const destino = rutaSegura(url.searchParams.get("siguiente"), "/es/cuenta");
  const idioma = destino.startsWith("/en") ? "en" : "es";

  if (codigo) {
    const db = await clienteSesion();
    const { error } = await db.auth.exchangeCodeForSession(codigo);
    if (!error) return NextResponse.redirect(new URL(destino, url.origin));
  }
  return NextResponse.redirect(
    new URL(`/${idioma}/ingresar?error=google`, url.origin),
  );
}
