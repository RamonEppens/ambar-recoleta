/*
 * Funciones puras que convierten las filas de Supabase en los tipos del sitio.
 * No tocan la red: por eso se pueden testear sin base de datos.
 */
import type { DatosExperiencia, DatosPlato } from "./esquemas";
import type { Carta, Experiencia, Jornada, Semana, SetGrabado } from "./tipos";

export type FilaHorario = {
  dia: number;
  abierto: boolean;
  abre: string | null;
  aperitivo_hasta: string | null;
  cocina_hasta: string | null;
  dj_desde: string | null;
  cierra: string | null;
};
export type FilaCarta = {
  id: Carta["id"];
  titulo_es: string;
  titulo_en: string;
  orden: number;
};
export type FilaSeccion = {
  id: string;
  carta_id: Carta["id"];
  slug: string;
  titulo_es: string;
  titulo_en: string;
  orden: number;
};
export type FilaPlato = {
  seccion_id: string;
  slug: string;
  nombre: string;
  descripcion_es: string;
  descripcion_en: string;
  precio: number | null;
  orden: number;
};
export type FilaSet = {
  youtube_id: string;
  titulo: string;
  serie: string | null;
};
export type FilaExperiencia = {
  id: string;
  slug: string;
  nombre_es: string;
  nombre_en: string;
  descripcion_es: string;
  descripcion_en: string;
  precio: number;
  cupos: number;
  foto: string | null;
};

/** Postgres devuelve las horas como "17:00:00"; el sitio usa "17:00". */
const hhmm = (hora: string) => hora.slice(0, 5);
const porOrden = (a: { orden: number }, b: { orden: number }) =>
  a.orden - b.orden;

/** Siete filas (una por día) → la semana, con `null` en los días cerrados. */
export function armarSemana(filas: FilaHorario[]): Semana {
  const semana: (Jornada | null)[] = Array.from({ length: 7 }, () => null);
  for (const f of filas) {
    if (
      !f.abierto ||
      !f.abre ||
      !f.aperitivo_hasta ||
      !f.cocina_hasta ||
      !f.cierra
    )
      continue;
    semana[f.dia] = {
      abre: hhmm(f.abre),
      aperitivoHasta: hhmm(f.aperitivo_hasta),
      cocinaHasta: hhmm(f.cocina_hasta),
      ...(f.dj_desde ? { djDesde: hhmm(f.dj_desde) } : {}),
      cierra: hhmm(f.cierra),
    };
  }
  return semana;
}

/** Tres tablas planas → cartas con sus secciones y platos, ordenadas. */
export function armarCartas(
  cartas: FilaCarta[],
  secciones: FilaSeccion[],
  platos: FilaPlato[],
): Carta[] {
  return [...cartas].sort(porOrden).map((carta) => ({
    id: carta.id,
    titulo: { es: carta.titulo_es, en: carta.titulo_en },
    secciones: secciones
      .filter((s) => s.carta_id === carta.id)
      .sort(porOrden)
      .map((seccion) => ({
        id: seccion.slug,
        titulo: { es: seccion.titulo_es, en: seccion.titulo_en },
        platos: platos
          .filter((p) => p.seccion_id === seccion.id)
          .sort(porOrden)
          .map((p) => ({
            id: p.slug,
            nombre: p.nombre,
            descripcion: { es: p.descripcion_es, en: p.descripcion_en },
            precio: p.precio,
          })),
      })),
  }));
}

export const aSet = (f: FilaSet): SetGrabado => ({
  youtubeId: f.youtube_id,
  titulo: f.titulo,
  serie: f.serie,
});

export const aExperiencia = (f: FilaExperiencia): Experiencia => ({
  id: f.id,
  slug: f.slug,
  nombre: { es: f.nombre_es, en: f.nombre_en },
  descripcion: { es: f.descripcion_es, en: f.descripcion_en },
  precio: f.precio,
  cupos: f.cupos,
  foto: f.foto,
});

/** Busca un plato o trago por slug en todas las cartas. */
export function buscarPlato(cartas: Carta[], slug: string) {
  for (const carta of cartas)
    for (const seccion of carta.secciones) {
      const plato = seccion.platos.find((p) => p.id === slug);
      if (plato) return plato;
    }
  return null;
}

/* ---- Del formulario del admin a la fila de la base (camelCase → snake_case) ---- */

const quitarIndefinidos = (fila: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(fila).filter(([, v]) => v !== undefined));

/** Acepta datos parciales (PATCH): solo se escriben las columnas que llegaron. */
export const aFilaPlato = (d: Partial<DatosPlato>) =>
  quitarIndefinidos({
    seccion_id: d.seccionId,
    slug: d.slug,
    nombre: d.nombre,
    descripcion_es: d.descripcionEs,
    descripcion_en: d.descripcionEn,
    precio: d.precio,
    activo: d.activo,
    orden: d.orden,
  });

export const aFilaExperiencia = (d: Partial<DatosExperiencia>) =>
  quitarIndefinidos({
    slug: d.slug,
    nombre_es: d.nombreEs,
    nombre_en: d.nombreEn,
    descripcion_es: d.descripcionEs,
    descripcion_en: d.descripcionEn,
    precio: d.precio,
    cupos: d.cupos,
    activa: d.activa,
    foto: d.foto,
    orden: d.orden,
  });
