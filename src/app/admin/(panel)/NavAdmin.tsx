"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../admin.module.css";

const secciones = [
  { href: "/admin/platos", texto: "Carta" },
  { href: "/admin/experiencias", texto: "Experiencias" },
];

export function NavAdmin() {
  const pathname = usePathname();
  return (
    <nav aria-label="Secciones del admin" className={styles.nav}>
      <ul>
        {secciones.map(({ href, texto }) => (
          <li key={href}>
            <Link
              href={href}
              aria-current={
                pathname === href
                  ? "page"
                  : pathname.startsWith(`${href}/`)
                    ? "true"
                    : undefined
              }
            >
              {texto}
            </Link>
          </li>
        ))}
        <li>
          <a href="/es" target="_blank" rel="noopener">
            Ver el sitio ↗
          </a>
        </li>
      </ul>
    </nav>
  );
}
