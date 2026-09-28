import type { CSSProperties } from "react";
import styles from "./Persiana.module.css";

export type Modo = "crema" | "terciopelo" | "noche";

const BARRAS = 8; // las mismas ocho barras de la Á del isotipo

/**
 * Transición entre dos secciones con distinto modo de color. Las barras del color
 * anterior se van afinando hasta desaparecer, como las rayas del isotipo:
 * una persiana que se abre hacia la sección siguiente.
 */
function rayas(color: string) {
  const periodo = 100 / BARRAS;
  const tramos = Array.from({ length: BARRAS }, (_, i) => {
    const inicio = i * periodo;
    const grosor = periodo * (1 - (i + 1) / (BARRAS + 1));
    const fin = inicio + grosor;
    return `${color} ${inicio}% ${fin}%, transparent ${fin}% ${inicio + periodo}%`;
  });
  return `linear-gradient(to bottom, ${tramos.join(", ")})`;
}

export function Persiana({ desde }: { desde: Modo }) {
  const style: CSSProperties = { backgroundImage: rayas(`var(--c-${desde})`) };
  return <div className={styles.persiana} style={style} aria-hidden="true" />;
}
