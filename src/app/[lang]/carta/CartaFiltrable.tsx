"use client";

import { useId, useState } from "react";
import { Persiana, type Modo } from "@/components/Persiana";
import { completar } from "@/i18n/completar";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { coincide } from "@/lib/catalogo";
import { formatearPrecio } from "@/lib/precio";
import type { Carta } from "@/lib/tipos";
import styles from "./carta.module.css";

/* La carta aperitiva y la de cena van sobre el "papel" crema; los tragos, en terciopelo. */
const modos: Record<Carta["id"], Modo> = {
  aperitivo: "crema",
  cena: "crema",
  tragos: "terciopelo",
};

type Props = {
  lang: Locale;
  cartas: Carta[];
  /** Cuándo se sirve cada carta, ya armado en el servidor desde los horarios. */
  horarios: Record<Carta["id"], string>;
  t: Dictionary["carta"];
};

/**
 * Client Component: la carta completa con un buscador. La primera vez llega
 * renderizada desde el servidor (está en el HTML, la leen los buscadores y
 * funciona sin JavaScript); en el navegador, cada letra filtra al instante.
 * El criterio de búsqueda es el mismo `coincide` que usa /api/v1/platos.
 */
export function CartaFiltrable({ lang, cartas, horarios, t }: Props) {
  const [q, setQ] = useState("");
  const idBuscador = useId();
  const buscando = q.trim().length > 0;

  // Las mismas cartas, con solo los platos que coinciden. Sin búsqueda, todo.
  const visibles = cartas
    .map((carta) => ({
      ...carta,
      // Los títulos de sección se muestran si la carta tiene varias, aunque la búsqueda deje una.
      conTitulos: carta.secciones.length > 1,
      secciones: carta.secciones
        .map((s) => ({
          ...s,
          platos: buscando ? s.platos.filter((p) => coincide(p, q)) : s.platos,
        }))
        .filter((s) => s.platos.length > 0),
    }))
    .filter((carta) => carta.secciones.length > 0);

  const total = visibles
    .flatMap((c) => c.secciones)
    .reduce((n, s) => n + s.platos.length, 0);

  // "3 resultados": lo anuncia el lector de pantalla (aria-live) en cada búsqueda.
  const resumen = !buscando
    ? ""
    : total === 1
      ? t.buscar.resultadoUno
      : completar(t.buscar.resultados, { n: String(total) });

  return (
    <>
      <div className={styles.barra}>
        <nav aria-label={t.indice} className={styles.indice}>
          <ul>
            {visibles.map((carta) => (
              <li key={carta.id}>
                <a href={`#${carta.id}`}>{carta.titulo[lang]}</a>
              </li>
            ))}
          </ul>
        </nav>

        <search className={styles.buscador}>
          <label htmlFor={idBuscador} className={styles.etiqueta}>
            {t.buscar.etiqueta}
          </label>
          <div className={styles.campo}>
            <input
              id={idBuscador}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t.buscar.pista}
              autoComplete="off"
              enterKeyHint="search"
              aria-describedby={`${idBuscador}-resumen`}
            />
            {buscando && (
              <button
                type="button"
                className={styles.borrar}
                onClick={() => setQ("")}
                aria-label={t.buscar.borrar}
              >
                ×
              </button>
            )}
          </div>
          {/* aria-live: el lector de pantalla anuncia cuántos resultados hay */}
          <p
            id={`${idBuscador}-resumen`}
            className={styles.resumen}
            aria-live="polite"
          >
            {resumen}
          </p>
        </search>
      </div>

      {buscando && total === 0 && (
        <div className={styles.vacio}>
          <p>{completar(t.buscar.ninguno, { q: q.trim() })}</p>
          <button type="button" className="boton" onClick={() => setQ("")}>
            {t.buscar.borrar}
          </button>
        </div>
      )}

      {visibles.map((carta, i) => {
        const modo = modos[carta.id];
        const anterior = i === 0 ? "crema" : modos[visibles[i - 1].id];
        return (
          <section
            key={carta.id}
            id={carta.id}
            className={styles.carta}
            data-mode={modo}
            aria-labelledby={`${carta.id}-titulo`}
          >
            {anterior !== modo && <Persiana desde={anterior} />}
            <div className={styles.contenido}>
              <div className={styles.cabecera}>
                <h2 id={`${carta.id}-titulo`} className={styles.nombreCarta}>
                  {carta.titulo[lang]}
                </h2>
                <p className={styles.horario}>{horarios[carta.id]}</p>
              </div>

              {carta.secciones.map((seccion) => (
                <section key={seccion.id} className={styles.seccion}>
                  {carta.conTitulos && (
                    <h3 className={styles.nombreSeccion}>
                      {seccion.titulo[lang]}
                    </h3>
                  )}
                  <ul className={styles.platos}>
                    {seccion.platos.map((plato) => (
                      <li key={plato.id} className={styles.plato}>
                        <span className={styles.nombre}>{plato.nombre}</span>
                        {plato.precio !== null && (
                          <span className={styles.precio}>
                            {formatearPrecio(plato.precio, lang)}
                          </span>
                        )}
                        <span className={styles.descripcion}>
                          {plato.descripcion[lang]}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
