/**
 * Horarios de Ámbar: la única fuente de verdad.
 * La usan el indicador "Ahora" y el pie de página. En E5 pasa a una tabla de
 * Supabase, editable desde el panel de administración, con esta misma forma.
 *
 * Horas "HH:MM" en hora de Buenos Aires. Si una hora es menor que `abre`,
 * es de después de medianoche: la noche del viernes termina el sábado a las 02.
 */
export const ZONA_HORARIA = "America/Argentina/Buenos_Aires";

export type Jornada = {
  abre: string;
  aperitivoHasta: string;
  cocinaHasta: string;
  djDesde?: string;
  cierra: string;
};

const entreSemana: Jornada = {
  abre: "17:00",
  aperitivoHasta: "20:00",
  cocinaHasta: "23:30",
  cierra: "01:00",
};

/** Índice 0 = domingo … 6 = sábado, igual que Date.getDay(). `null` = cerrado. */
export const semana: readonly (Jornada | null)[] = [
  null, // domingo
  null, // lunes
  entreSemana, // martes
  entreSemana, // miércoles
  entreSemana, // jueves
  // viernes y sábado: DJ desde las 23 (a confirmar con Ámbar)
  {
    abre: "17:00",
    aperitivoHasta: "20:00",
    cocinaHasta: "23:30",
    djDesde: "23:00",
    cierra: "02:00",
  },
  {
    abre: "14:00",
    aperitivoHasta: "20:00",
    cocinaHasta: "23:30",
    djDesde: "23:00",
    cierra: "02:00",
  },
];
