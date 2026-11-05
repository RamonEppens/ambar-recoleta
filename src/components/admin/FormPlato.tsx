"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { esquemaPlato, type DatosPlato } from "@/lib/esquemas";
import { Campo, aNumero, atributosDeCampo } from "./Campo";
import styles from "./Formulario.module.css";
import { pedirJson, useFormulario } from "./useFormulario";

export type OpcionSeccion = { id: string; nombre: string };

type Props = {
  secciones: OpcionSeccion[];
  /** Sin `slugOriginal`, el formulario crea (POST); con él, edita (PATCH). */
  slugOriginal?: string;
  inicial: DatosPlato;
};

/** En los inputs, los números van como texto: se ve exactamente lo que se escribió. */
type Valores = Omit<DatosPlato, "precio" | "orden"> & {
  precio: string;
  orden: string;
};

/** Crear o editar un plato o trago de la carta. */
export function FormPlato({ secciones, slugOriginal, inicial }: Props) {
  const router = useRouter();
  const { valores, cambiar, tocar, error, estado, alEnviar } = useFormulario({
    esquema: esquemaPlato,
    inicial: {
      ...inicial,
      precio: inicial.precio === null ? "" : String(inicial.precio),
      orden: String(inicial.orden),
    } satisfies Valores,
    aDatos: (v: Valores) => ({
      ...v,
      precio: aNumero(v.precio),
      orden: aNumero(v.orden) ?? 0,
    }),
    enviar: (datos) =>
      slugOriginal
        ? pedirJson(`/api/v1/platos/${slugOriginal}`, "PATCH", datos)
        : pedirJson("/api/v1/platos", "POST", datos),
    alGuardar: () => {
      router.push("/admin/platos");
      router.refresh(); // la lista se vuelve a pedir al servidor, con el cambio
    },
  });

  // Atajo: los atributos de accesibilidad y el "tocado" al salir del campo.
  const campo = (nombre: keyof DatosPlato, ayuda?: string) => ({
    ...atributosDeCampo(nombre, error(nombre), ayuda),
    onBlur: () => tocar(nombre),
  });

  return (
    <form className={styles.form} onSubmit={alEnviar} noValidate>
      <Campo nombre="nombre" etiqueta="Nombre" error={error("nombre")}>
        <input
          {...campo("nombre")}
          value={valores.nombre}
          onChange={(e) => cambiar("nombre", e.target.value)}
          autoComplete="off"
        />
      </Campo>

      <div className={styles.fila}>
        <Campo nombre="seccionId" etiqueta="Sección" error={error("seccionId")}>
          <select
            {...campo("seccionId")}
            value={valores.seccionId}
            onChange={(e) => cambiar("seccionId", e.target.value)}
          >
            <option value="">Elegí una sección</option>
            {secciones.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
        </Campo>

        <Campo
          nombre="precio"
          etiqueta="Precio (pesos)"
          error={error("precio")}
          ayuda="Vacío si no lleva precio en la carta."
        >
          <input
            {...campo("precio", "Vacío si no lleva precio en la carta.")}
            inputMode="numeric"
            value={valores.precio}
            onChange={(e) => cambiar("precio", e.target.value)}
          />
        </Campo>
      </div>

      <Campo
        nombre="descripcionEs"
        etiqueta="Descripción en castellano"
        error={error("descripcionEs")}
      >
        <textarea
          {...campo("descripcionEs")}
          value={valores.descripcionEs}
          onChange={(e) => cambiar("descripcionEs", e.target.value)}
        />
      </Campo>

      <Campo
        nombre="descripcionEn"
        etiqueta="Descripción en inglés"
        error={error("descripcionEn")}
      >
        <textarea
          {...campo("descripcionEn")}
          value={valores.descripcionEn}
          onChange={(e) => cambiar("descripcionEn", e.target.value)}
          lang="en"
        />
      </Campo>

      <div className={styles.fila}>
        <Campo
          nombre="slug"
          etiqueta="Slug"
          error={error("slug")}
          ayuda="Identificador en la URL de la API. Ej.: tartar-de-ciervo."
        >
          <input
            {...campo(
              "slug",
              "Identificador en la URL de la API. Ej.: tartar-de-ciervo.",
            )}
            value={valores.slug}
            onChange={(e) => cambiar("slug", e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        </Campo>

        <Campo
          nombre="orden"
          etiqueta="Orden"
          error={error("orden")}
          ayuda="Menor número, más arriba en su sección."
        >
          <input
            {...campo("orden", "Menor número, más arriba en su sección.")}
            inputMode="numeric"
            value={valores.orden}
            onChange={(e) => cambiar("orden", e.target.value)}
          />
        </Campo>
      </div>

      <label className={styles.casilla}>
        <input
          type="checkbox"
          name="activo"
          checked={valores.activo}
          onChange={(e) => cambiar("activo", e.target.checked)}
        />
        Visible en la carta
      </label>

      {estado.tipo === "error" && (
        <p role="alert" className={styles.errorGeneral}>
          {estado.mensaje}
        </p>
      )}

      <div className={styles.acciones}>
        <button
          type="submit"
          className="boton"
          disabled={estado.tipo === "enviando"}
        >
          {estado.tipo === "enviando"
            ? "Guardando…"
            : slugOriginal
              ? "Guardar cambios"
              : "Crear plato"}
        </button>
        <Link href="/admin/platos">Cancelar</Link>
      </div>
    </form>
  );
}
