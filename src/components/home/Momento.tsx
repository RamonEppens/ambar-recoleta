import Link from "next/link";
import type { ReactNode } from "react";
import type { FotoId } from "@/data/fotos";
import type { Dictionary } from "@/i18n/dictionaries";
import { Foto } from "../Foto";
import { Persiana, type Modo } from "../Persiana";
import styles from "./Momento.module.css";

type MomentoProps = {
  id: string;
  modo: Modo;
  /** Modo de la sección anterior: si es distinto, se dibuja la persiana de transición. */
  desde: Modo;
  etiqueta: string;
  titulo: string;
  texto: string;
  link: { href: string; texto: string };
  fotos: [FotoId, FotoId?];
  alts: Dictionary["fotos"];
  /** De qué lado va la foto principal en pantallas anchas. */
  lado?: "izquierda" | "derecha";
  children?: ReactNode;
};

/** Una de las secciones de la home: la tarde, la cena, la previa, lo que viene después. */
export function Momento({
  id,
  modo,
  desde,
  etiqueta,
  titulo,
  texto,
  link,
  fotos: [principal, secundaria],
  alts,
  lado = "derecha",
  children,
}: MomentoProps) {
  const tituloId = `${id}-titulo`;

  return (
    <section
      className={styles.momento}
      data-mode={modo}
      aria-labelledby={tituloId}
    >
      {desde !== modo && <Persiana desde={desde} />}
      <div className={styles.grilla} data-lado={lado}>
        <div className={styles.texto}>
          <p className={styles.etiqueta}>{etiqueta}</p>
          <h2 id={tituloId} className={styles.titulo}>
            {titulo}
          </h2>
          <p className={styles.bajada}>{texto}</p>
          {children}
          <Link className={styles.link} href={link.href}>
            {link.texto}
          </Link>
        </div>

        <div className={styles.fotos}>
          <Foto
            id={principal}
            alts={alts}
            className={styles.principal}
            sizes="(min-width: 48rem) 45vw, 100vw"
          />
          {secundaria && (
            <Foto
              id={secundaria}
              alts={alts}
              className={styles.secundaria}
              sizes="(min-width: 48rem) 20vw, 45vw"
            />
          )}
        </div>
      </div>
    </section>
  );
}
