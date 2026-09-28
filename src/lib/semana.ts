import type { Jornada } from "../data/horarios";

export type Tramo = {
  desde: number;
  hasta: number;
  abre: string;
  cierra: string;
};

const ORDEN = [1, 2, 3, 4, 5, 6, 0]; // lunes primero, domingo al final

/** Agrupa días seguidos con el mismo horario: martes a jueves, 17 a 01. */
export function agruparSemana(semana: readonly (Jornada | null)[]) {
  const tramos: Tramo[] = [];
  const cerrados: number[] = [];

  for (const dia of ORDEN) {
    const jornada = semana[dia];
    if (!jornada) {
      cerrados.push(dia);
      continue;
    }
    const ultimo = tramos.at(-1);
    const seguido =
      ultimo && ORDEN.indexOf(ultimo.hasta) === ORDEN.indexOf(dia) - 1;
    if (
      seguido &&
      ultimo.abre === jornada.abre &&
      ultimo.cierra === jornada.cierra
    ) {
      ultimo.hasta = dia;
    } else {
      tramos.push({
        desde: dia,
        hasta: dia,
        abre: jornada.abre,
        cierra: jornada.cierra,
      });
    }
  }
  return { tramos, cerrados };
}
