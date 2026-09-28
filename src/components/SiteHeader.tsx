import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { Ahora } from "./Ahora";
import { Isotipo } from "./Isotipo";
import { LanguageSwitch } from "./LanguageSwitch";
import styles from "./SiteHeader.module.css";

/** Server Component: solo "Ahora" y el selector de idioma bajan JavaScript al navegador. */
export function SiteHeader({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  return (
    <header className={styles.header}>
      <Link
        href={`/${lang}`}
        className={styles.home}
        aria-label={dict.a11y.home}
      >
        <Isotipo className={styles.isotipo} />
      </Link>
      <div className={styles.ahora}>
        <Ahora lang={lang} t={dict.ahora} dias={dict.dias} />
      </div>
      <div className={styles.idioma}>
        <LanguageSwitch current={lang} label={dict.a11y.language} />
      </div>
    </header>
  );
}
