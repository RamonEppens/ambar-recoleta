import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { enlaces } from "@/data/enlaces";
import type { Semana } from "@/lib/tipos";
import { Horarios } from "./Horarios";
import { Isotipo } from "./Isotipo";
import styles from "./SiteFooter.module.css";

/**
 * Server Component: los horarios llegan desde el layout (Supabase), los mismos que usa "Ahora".
 * Va en modo noche: es el final del recorrido de la página.
 */
export function SiteFooter({
  lang,
  dict,
  semana,
}: {
  lang: Locale;
  dict: Dictionary;
  semana: Semana;
}) {
  const t = dict.footer;

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
          <Horarios lang={lang} dict={dict} semana={semana} />
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
