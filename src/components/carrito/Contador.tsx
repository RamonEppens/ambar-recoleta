"use client";

import styles from "./carrito.module.css";

type Props = {
  valor: number;
  maximo: number;
  alCambiar: (n: number) => void;
  etiqueta: string;
  textos: { menos: string; mas: string };
};

/** − 2 + : cantidad con botones grandes (fácil en el celular) y accesibles. */
export function Contador({
  valor,
  maximo,
  alCambiar,
  etiqueta,
  textos,
}: Props) {
  return (
    <div className={styles.contador} role="group" aria-label={etiqueta}>
      <button
        type="button"
        onClick={() => alCambiar(valor - 1)}
        disabled={valor <= 1}
        aria-label={textos.menos}
      >
        −
      </button>
      <output aria-live="polite">{valor}</output>
      <button
        type="button"
        onClick={() => alCambiar(valor + 1)}
        disabled={valor >= maximo}
        aria-label={textos.mas}
      >
        +
      </button>
    </div>
  );
}
