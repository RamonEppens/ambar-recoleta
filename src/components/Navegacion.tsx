"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { enlaces } from "@/data/enlaces";
import styles from "./Navegacion.module.css";

type NavegacionProps = { lang: Locale; t: Dictionary["nav"] };

/**
 * Client Component: necesita saber la página actual (para marcarla) y abrir o
 * cerrar el menú en el celular.
 *
 * El `key={pathname}` hace que React cree el menú de nuevo en cada navegación,
 * así se cierra solo al cambiar de página, sin un useEffect que lo sincronice.
 */
export function Navegacion(props: NavegacionProps) {
  const pathname = usePathname();
  return <Menu key={pathname} pathname={pathname} {...props} />;
}

function Menu({ lang, t, pathname }: NavegacionProps & { pathname: string }) {
  const [abierto, setAbierto] = useState(false);
  const boton = useRef<HTMLButtonElement>(null);

  const secciones = [
    { href: `/${lang}/carta`, texto: t.carta },
    { href: `/${lang}/espacio`, texto: t.espacio },
    { href: `/${lang}/musica`, texto: t.musica },
  ];

  // Escape cierra el menú y devuelve el foco al botón, como en cualquier menú accesible.
  const alPresionarTecla = (evento: React.KeyboardEvent) => {
    if (evento.key === "Escape" && abierto) {
      setAbierto(false);
      boton.current?.focus();
    }
  };

  return (
    <nav
      aria-label={t.principal}
      className={styles.nav}
      onKeyDown={alPresionarTecla}
    >
      <button
        ref={boton}
        type="button"
        className={styles.toggle}
        aria-expanded={abierto}
        aria-controls="menu-principal"
        onClick={() => setAbierto(!abierto)}
      >
        {abierto ? t.cerrar : t.menu}
      </button>

      <ul id="menu-principal" className={styles.lista} data-abierto={abierto}>
        {secciones.map(({ href, texto }) => (
          <li key={href}>
            <Link
              href={href}
              className={styles.link}
              aria-current={pathname === href ? "page" : undefined}
            >
              {texto}
            </Link>
          </li>
        ))}
        <li className={styles.reservar}>
          <a className="boton" href={enlaces.reservas}>
            {t.reservar}
          </a>
        </li>
      </ul>
    </nav>
  );
}
