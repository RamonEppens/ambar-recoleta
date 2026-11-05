"use client";

import { useActionState } from "react";
import { ingresar, type EstadoIngreso } from "../acciones";
import styles from "../admin.module.css";

/**
 * useActionState conecta el formulario con la Server Action: `pendiente`
 * mientras se envía, y el error que devuelve la acción si algo falla.
 * Funciona aunque el JavaScript todavía no haya cargado (envío HTML común).
 */
export function FormIngreso() {
  const [estado, enviar, pendiente] = useActionState<EstadoIngreso, FormData>(
    ingresar,
    {},
  );

  return (
    <form action={enviar} className={styles.formIngreso} noValidate>
      <div className={styles.campo}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          defaultValue={estado.email}
          required
        />
      </div>
      <div className={styles.campo}>
        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      {estado.error && (
        <p role="alert" className={styles.errorGeneral}>
          {estado.error}
        </p>
      )}
      <button type="submit" className="boton" disabled={pendiente}>
        {pendiente ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
