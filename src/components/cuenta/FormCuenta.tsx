"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import {
  ingresarCliente,
  ingresarConGoogle,
  registrarse,
  type EstadoCuenta,
} from "@/lib/cuentas/acciones";
import styles from "./cuenta.module.css";

type Props = {
  modo: "ingreso" | "registro";
  lang: Locale;
  siguiente: string;
  errorInicial?: string;
  t: Dictionary["cuenta"];
};

/**
 * Ingresar o crear cuenta. useActionState conecta el formulario con la Server
 * Action (estado "enviando" y error que devuelve). Funciona aun antes de que
 * cargue el JavaScript: es un <form> común que se envía al servidor.
 */
export function FormCuenta({ modo, lang, siguiente, errorInicial, t }: Props) {
  const [estado, enviar, pendiente] = useActionState<EstadoCuenta, FormData>(
    modo === "ingreso" ? ingresarCliente : registrarse,
    { error: errorInicial },
  );
  const error = estado.error
    ? (t.errores[estado.error as keyof typeof t.errores] ?? t.errores.general)
    : null;
  const ocultos = (
    <>
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="siguiente" value={siguiente} />
    </>
  );

  return (
    <div className={styles.caja}>
      <form action={ingresarConGoogle}>
        {ocultos}
        <button type="submit" className={`boton ${styles.google}`}>
          <svg aria-hidden="true" viewBox="0 0 48 48" width="18" height="18">
            <path
              fill="#EA4335"
              d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.6 5.4 2.6 13.3l7.8 6C12.3 13.6 17.6 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.1 24.6c0-1.6-.1-3.1-.4-4.6H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17z"
            />
            <path
              fill="#FBBC05"
              d="M10.4 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.2.8-4.7l-7.8-6C.9 16.6 0 20.2 0 24s.9 7.4 2.6 10.7l7.8-6z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.4 0-11.7-4.1-13.6-9.8l-7.8 6C6.6 42.6 14.6 48 24 48z"
            />
          </svg>
          {t.google}
        </button>
      </form>

      <p className={styles.separador}>{t.o}</p>

      <form action={enviar} className={styles.form}>
        {ocultos}
        {modo === "registro" && (
          <div className={styles.campo}>
            <label htmlFor="cuenta-nombre">{t.nombre}</label>
            <input
              id="cuenta-nombre"
              name="nombre"
              autoComplete="name"
              defaultValue={estado.nombre}
              required
              minLength={2}
            />
          </div>
        )}
        <div className={styles.campo}>
          <label htmlFor="cuenta-email">{t.email}</label>
          <input
            id="cuenta-email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={estado.email}
            required
          />
        </div>
        <div className={styles.campo}>
          <label htmlFor="cuenta-password">{t.password}</label>
          <input
            id="cuenta-password"
            name="password"
            type="password"
            autoComplete={
              modo === "ingreso" ? "current-password" : "new-password"
            }
            minLength={modo === "registro" ? 8 : undefined}
            aria-describedby={
              modo === "registro" ? "cuenta-password-ayuda" : undefined
            }
            required
          />
          {modo === "registro" && (
            <p id="cuenta-password-ayuda" className={styles.ayuda}>
              {t.passwordAyuda}
            </p>
          )}
        </div>
        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}
        <button type="submit" className="boton" disabled={pendiente}>
          {modo === "ingreso"
            ? pendiente
              ? t.entrando
              : t.entrar
            : pendiente
              ? t.creando
              : t.crear}
        </button>
      </form>

      <p className={styles.alternar}>
        {modo === "ingreso" ? t.sinCuenta : t.conCuenta}{" "}
        <Link
          href={`/${lang}/${modo === "ingreso" ? "registro" : "ingresar"}?siguiente=${encodeURIComponent(siguiente)}`}
        >
          {modo === "ingreso" ? t.irRegistro : t.irIngreso}
        </Link>
      </p>
    </div>
  );
}
