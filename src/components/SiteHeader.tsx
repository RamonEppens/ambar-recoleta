import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { Ahora } from "./Ahora";
import { Isotipo } from "./Isotipo";
import { LanguageSwitch } from "./LanguageSwitch";
import { Navegacion } from "./Navegacion";
import styles from "./SiteHeader.module.css";

/**
 * Server Component con dos filas: una franja con el estado del local y el idioma,
 * y la fila principal con el isotipo y la navegación.
 * Solo "Ahora", el selector de idioma y el menú bajan JavaScript al navegador.
 */
export function SiteHeader({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  return (
    <header className={styles.header}>
      <div className={styles.franja}>
        <Ahora lang={lang} t={dict.ahora} dias={dict.dias} />
        <LanguageSwitch current={lang} label={dict.a11y.language} />
      </div>
      <div className={styles.principal}>
        <Link
          href={`/${lang}`}
          className={styles.home}
          aria-label={dict.a11y.home}
        >
          <Isotipo className={styles.isotipo} />
        </Link>
        <Navegacion lang={lang} t={dict.nav} />
      </div>
    </header>
  );
}
