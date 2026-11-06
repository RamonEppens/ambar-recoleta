"use client";

import Link from "next/link";
import { completar } from "@/i18n/completar";
import type { Locale } from "@/i18n/config";
import { useCarrito } from "./useCarrito";

/** "Carrito (3)" en el menú (un <li>). Solo aparece si hay algo en el carrito. */
export function IndicadorCarrito({
  lang,
  texto,
  className,
}: {
  lang: Locale;
  texto: string;
  className?: string;
}) {
  const items = useCarrito();
  const total = items.reduce((n, i) => n + i.cantidad, 0);
  if (total === 0) return null;
  return (
    <li>
      <Link href={`/${lang}/carrito`} className={className}>
        {completar(texto, { n: String(total) })}
      </Link>
    </li>
  );
}
