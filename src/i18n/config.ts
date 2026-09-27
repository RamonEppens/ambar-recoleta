export const locales = ["es", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "es";

/** Autónimos: cada idioma se nombra en su propio idioma, así que no se traducen. */
export const localeNames: Record<Locale, string> = {
  es: "Español",
  en: "English",
};

export const hasLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);
