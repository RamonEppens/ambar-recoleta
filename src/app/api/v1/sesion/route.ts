import { ok } from "@/lib/api/respuestas";
import { obtenerSesion } from "@/lib/auth";

/**
 * GET /api/v1/sesion — quién está logueado (o null). Lo usa el menú para
 * mostrar "Ingresar" o "Mi cuenta", y los formularios para completar nombre y
 * email. Las páginas son estáticas: la sesión se pide aparte, desde el navegador.
 */
export async function GET() {
  const { usuario, esAdmin } = await obtenerSesion().catch(() => ({
    usuario: null,
    esAdmin: false,
  }));
  if (!usuario) return ok({ datos: null });
  const meta = usuario.user_metadata ?? {};
  return ok({
    datos: {
      nombre: String(meta.full_name ?? meta.name ?? ""),
      email: usuario.email ?? "",
      esAdmin,
    },
  });
}
