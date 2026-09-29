import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { completar } from "@/i18n/completar";
import { semana } from "@/data/horarios";
import { horaEnFrase, rangoHorario } from "@/lib/hora";
import { agruparSemana } from "@/lib/semana";
import styles from "./Horarios.module.css";

const mayuscula = (texto: string) =>
  texto.charAt(0).toUpperCase() + texto.slice(1);

/**
 * Tabla de horarios agrupada ("Martes a jueves · 17 a 01 hs"), con la cocina y
 * los días cerrados. La usan el pie de página y la sección Visitanos.
 */
export function Horarios({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const t = dict.footer;
  const { tramos, cerrados } = agruparSemana(semana);
  const cocinaHasta = semana.find((jornada) => jornada !== null)?.cocinaHasta;

  return (
    <div className={styles.horarios}>
      <dl className={styles.tabla}>
        {tramos.map(({ desde, hasta, abre, cierra }) => (
          <div key={desde}>
            <dt>
              {mayuscula(
                desde === hasta
                  ? dict.dias[desde]
                  : completar(t.rangoDias, {
                      desde: dict.dias[desde],
                      hasta: dict.dias[hasta],
                    }),
              )}
            </dt>
            <dd>{rangoHorario(lang, abre, cierra)}</dd>
          </div>
        ))}
      </dl>
      {cocinaHasta && (
        <p className={styles.nota}>
          {mayuscula(
            completar(t.cocina, { hora: horaEnFrase(lang, cocinaHasta) }),
          )}
        </p>
      )}
      <p className={styles.nota}>
        {mayuscula(
          completar(t.cerrado, {
            dias: cerrados.map((dia) => dict.dias[dia]).join(` ${t.y} `),
          }),
        )}
      </p>
    </div>
  );
}
