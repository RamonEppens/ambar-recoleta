"use client";

import { useEffect, useState } from "react";
import { completar } from "@/i18n/completar";
import type { Dictionary } from "@/i18n/dictionaries";

type Props = {
  slug: string;
  /** Los cupos al momento del build. Se muestran enseguida y después se actualizan. */
  inicial: number;
  t: Dictionary["experiencias"];
  className?: string;
};

/**
 * Cuántas quedan, consultado en vivo a /api/v1/experiencias/:slug.
 * La página es estática (se regenera cada hora), pero el stock cambia con cada
 * compra: por eso este dato se pide desde el navegador. Si la consulta falla,
 * queda el valor del build: es un dato orientativo, el stock real lo cuida la base
 * al confirmar el pago.
 */
export function Cupos({ slug, inicial, t, className }: Props) {
  const [cupos, setCupos] = useState(inicial);

  useEffect(() => {
    const control = new AbortController();
    fetch(`/api/v1/experiencias/${slug}`, { signal: control.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((cuerpo) => {
        if (typeof cuerpo?.datos?.cupos === "number")
          setCupos(cuerpo.datos.cupos);
      })
      .catch(() => {}); // sin red o cancelada: se queda el valor del build
    return () => control.abort(); // si se sale de la página antes de que responda
  }, [slug]);

  const texto =
    cupos === 0
      ? t.agotada
      : cupos === 1
        ? t.cupoUno
        : completar(t.cupos, { n: String(cupos) });

  return (
    <p className={className} aria-live="polite" data-agotada={cupos === 0}>
      {texto}
    </p>
  );
}
