import type { Locale } from "@/i18n/config";
import { buscarPlato } from "@/data/carta";
import styles from "./Destacados.module.css";

/** Algunos platos o tragos de la carta, con el formato de su menú: nombre y descripción en itálica. */
export function Destacados({ ids, lang }: { ids: string[]; lang: Locale }) {
  return (
    <ul className={styles.lista}>
      {ids.map((id) => {
        const plato = buscarPlato(id);
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
