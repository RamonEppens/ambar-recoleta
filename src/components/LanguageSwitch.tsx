"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localeNames, locales, type Locale } from "@/i18n/config";
import styles from "./LanguageSwitch.module.css";

const localePrefix = new RegExp(`^/(${locales.join("|")})(?=/|$)`);

/**
 * Client Component porque necesita la URL actual (usePathname) para
 * mandarte a la misma página en el otro idioma: /es/carta ↔ /en/carta.
 * Es una hoja del árbol, como se vio en clase: todo lo demás sigue en el servidor.
 */
export function LanguageSwitch({
  current,
  label,
}: {
  current: Locale;
  label: string;
}) {
  const pathname = usePathname();
  const rest = pathname.replace(localePrefix, "");

  return (
    <nav aria-label={label}>
      <ul className={styles.list}>
        {locales.map((locale) => (
          <li key={locale}>
            <Link
              className={styles.link}
              href={`/${locale}${rest}`}
              hrefLang={locale}
              lang={locale}
              aria-label={localeNames[locale]}
              aria-current={locale === current ? "true" : undefined}
            >
              {locale.toUpperCase()}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
