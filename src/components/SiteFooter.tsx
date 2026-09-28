import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { completar } from "@/i18n/completar";
import { enlaces } from "@/data/enlaces";
import { semana } from "@/data/horarios";
import { horaEnFrase, rangoHorario } from "@/lib/hora";
import { agruparSemana } from "@/lib/semana";
import { Isotipo } from "./Isotipo";
import styles from "./SiteFooter.module.css";

const mayuscula = (texto: string) =>
  texto.charAt(0).toUpperCase() + texto.slice(1);

/**
 * Server Component: los horarios salen del mismo archivo que usa "Ahora".
 * Va en modo noche: es el final del recorrido de la página.
 */
export function SiteFooter({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const t = dict.footer;
  const { tramos, cerrados } = agruparSemana(semana);
  const cocinaHasta = semana.find((jornada) => jornada !== null)?.cocinaHasta;

  return (
    <footer className={styles.footer} data-mode="noche">
      <div className={styles.inner}>
        <Isotipo className={styles.isotipo} />

        <address className={styles.bloque}>
          <p>{t.direccion}</p>
          <p>{t.ciudad}</p>
          <a href={enlaces.mapa}>{t.comoLlegar}</a>
        </address>

        <section className={styles.bloque} aria-labelledby="footer-horarios">
          <h2 id="footer-horarios" className={styles.titulo}>
            {t.horarios}
          </h2>
          <dl className={styles.horarios}>
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
        </section>

        <nav className={styles.bloque} aria-label={t.seguinos}>
          <ul className={styles.enlaces}>
            <li>
              <a href={enlaces.reservas}>{t.reservar}</a>
            </li>
            <li>
              <a href={enlaces.instagram}>Instagram</a>
            </li>
            <li>
              <a href={enlaces.colonia}>{t.musica}</a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
