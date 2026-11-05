import type { Locale } from "@/i18n/config";
import { buscarPlato } from "@/lib/mapear";
import type { Carta } from "@/lib/tipos";
import styles from "./Destacados.module.css";

/** Algunos platos o tragos de la carta, con el formato de su menú: nombre y descripción en itálica. */
export function Destacados({
  ids,
  lang,
  cartas,
}: {
  ids: string[];
  lang: Locale;
  cartas: Carta[];
}) {
  return (
    <ul className={styles.lista}>
      {ids.map((id) => {
        const plato = buscarPlato(cartas, id);
        // Si el admin desactivó el plato, simplemente no se muestra.
        if (!plato) return null;
        return (
          <li key={id} className={styles.plato}>
            <span className={styles.nombre}>{plato.nombre}</span>
            <span className={styles.descripcion}>
              {plato.descripcion[lang]}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
