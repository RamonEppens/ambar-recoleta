import styles from "./MapaCuadra.module.css";

type MapaCuadraProps = {
  titulo: string;
  calle: string;
  cementerio: string;
  ambar: string;
};

/**
 * Croquis de la cuadra dibujado en SVG, en lugar de un mapa de Google embebido:
 * pesa casi nada, no carga scripts de terceros y usa los colores de la marca.
 * El cementerio va rayado como el isotipo. Para ir, está el link a Google Maps.
 */
export function MapaCuadra({
  titulo,
  calle,
  cementerio,
  ambar,
}: MapaCuadraProps) {
  return (
    <svg
      className={styles.mapa}
      viewBox="0 0 400 240"
      role="img"
      aria-labelledby="mapa-titulo"
    >
      <title id="mapa-titulo">{titulo}</title>
      <defs>
        <pattern id="rayas" width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="3" fill="currentColor" />
        </pattern>
      </defs>

      {/* Cementerio: la manzana de enfrente */}
      <rect
        x="20"
        y="16"
        width="360"
        height="92"
        fill="url(#rayas)"
        className={styles.manzana}
      />
      <text x="200" y="68" textAnchor="middle" className={styles.rotulo}>
        {cementerio}
      </text>

      {/* Calle Junín */}
      <line x1="0" y1="138" x2="400" y2="138" className={styles.calle} />
      <text x="24" y="132" className={styles.nombreCalle}>
        {calle}
      </text>

      {/* Nuestra vereda: los lotes y Ámbar */}
      {[20, 92, 164, 236, 308].map((x) => (
        <rect
          key={x}
          x={x}
          y="168"
          width="64"
          height="56"
          className={styles.lote}
        />
      ))}
      <rect x="164" y="168" width="64" height="56" className={styles.ambar} />
      <circle cx="196" cy="196" r="6" className={styles.punto} />
      <text x="196" y="160" textAnchor="middle" className={styles.rotuloAmbar}>
        {ambar}
      </text>
    </svg>
  );
}
