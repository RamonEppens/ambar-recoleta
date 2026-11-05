import "server-only";
import { notFound } from "next/navigation";
import { exigirSesionPagina } from "./auth";

/*
 * Lecturas del admin. Usan el cliente CON sesión: RLS deja ver también lo
 * inactivo porque el usuario es admin. Si no lo fuera, estas consultas
 * volverían solo lo público (y el layout ni siquiera muestra el panel).
 */

async function db() {
  const sesion = await exigirSesionPagina();
  if (!sesion.esAdmin) notFound();
  return sesion.db;
}

function revisar<T>({
  data,
  error,
}: {
  data: T | null;
  error: { message: string } | null;
}) {
  if (error) throw new Error(`Supabase: ${error.message}`);
  return data as T;
}

export type FilaPlatoAdmin = {
  slug: string;
  nombre: string;
  precio: number | null;
  activo: boolean;
  orden: number;
  seccion_id: string;
};

export async function platosAdmin() {
  const cliente = await db();
  const [cartas, secciones, platos] = await Promise.all([
    cliente.from("cartas").select("id, titulo_es").order("orden"),
    cliente.from("secciones").select("id, carta_id, titulo_es").order("orden"),
    cliente
      .from("platos")
      .select("slug, nombre, precio, activo, orden, seccion_id")
      .order("orden"),
  ]);
  return {
    cartas: revisar<{ id: string; titulo_es: string }[]>(cartas),
    secciones:
      revisar<{ id: string; carta_id: string; titulo_es: string }[]>(secciones),
    platos: revisar<FilaPlatoAdmin[]>(platos),
  };
}

/** Las secciones como opciones del select: "Carta de cena · Medianos". */
export async function opcionesSecciones() {
  const { cartas, secciones } = await platosAdmin();
  return cartas.flatMap((c) =>
    secciones
      .filter((s) => s.carta_id === c.id)
      .map((s) => ({
        id: s.id,
        nombre:
          s.titulo_es === c.titulo_es
            ? c.titulo_es
            : `${c.titulo_es} · ${s.titulo_es}`,
      })),
  );
}

export async function platoAdmin(slug: string) {
  const cliente = await db();
  return revisar(
    await cliente
      .from("platos")
      .select(
        "seccion_id, slug, nombre, descripcion_es, descripcion_en, precio, activo, orden",
      )
      .eq("slug", slug)
      .maybeSingle(),
  ) as {
    seccion_id: string;
    slug: string;
    nombre: string;
    descripcion_es: string;
    descripcion_en: string;
    precio: number | null;
    activo: boolean;
    orden: number;
  } | null;
}

export type FilaExperienciaAdmin = {
  slug: string;
  nombre_es: string;
  nombre_en: string;
  descripcion_es: string;
  descripcion_en: string;
  precio: number;
  cupos: number;
  activa: boolean;
  foto: string | null;
  orden: number;
};

const COLUMNAS_EXPERIENCIA =
  "slug, nombre_es, nombre_en, descripcion_es, descripcion_en, precio, cupos, activa, foto, orden";

export async function experienciasAdmin() {
  const cliente = await db();
  return revisar<FilaExperienciaAdmin[]>(
    await cliente
      .from("experiencias")
      .select(COLUMNAS_EXPERIENCIA)
      .order("orden"),
  );
}

export async function experienciaAdmin(slug: string) {
  const cliente = await db();
  return revisar<FilaExperienciaAdmin | null>(
    await cliente
      .from("experiencias")
      .select(COLUMNAS_EXPERIENCIA)
      .eq("slug", slug)
      .maybeSingle(),
  );
}

export type FilaConsultaAdmin = {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  fecha: string;
  personas: number;
  tipo: string;
  mensaje: string | null;
  estado: string;
  created_at: string;
};

/** Consultas de eventos, las próximas primero. RLS: solo el admin las puede leer. */
export async function consultasAdmin() {
  const cliente = await db();
  return revisar<FilaConsultaAdmin[]>(
    await cliente
      .from("consultas_eventos")
      .select(
        "id, nombre, email, telefono, fecha, personas, tipo, mensaje, estado, created_at",
      )
      .order("fecha"),
  );
}
