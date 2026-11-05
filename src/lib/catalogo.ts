/*
 * Búsqueda y filtros de la carta. Lógica pura: la usan la API
 * (/api/v1/platos) y el buscador de la página de la carta, así las dos
 * responden lo mismo ante la misma búsqueda.
 */
import type { Carta, Plato } from "./tipos";

export type FiltrosPlatos = {
  carta?: Carta["id"];
  /** Texto libre: busca en el nombre y en la descripción, en los dos idiomas. */
  q?: string;
  /** Precio máximo en pesos. Los platos sin precio no pasan este filtro. */
  precioMax?: number;
};

export type PlatoEncontrado = Plato & {
  carta: Carta["id"];
  seccion: string;
};

/** "Tártaro" y "tartaro" son la misma búsqueda: minúsculas y sin tildes. */
export function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

/** El texto donde se busca un plato: nombre y descripción en los dos idiomas. */
export const textoBuscable = (plato: Plato) =>
  normalizar(
    [plato.nombre, plato.descripcion.es, plato.descripcion.en].join(" "),
  );

/**
 * Cada palabra de la búsqueda tiene que aparecer en el plato, en cualquier
 * orden: "ciervo tartar" encuentra "Tartar de ciervo".
 */
export function coincide(plato: Plato, q: string) {
  const palabras = normalizar(q).split(/\s+/).filter(Boolean);
  const texto = textoBuscable(plato);
  return palabras.every((palabra) => texto.includes(palabra));
}

/** Aplana las cartas en una lista de platos y aplica los filtros. */
export function filtrarPlatos(
  cartas: Carta[],
  { carta, q, precioMax }: FiltrosPlatos,
): PlatoEncontrado[] {
  return cartas
    .filter((c) => !carta || c.id === carta)
    .flatMap((c) =>
      c.secciones.flatMap((s) =>
        s.platos.map((p) => ({ ...p, carta: c.id, seccion: s.id })),
      ),
    )
    .filter((p) => !q || coincide(p, q))
    .filter(
      (p) =>
        precioMax === undefined || (p.precio !== null && p.precio <= precioMax),
    );
}
