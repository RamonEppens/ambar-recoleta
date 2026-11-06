"use client";

import Link from "next/link";
import { Campo, atributosDeCampo } from "@/components/formulario/Campo";
import {
  pedirJson,
  useFormulario,
} from "@/components/formulario/useFormulario";
import { Contador } from "@/components/carrito/Contador";
import { useCarrito } from "@/components/carrito/useCarrito";
import { completar } from "@/i18n/completar";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { cambiarCantidad, quitar } from "@/lib/carrito";
import { esquemaPedido } from "@/lib/esquemas";
import { formatearPrecio } from "@/lib/precio";
import type { Experiencia } from "@/lib/tipos";
import styles from "./carrito.module.css";

type Props = {
  lang: Locale;
  experiencias: Experiencia[];
  t: Dictionary["carrito"];
  tAgregar: Dictionary["agregar"];
};

export function Carrito({ lang, experiencias, t, tAgregar }: Props) {
  const items = useCarrito();

  // Cada item del carrito con los datos de la experiencia (si sigue a la venta).
  const lineas = items.map((item) => ({
    ...item,
    experiencia: experiencias.find((e) => e.slug === item.slug),
  }));
  const total = lineas.reduce(
    (suma, l) => suma + (l.experiencia?.precio ?? 0) * l.cantidad,
    0,
  );
  const hayNoDisponibles = lineas.some(
    (l) => !l.experiencia || l.experiencia.cupos === 0,
  );

  const { valores, cambiar, tocar, error, estado, alEnviar } = useFormulario({
    esquema: esquemaPedido,
    inicial: { nombre: "", email: "" },
    aDatos: (v) => ({
      ...v,
      items: items.map(({ slug, cantidad }) => ({ slug, cantidad })),
      idioma: lang,
    }),
    enviar: async (datos) => {
      const respuesta = await pedirJson("/api/v1/pedidos", "POST", datos);
      if (respuesta.ok) {
        // A Checkout Pro: el pago se hace en Mercado Pago, no en el sitio.
        const { datos: pedido } = await respuesta.clone().json();
        window.location.assign(pedido.url);
      }
      return respuesta;
    },
    alGuardar: () => {}, // la página ya se está yendo a Mercado Pago
    textos: { sinConexion: t.errores.red, noGuardado: t.errores.general },
  });

  const traducir = (clave?: string) =>
    clave
      ? (t.errores[clave as keyof typeof t.errores] ?? t.errores.general)
      : undefined;

  if (items.length === 0) {
    return (
      <div className={styles.vacio}>
        <p>{t.vacio}</p>
        <Link className="boton" href={`/${lang}/experiencias`}>
          {t.verExperiencias}
        </Link>
      </div>
    );
  }

  // Después de un pedido creado, el estado queda en "enviando" mientras el navegador se va a MP.
  const yendo = estado.tipo === "enviando";

  return (
    <div className={styles.grilla}>
      <section aria-label={t.titulo}>
        <ul className={styles.lineas}>
          {lineas.map(({ slug, cantidad, experiencia }) => (
            <li key={slug} className={styles.linea}>
              <div>
                <p className={styles.nombre}>
                  {experiencia ? experiencia.nombre[lang] : slug}
                </p>
                {(!experiencia || experiencia.cupos === 0) && (
                  <p className={styles.aviso}>{t.agotada}</p>
                )}
              </div>
              {experiencia && experiencia.cupos > 0 && (
                <Contador
                  valor={cantidad}
                  maximo={Math.min(10, experiencia.cupos)}
                  alCambiar={(n) => cambiarCantidad(slug, n)}
                  etiqueta={completar(t.cantidad, {
                    nombre: experiencia.nombre[lang],
                  })}
                  textos={tAgregar}
                />
              )}
              <p className={styles.precio}>
                {experiencia
                  ? formatearPrecio(experiencia.precio * cantidad, lang)
                  : "—"}
              </p>
              <button
                type="button"
                className={styles.quitar}
                onClick={() => quitar(slug)}
              >
                {t.quitar}
              </button>
            </li>
          ))}
        </ul>
        <p className={styles.total}>
          <span>{t.total}</span>
          <span>{formatearPrecio(total, lang)}</span>
        </p>
      </section>

      <form className={styles.form} onSubmit={alEnviar} noValidate>
        <h2 className={styles.subtitulo}>{t.datosTitulo}</h2>
        <p className={styles.texto}>{t.datosTexto}</p>
        <Campo
          nombre="nombre"
          etiqueta={t.nombre}
          error={traducir(error("nombre"))}
        >
          <input
            {...atributosDeCampo("nombre", traducir(error("nombre")))}
            onBlur={() => tocar("nombre")}
            value={valores.nombre}
            onChange={(e) => cambiar("nombre", e.target.value)}
            autoComplete="name"
          />
        </Campo>
        <Campo
          nombre="email"
          etiqueta={t.email}
          error={traducir(error("email"))}
        >
          <input
            {...atributosDeCampo("email", traducir(error("email")))}
            onBlur={() => tocar("email")}
            type="email"
            value={valores.email}
            onChange={(e) => cambiar("email", e.target.value)}
            autoComplete="email"
          />
        </Campo>

        {estado.tipo === "error" && (
          <p role="alert" className={styles.errorGeneral}>
            {traducir(estado.codigo ?? "general")}
          </p>
        )}

        <button
          type="submit"
          className="boton"
          disabled={yendo || hayNoDisponibles}
        >
          {yendo ? t.yendo : t.pagar}
        </button>
        <p className={styles.texto}>{t.seguro}</p>
        <p className={styles.nota}>{t.nota}</p>
      </form>
    </div>
  );
}
