"use client";

import { useSyncExternalStore } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { completar } from "@/i18n/completar";
import { calcularAhora, type Ahora as Estado } from "@/lib/ahora";
import { horaEnFrase } from "@/lib/hora";
import styles from "./Ahora.module.css";

/*
 * El reloj es un "sistema externo" a React, así que nos suscribimos con
 * useSyncExternalStore: se re-renderiza solo cuando cambia el minuto.
 *
 * En el servidor (build estático) la hora no existe: getServerSnapshot devuelve
 * null y no se muestra nada. Si calculáramos la hora en el build, quedaría
 * congelada en el momento del deploy. En el navegador aparece la hora real.
 */
const suscribir = (avisar: () => void) => {
  const id = setInterval(avisar, 15_000);
  return () => clearInterval(id);
};
const minutoActual = () => Math.floor(Date.now() / 60_000);
const enServidor = () => null;

function describir(
  estado: Estado,
  lang: Locale,
  t: Dictionary["ahora"],
  dias: string[],
) {
  const hora = (h: string) => horaEnFrase(lang, h);

  switch (estado.estado) {
    case "aperitivo":
    case "cena":
      return `${t[estado.estado]} · ${completar(t.cocina, { hora: hora(estado.cocinaHasta) })}`;
    case "barra":
      return completar(t.barra, { hora: hora(estado.cierra) });
    case "cerrado": {
      const plantilla =
        estado.cuando === "hoy"
          ? t.cerradoHoy
          : estado.cuando === "manana"
            ? t.cerradoManana
            : t.cerrado;
      return completar(plantilla, {
        hora: hora(estado.abre),
        dia: dias[estado.dia],
      });
    }
  }
}

type AhoraProps = { lang: Locale; t: Dictionary["ahora"]; dias: string[] };

export function Ahora({ lang, t, dias }: AhoraProps) {
  const minuto = useSyncExternalStore<number | null>(
    suscribir,
    minutoActual,
    enServidor,
  );

  // Mismo alto antes y después de calcular la hora: el header no "salta".
  if (minuto === null) return <p className={styles.ahora} aria-hidden="true" />;

  const estado = calcularAhora(new Date(minuto * 60_000));
  const abierto = estado.estado !== "cerrado";

  return (
    <p className={styles.ahora} data-abierto={abierto}>
      <span className={styles.label}>{t.label}</span>
      <span>
        {describir(estado, lang, t, dias)}
        {"dj" in estado && estado.dj && (
          <span className={styles.dj}> · {t.dj}</span>
        )}
      </span>
    </p>
  );
}
