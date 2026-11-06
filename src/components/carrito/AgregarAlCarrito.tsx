"use client";

import Link from "next/link";
import { useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { agregar } from "@/lib/carrito";
import { Contador } from "./Contador";
import styles from "./carrito.module.css";

/** En la página de una experiencia: elegir cuántas y sumarlas al carrito. */
export function AgregarAlCarrito({
  slug,
  cupos,
  lang,
  t,
}: {
  slug: string;
  cupos: number;
  lang: Locale;
  t: Dictionary["agregar"];
}) {
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);
  const maximo = Math.min(10, cupos);
  if (maximo < 1) return null;

  return (
    <div className={styles.agregar}>
      <Contador
        valor={cantidad}
        maximo={maximo}
        alCambiar={(n) => {
          setCantidad(n);
          setAgregado(false);
        }}
        etiqueta={t.cantidad}
        textos={t}
      />
      <button
        type="button"
        className="boton"
        onClick={() => {
          agregar(slug, cantidad);
          setAgregado(true);
        }}
      >
        {t.boton}
      </button>
      <p className={styles.agregado} role="status">
        {agregado && (
          <>
            {t.agregado} <Link href={`/${lang}/carrito`}>{t.verCarrito} →</Link>
          </>
        )}
      </p>
    </div>
  );
}
