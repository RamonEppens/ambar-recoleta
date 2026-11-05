import type { Jornada, Semana } from "../tipos";

/**
 * Semana real de Ámbar, usada SOLO en los tests (la del sitio viene de Supabase).
 * Mantenerla igual a la semilla: supabase/migrations/20261104000003_semilla.sql.
 */
const entreSemana: Jornada = {
  abre: "17:00",
  aperitivoHasta: "20:00",
  cocinaHasta: "23:30",
  cierra: "01:00",
};

export const semanaEjemplo: Semana = [
  null,
  null,
  entreSemana,
  entreSemana,
  entreSemana,
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
