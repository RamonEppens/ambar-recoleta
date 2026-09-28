import {
  semana as semanaAmbar,
  ZONA_HORARIA,
  type Jornada,
} from "../data/horarios";

const DIA = 24 * 60;

export type Ahora =
  | {
      estado: "aperitivo" | "cena";
      cocinaHasta: string;
      cierra: string;
      dj: boolean;
    }
  | { estado: "barra"; cierra: string; dj: boolean }
  | {
      estado: "cerrado";
      abre: string;
      dia: number;
      cuando: "hoy" | "manana" | "otro";
    };

/** "17:00" → 1020 */
export function aMinutos(hora: string) {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

/** Minuto dentro de la jornada: lo que es "antes" de la apertura en realidad es de madrugada. */
function enJornada(jornada: Jornada, hora: string) {
  const minutos = aMinutos(hora);
  return minutos < aMinutos(jornada.abre) ? minutos + DIA : minutos;
}

/** Día y minuto en Buenos Aires, sin importar la zona horaria de quien visita la web. */
export function relojBuenosAires(fecha: Date) {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: ZONA_HORARIA,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(fecha);
  const valor = (tipo: Intl.DateTimeFormatPartTypes) =>
    partes.find((parte) => parte.type === tipo)?.value ?? "";

  return {
    dia: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
      valor("weekday"),
    ),
    minuto: Number(valor("hour")) * 60 + Number(valor("minute")),
  };
}

/** Estado dentro de una jornada, o null si en ese minuto está cerrada. */
function estadoEnJornada(jornada: Jornada, minuto: number): Ahora | null {
  if (
    minuto < aMinutos(jornada.abre) ||
    minuto >= enJornada(jornada, jornada.cierra)
  )
    return null;

  const dj =
    jornada.djDesde !== undefined &&
    minuto >= enJornada(jornada, jornada.djDesde);
  const { cierra, cocinaHasta } = jornada;

  if (minuto < enJornada(jornada, jornada.aperitivoHasta))
    return { estado: "aperitivo", cocinaHasta, cierra, dj };
  if (minuto < enJornada(jornada, cocinaHasta))
    return { estado: "cena", cocinaHasta, cierra, dj };
  return { estado: "barra", cierra, dj };
}

/**
 * Qué está pasando en Ámbar en este momento.
 * Primero mira la jornada de hoy; si no, la de ayer (la noche que sigue después
 * de medianoche); si no, está cerrado y busca la próxima apertura.
 */
export function calcularAhora(
  fecha: Date,
  semana: readonly (Jornada | null)[] = semanaAmbar,
): Ahora {
  const { dia, minuto } = relojBuenosAires(fecha);

  const hoy = semana[dia];
  const estadoHoy = hoy && estadoEnJornada(hoy, minuto);
  if (estadoHoy) return estadoHoy;

  const ayer = semana[(dia + 6) % 7];
  const estadoAyer = ayer && estadoEnJornada(ayer, minuto + DIA);
  if (estadoAyer) return estadoAyer;

  for (let dias = 0; dias <= 7; dias++) {
    const proximoDia = (dia + dias) % 7;
    const jornada = semana[proximoDia];
    if (!jornada || (dias === 0 && minuto >= aMinutos(jornada.abre))) continue;
    const cuando = dias === 0 ? "hoy" : dias === 1 ? "manana" : "otro";
    return { estado: "cerrado", abre: jornada.abre, dia: proximoDia, cuando };
  }
  throw new Error("La semana no tiene ningún día abierto.");
}
