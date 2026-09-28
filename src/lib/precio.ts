import type { Locale } from "../i18n/config";

const formatos: Record<Locale, Intl.NumberFormat> = {
  es: new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }),
  en: new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }),
};

/**
 * Ámbar publica los precios en miles de pesos ("29" = $29.000).
 * En la web los mostramos completos: un turista no sabe que "29" son miles.
 */
export function formatearPrecio(miles: number, locale: Locale) {
  return formatos[locale].format(miles * 1000);
}
