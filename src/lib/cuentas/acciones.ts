"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { clienteSesion } from "@/lib/supabase/sesion";
import { rutaSegura } from "./seguro";

/*
 * Server Actions de las cuentas de clientes (Supabase Auth). Corren en el
 * servidor: la contraseña va directo a Supabase y la sesión queda en una
 * cookie httpOnly. Los errores vuelven como claves y cada idioma los traduce.
 */

export type EstadoCuenta = { error?: string; email?: string; nombre?: string };

const idioma = (form: FormData) => (form.get("lang") === "en" ? "en" : "es");
const siguiente = (form: FormData) =>
  rutaSegura(form.get("siguiente"), `/${idioma(form)}/cuenta`);

const ingreso = z.object({
  email: z.email({ error: "email_invalido" }),
  password: z.string().min(1, "credenciales"),
});

export async function ingresarCliente(
  _anterior: EstadoCuenta,
  form: FormData,
): Promise<EstadoCuenta> {
  const email = String(form.get("email") ?? "").trim();
  const datos = ingreso.safeParse({ email, password: form.get("password") });
  if (!datos.success) return { error: datos.error.issues[0].message, email };

  const db = await clienteSesion();
  const { error } = await db.auth.signInWithPassword(datos.data);
  // Mismo mensaje si el email no existe o la contraseña está mal.
  if (error) return { error: "credenciales", email };
  redirect(siguiente(form));
}

const registro = z.object({
  nombre: z.string().trim().min(2, "nombre_corto").max(80, "nombre_corto"),
  email: z.email({ error: "email_invalido" }),
  password: z.string().min(8, "password_corta").max(72, "password_corta"),
});

export async function registrarse(
  _anterior: EstadoCuenta,
  form: FormData,
): Promise<EstadoCuenta> {
  const nombre = String(form.get("nombre") ?? "");
  const email = String(form.get("email") ?? "").trim();
  const datos = registro.safeParse({
    nombre,
    email,
    password: form.get("password"),
  });
  if (!datos.success)
    return { error: datos.error.issues[0].message, email, nombre };

  const db = await clienteSesion();
  const { data, error } = await db.auth.signUp({
    email: datos.data.email,
    password: datos.data.password,
    // El nombre queda en los datos del usuario (como el de Google).
    options: { data: { full_name: datos.data.nombre } },
  });
  if (error)
    return {
      error: error.code === "user_already_exists" ? "ya_existe" : "general",
      email,
      nombre,
    };
  // Con "Confirm email" apagado en Supabase, signUp ya deja la sesión abierta.
  // Si Supabase devolvió un usuario sin identidades, el email ya existía.
  if (!data.session) return { error: "ya_existe", email, nombre };
  redirect(siguiente(form));
}

/**
 * Google (OAuth): Supabase arma la URL de Google y, al volver, Google manda a
 * /auth/callback con un código que se cambia por la sesión (PKCE).
 */
export async function ingresarConGoogle(form: FormData) {
  const origen =
    process.env.SITIO_URL ??
    `${(await headers()).get("x-forwarded-proto") ?? "http"}://${(await headers()).get("host")}`;
  const vuelta = new URL("/auth/callback", origen);
  vuelta.searchParams.set("siguiente", siguiente(form));

  const db = await clienteSesion();
  const { data, error } = await db.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: vuelta.toString() },
  });
  if (error || !data.url) redirect(`/${idioma(form)}/ingresar?error=google`);
  redirect(data.url);
}

export async function salirCliente(form: FormData) {
  const db = await clienteSesion();
  await db.auth.signOut();
  redirect(`/${idioma(form)}`);
}
