import type { Jornada } from "../data/horarios";

export type Tramo = {
  desde: number;
  hasta: number;
  abre: string;
  cierra: string;
};

type Rango = { abre: string; cierra: string };

const ORDEN = [1, 2, 3, 4, 5, 6, 0]; // lunes primero, domingo al final

/** Por defecto agrupa por horario de apertura y cierre del local. */
const horarioDelLocal = (jornada: Jornada): Rango => ({
  abre: jornada.abre,
  cierra: jornada.cierra,
});

/**
 * Agrupa días seguidos con el mismo horario: martes a jueves, 17 a 01.
 * `rango` elige qué horario comparar: el del local (por defecto) o, por ejemplo,
 * el de la carta aperitiva (de `abre` a `aperitivoHasta`).
 */
export function agruparSemana(
  semana: readonly (Jornada | null)[],
  rango: (jornada: Jornada) => Rango = horarioDelLocal,
) {
  const tramos: Tramo[] = [];
  const cerrados: number[] = [];

  for (const dia of ORDEN) {
    const jornada = semana[dia];
    if (!jornada) {
      cerrados.push(dia);
      continue;
    }
    const { abre, cierra } = rango(jornada);
    const ultimo = tramos.at(-1);
    const seguido =
      ultimo && ORDEN.indexOf(ultimo.hasta) === ORDEN.indexOf(dia) - 1;
    if (seguido && ultimo.abre === abre && ultimo.cierra === cierra) {
      ultimo.hasta = dia;
    } else {
      tramos.push({ desde: dia, hasta: dia, abre, cierra });
    }
  }
  return { tramos, cerrados };
}
