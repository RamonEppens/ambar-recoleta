import "server-only";
import { redirect } from "next/navigation";
import { ErrorApi } from "./api/respuestas";
import { clienteSesion } from "./supabase/sesion";

/*
 * Autenticación (¿quién sos?) y autorización (¿qué podés hacer?).
 * El rol vive en la tabla `perfiles` (RBAC, clase 09). Estas funciones son la
 * primera barrera; la segunda es RLS en la base, que rechaza cualquier
 * escritura de alguien que no sea admin aunque este código tuviera un bug.
 */

export async function obtenerSesion() {
  const db = await clienteSesion();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return { db, usuario: null, esAdmin: false };

  const { data: perfil } = await db
    .from("perfiles")
    .select("rol")
    .eq("id", user.id)
    .maybeSingle();
  return { db, usuario: user, esAdmin: perfil?.rol === "admin" };
}

/** Para la API: 401 si no ingresó, 403 si ingresó pero no es admin. */
export async function exigirAdminApi() {
  const sesion = await obtenerSesion();
  if (!sesion.usuario)
    throw new ErrorApi(401, "no_autenticado", "Tenés que ingresar al admin.");
  if (!sesion.esAdmin)
    throw new ErrorApi(403, "sin_permiso", "Tu usuario no es administrador.");
  return sesion;
}

/** Para las páginas del admin: sin sesión, al formulario de ingreso. */
export async function exigirSesionPagina() {
  const sesion = await obtenerSesion();
  if (!sesion.usuario) redirect("/admin/ingresar");
  return sesion as typeof sesion & {
    usuario: NonNullable<typeof sesion.usuario>;
  };
}

/**
 * El id del cliente con sesión, o null. Para asociar una compra o una consulta
 * a su cuenta. Nunca falla: si no hay sesión (o no se puede leer), es null y
 * la compra sigue como invitado.
 */
export async function usuarioActualId() {
  try {
    const db = await clienteSesion();
    const {
      data: { user },
    } = await db.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}
