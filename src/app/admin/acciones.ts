"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { clienteSesion } from "@/lib/supabase/sesion";

/*
 * Server Actions del ingreso. Corren en el servidor aunque se llamen desde un
 * formulario: la contraseña va directo a Supabase y la sesión queda en una
 * cookie httpOnly (el JavaScript del navegador no la puede leer).
 */

const credenciales = z.object({
  email: z.email("Escribí un email válido."),
  password: z.string().min(6, "La contraseña tiene al menos 6 caracteres."),
});

export type EstadoIngreso = { error?: string; email?: string };

export async function ingresar(
  _anterior: EstadoIngreso,
  formulario: FormData,
): Promise<EstadoIngreso> {
  const email = String(formulario.get("email") ?? "");
  const datos = credenciales.safeParse({
    email,
    password: formulario.get("password"),
  });
  if (!datos.success) return { error: datos.error.issues[0].message, email };

  const db = await clienteSesion();
  const { error } = await db.auth.signInWithPassword(datos.data);
  // El mismo mensaje para "no existe" y "contraseña mal": no le confirmamos a
  // un atacante qué emails tienen cuenta.
  if (error) return { error: "Email o contraseña incorrectos.", email };

  redirect("/admin");
}

export async function salir() {
  const db = await clienteSesion();
  await db.auth.signOut();
  redirect("/admin/ingresar");
}
