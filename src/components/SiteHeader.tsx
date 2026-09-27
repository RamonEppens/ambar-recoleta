import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { Isotipo } from "./Isotipo";
import { LanguageSwitch } from "./LanguageSwitch";
import styles from "./SiteHeader.module.css";

/** Server Component: solo el selector de idioma baja JavaScript al navegador. */
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
      <LanguageSwitch current={lang} label={dict.a11y.language} />
    </header>
  );
}
