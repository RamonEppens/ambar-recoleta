import "server-only";
import { cache } from "react";
import {
  aExperiencia,
  armarCartas,
  armarSemana,
  aSet,
  type FilaCarta,
  type FilaExperiencia,
  type FilaHorario,
  type FilaPlato,
  type FilaSeccion,
  type FilaSet,
} from "./mapear";
import { clientePublico } from "./supabase/publico";

/*
 * Lecturas de Supabase para las páginas públicas.
 * `cache` (de React) evita repetir la misma consulta en un mismo render:
 * el layout y la página piden los horarios, pero se consultan una sola vez.
 */

async function filas<T>(
  consulta: PromiseLike<{ data: unknown; error: { message: string } | null }>,
) {
  const { data, error } = await consulta;
  if (error) throw new Error(`Supabase: ${error.message}`);
  return (data ?? []) as T[];
}

export const getSemana = cache(async () => {
  const db = clientePublico();
  return armarSemana(
    await filas<FilaHorario>(
      db
        .from("horarios")
        .select(
          "dia, abierto, abre, aperitivo_hasta, cocina_hasta, dj_desde, cierra",
        ),
    ),
  );
});

export const getCartas = cache(async () => {
  const db = clientePublico();
  const [cartas, secciones, platos] = await Promise.all([
    filas<FilaCarta>(
      db.from("cartas").select("id, titulo_es, titulo_en, orden"),
    ),
    filas<FilaSeccion>(
      db
        .from("secciones")
        .select("id, carta_id, slug, titulo_es, titulo_en, orden"),
    ),
    // RLS ya filtra los platos inactivos para el público.
    filas<FilaPlato>(
      db
        .from("platos")
        .select(
          "seccion_id, slug, nombre, descripcion_es, descripcion_en, precio, orden",
        ),
    ),
  ]);
  return armarCartas(cartas, secciones, platos);
});

export const getSets = cache(async () => {
  const db = clientePublico();
  const sets = await filas<FilaSet>(
    db.from("sets").select("youtube_id, titulo, serie").order("orden"),
  );
  return sets.map(aSet);
});

const COLUMNAS_EXPERIENCIA =
  "id, slug, nombre_es, nombre_en, descripcion_es, descripcion_en, precio, cupos, foto";

// RLS ya filtra las experiencias inactivas para el público.
export const getExperiencias = cache(async () => {
  const db = clientePublico();
  const experiencias = await filas<FilaExperiencia>(
    db.from("experiencias").select(COLUMNAS_EXPERIENCIA).order("orden"),
  );
  return experiencias.map(aExperiencia);
});

/** Una experiencia por slug, o `null` si no existe (o está inactiva). */
export const getExperiencia = cache(async (slug: string) => {
  const db = clientePublico();
  const [fila] = await filas<FilaExperiencia>(
    db
      .from("experiencias")
      .select(COLUMNAS_EXPERIENCIA)
      .eq("slug", slug)
      .limit(1),
  );
  return fila ? aExperiencia(fila) : null;
});
