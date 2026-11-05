import type { ReactNode } from "react";
import styles from "./Campo.module.css";

type Props = {
  /** Nombre del campo: arma el id `campo-<nombre>` que usa el input. */
  nombre: string;
  etiqueta: string;
  error?: string;
  ayuda?: string;
  children: ReactNode;
};

/**
 * Etiqueta + input + ayuda + error. El input tiene que llevar
 * `{...atributosDeCampo(nombre, error, ayuda)}` para quedar conectado.
 */
export function Campo({ nombre, etiqueta, error, ayuda, children }: Props) {
  return (
    <div className={styles.campo} data-error={Boolean(error)}>
      <label htmlFor={`campo-${nombre}`}>{etiqueta}</label>
      {children}
      {ayuda && (
        <p id={`campo-${nombre}-ayuda`} className={styles.ayuda}>
          {ayuda}
        </p>
      )}
      {error && (
        <p id={`campo-${nombre}-error`} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}

/** id, aria-invalid y aria-describedby: el lector de pantalla lee el error al llegar al input. */
export function atributosDeCampo(
  nombre: string,
  error?: string,
  ayuda?: string,
) {
  const describe = [
    ayuda && `campo-${nombre}-ayuda`,
    error && `campo-${nombre}-error`,
  ].filter(Boolean);
  return {
    id: `campo-${nombre}`,
    name: nombre,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describe.length ? describe.join(" ") : undefined,
  } as const;
}

/** Texto de un input numérico → número. "" → null; algo que no es número → NaN (Zod lo rechaza). */
export const aNumero = (texto: string) =>
  texto.trim() === "" ? null : Number(texto.replace(/\./g, ""));
