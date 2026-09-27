import "server-only";
import type { Locale } from "./config";

/** El diccionario en español es la fuente de verdad del formato. */
export type Dictionary = typeof import("./dictionaries/es.json");

/**
 * Carga perezosa: cada request solo importa el idioma que necesita.
 * El tipo obliga a que en.json tenga exactamente las mismas claves que es.json:
 * si falta una traducción, falla el typecheck (y por lo tanto el CI).
 */
const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  es: () => import("./dictionaries/es.json").then((m) => m.default),
  en: () => import("./dictionaries/en.json").then((m) => m.default),
};

export const getDictionary = (locale: Locale) => dictionaries[locale]();
