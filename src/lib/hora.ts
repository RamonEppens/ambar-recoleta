import type { Locale } from "../i18n/config";

const dosDigitos = (n: number) => String(n).padStart(2, "0");

/** Hora para usar dentro de una frase: "la 1", "las 23:30" · "1 am", "11:30 pm". */
export function horaEnFrase(locale: Locale, hora: string) {
  const [h, m] = hora.split(":").map(Number);
  const minutos = m ? `:${dosDigitos(m)}` : "";

  if (locale === "en") {
    if (h === 0 && m === 0) return "midnight";
    return `${h % 12 || 12}${minutos} ${h < 12 ? "am" : "pm"}`;
  }
  if (h === 0 && m === 0) return "la medianoche";
  return `${h === 1 ? "la" : "las"} ${h}${minutos}`;
}

/** Rango corto, como en su historia de Instagram: "17 a 01 hs" · "5 pm – 1 am". */
export function rangoHorario(locale: Locale, abre: string, cierra: string) {
  if (locale === "en")
    return `${horaEnFrase("en", abre)} – ${horaEnFrase("en", cierra)}`;
  const corta = (hora: string) =>
    hora.endsWith(":00") ? hora.slice(0, 2) : hora;
  return `${corta(abre)} a ${corta(cierra)} hs`;
}
