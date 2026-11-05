/*
 * Tipos de dominio del sitio. Los datos vienen de Supabase (src/lib/datos.ts),
 * pero los componentes trabajan con estas formas, independientes de la base.
 */
export type Texto = { es: string; en: string };

/** Un día abierto. Horas "HH:MM" de Buenos Aires; una hora menor que `abre` es de madrugada. */
export type Jornada = {
  abre: string;
  aperitivoHasta: string;
  cocinaHasta: string;
  djDesde?: string;
  cierra: string;
};

/** Índice 0 = domingo … 6 = sábado, igual que Date.getDay(). `null` = cerrado. */
export type Semana = readonly (Jornada | null)[];

export type Plato = {
  id: string; // slug
  nombre: string;
  descripcion: Texto;
  precio: number | null; // en pesos
};

export type Seccion = { id: string; titulo: Texto; platos: Plato[] };

export type Carta = {
  id: "aperitivo" | "cena" | "tragos";
  titulo: Texto;
  secciones: Seccion[];
};

export type SetGrabado = {
  youtubeId: string;
  titulo: string;
  serie: string | null;
};

export type Experiencia = {
  id: string; // uuid
  slug: string;
  nombre: Texto;
  descripcion: Texto;
  precio: number; // en pesos
  cupos: number; // stock: cuántas quedan
  foto: string | null; // nombre de una foto de src/data/fotos.ts
};
