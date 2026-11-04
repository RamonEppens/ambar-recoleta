import type { Metadata } from "next";
import Link from "next/link";
import { Isotipo } from "@/components/Isotipo";
import { getDictionary } from "@/i18n/dictionaries";
import "@/styles/globals.css";
import styles from "./global-not-found.module.css";

/*
 * 404 global: se muestra para cualquier URL que no existe.
 * Next la renderiza sin pasar por el layout (que vive en [lang]), por eso
 * incluye su propio <html> y los estilos globales. Como acá no sabemos el
 * idioma, muestra los dos. Next le agrega noindex automáticamente.
 */
export const metadata: Metadata = {
  title: "404 · Ámbar Recoleta",
};

export default async function GlobalNotFound() {
  const [es, en] = await Promise.all([
    getDictionary("es"),
    getDictionary("en"),
  ]);

  return (
    <html lang="es">
      <body data-mode="noche">
        <main className={styles.main}>
          <Link href="/es" aria-label={es.a11y.home} className={styles.home}>
            <Isotipo className={styles.isotipo} />
          </Link>
          <p className={styles.codigo}>404</p>
          <h1 className={styles.titulo}>{es.noEncontrada.titulo}</h1>
          <p className={styles.texto}>{es.noEncontrada.texto}</p>
          <div className={styles.acciones}>
            <Link className="boton" href="/es/carta">
              {es.noEncontrada.carta}
            </Link>
            <Link className="boton boton-secundario" href="/es">
              {es.noEncontrada.inicio}
            </Link>
          </div>
          <p className={styles.ingles} lang="en">
            {en.noEncontrada.titulo} {en.noEncontrada.texto}{" "}
            <Link href="/en/carta">{en.noEncontrada.carta}</Link>
          </p>
        </main>
      </body>
    </html>
  );
}
