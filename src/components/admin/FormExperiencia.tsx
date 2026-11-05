"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { esquemaExperiencia, type DatosExperiencia } from "@/lib/esquemas";
import { Campo, aNumero, atributosDeCampo } from "./Campo";
import styles from "./Formulario.module.css";
import { pedirJson, useFormulario } from "./useFormulario";

type Props = {
  /** Las fotos del sitio que se pueden elegir: { id, descripción }. */
  fotos: { id: string; texto: string }[];
  slugOriginal?: string;
  inicial: DatosExperiencia;
};

type Valores = Omit<DatosExperiencia, "precio" | "cupos" | "orden" | "foto"> & {
  precio: string;
  cupos: string;
  orden: string;
  foto: string;
};

/** Crear o editar una experiencia para regalar: textos, precio, stock y foto. */
export function FormExperiencia({ fotos, slugOriginal, inicial }: Props) {
  const router = useRouter();
  const { valores, cambiar, tocar, error, estado, alEnviar } = useFormulario({
    esquema: esquemaExperiencia,
    inicial: {
      ...inicial,
      precio: String(inicial.precio || ""),
      cupos: String(inicial.cupos),
      orden: String(inicial.orden),
      foto: inicial.foto ?? "",
    } satisfies Valores,
    aDatos: (v: Valores) => ({
      ...v,
      precio: aNumero(v.precio),
      cupos: aNumero(v.cupos),
      orden: aNumero(v.orden) ?? 0,
      foto: v.foto || null,
    }),
    enviar: (datos) =>
      slugOriginal
        ? pedirJson(`/api/v1/experiencias/${slugOriginal}`, "PATCH", datos)
        : pedirJson("/api/v1/experiencias", "POST", datos),
    alGuardar: () => {
      router.push("/admin/experiencias");
      router.refresh();
    },
  });

  const campo = (nombre: keyof Valores, ayuda?: string) => ({
    ...atributosDeCampo(nombre, error(nombre), ayuda),
    onBlur: () => tocar(nombre),
  });

  const texto = (nombre: "nombreEs" | "nombreEn" | "slug", ayuda?: string) => ({
    ...campo(nombre, ayuda),
    value: valores[nombre],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      cambiar(nombre, e.target.value),
    autoComplete: "off",
  });

  return (
    <form className={styles.form} onSubmit={alEnviar} noValidate>
      <div className={styles.fila}>
        <Campo
          nombre="nombreEs"
          etiqueta="Nombre en castellano"
          error={error("nombreEs")}
        >
          <input {...texto("nombreEs")} />
        </Campo>
        <Campo
          nombre="nombreEn"
          etiqueta="Nombre en inglés"
          error={error("nombreEn")}
        >
          <input {...texto("nombreEn")} lang="en" />
        </Campo>
      </div>

      <Campo
        nombre="descripcionEs"
        etiqueta="Qué incluye (castellano)"
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
        etiqueta="Qué incluye (inglés)"
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
          nombre="precio"
          etiqueta="Precio (pesos)"
          error={error("precio")}
        >
          <input
            {...campo("precio")}
            inputMode="numeric"
            value={valores.precio}
            onChange={(e) => cambiar("precio", e.target.value)}
          />
        </Campo>
        <Campo
          nombre="cupos"
          etiqueta="Cupos"
          error={error("cupos")}
          ayuda="Cuántas quedan para vender. Baja sola con cada pago."
        >
          <input
            {...campo(
              "cupos",
              "Cuántas quedan para vender. Baja sola con cada pago.",
            )}
            inputMode="numeric"
            value={valores.cupos}
            onChange={(e) => cambiar("cupos", e.target.value)}
          />
        </Campo>
      </div>

      <div className={styles.fila}>
        <Campo nombre="foto" etiqueta="Foto" error={error("foto")}>
          <select
            {...campo("foto")}
            value={valores.foto}
            onChange={(e) => cambiar("foto", e.target.value)}
          >
            <option value="">La foto por defecto (la barra)</option>
            {fotos.map((f) => (
              <option key={f.id} value={f.id}>
                {f.texto}
              </option>
            ))}
          </select>
        </Campo>
        <Campo
          nombre="slug"
          etiqueta="Slug"
          error={error("slug")}
          ayuda="Va en la URL: /experiencias/cena-para-dos."
        >
          <input
            {...texto("slug", "Va en la URL: /experiencias/cena-para-dos.")}
            spellCheck={false}
          />
        </Campo>
        <Campo nombre="orden" etiqueta="Orden" error={error("orden")}>
          <input
            {...campo("orden")}
            inputMode="numeric"
            value={valores.orden}
            onChange={(e) => cambiar("orden", e.target.value)}
          />
        </Campo>
      </div>

      <label className={styles.casilla}>
        <input
          type="checkbox"
          name="activa"
          checked={valores.activa}
          onChange={(e) => cambiar("activa", e.target.checked)}
        />
        A la venta en el sitio
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
              : "Crear experiencia"}
        </button>
        <Link href="/admin/experiencias">Cancelar</Link>
      </div>
    </form>
  );
}
