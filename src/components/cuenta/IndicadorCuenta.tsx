"use client";

import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { useSesion } from "./useSesion";

/** "Ingresar" o "Mi cuenta" en el menú (un <li>). Mientras carga, no muestra nada. */
export function IndicadorCuenta({
  lang,
  textos,
  className,
}: {
  lang: Locale;
  textos: { ingresar: string; miCuenta: string };
  className?: string;
}) {
  const sesion = useSesion();
  if (sesion === undefined) return null;
  return (
    <li>
      <Link
        href={sesion ? `/${lang}/cuenta` : `/${lang}/ingresar`}
        className={className}
      >
        {sesion ? textos.miCuenta : textos.ingresar}
      </Link>
    </li>
  );
}
