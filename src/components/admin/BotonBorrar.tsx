"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { pedirJson } from "@/components/formulario/useFormulario";
import styles from "./Formulario.module.css";

/**
 * Borrar en dos pasos, sin ventana emergente: el primer click pide
 * confirmación en el mismo botón; el segundo borra.
 */
export function BotonBorrar({
  url,
  volverA,
  que,
}: {
  url: string;
  volverA: string;
  que: string;
}) {
  const router = useRouter();
  const [paso, setPaso] = useState<"inicial" | "confirmar" | "borrando">(
    "inicial",
  );
  const [error, setError] = useState("");

  async function borrar() {
    if (paso === "inicial") return setPaso("confirmar");
    setPaso("borrando");
    const respuesta = await pedirJson(url, "DELETE").catch(() => null);
    if (respuesta?.ok) {
      router.push(volverA);
      router.refresh();
      return;
    }
    const cuerpo = await respuesta?.json().catch(() => null);
    setError(cuerpo?.error?.mensaje ?? "No se pudo borrar.");
    setPaso("inicial");
  }

  return (
    <div className={styles.borrar}>
      <button
        type="button"
        className="boton boton-secundario"
        onClick={borrar}
        disabled={paso === "borrando"}
      >
        {paso === "confirmar"
          ? `Sí, borrar ${que} definitivamente`
          : paso === "borrando"
            ? "Borrando…"
            : `Borrar ${que}`}
      </button>
      {paso === "confirmar" && (
        <button
          type="button"
          className={styles.linkBoton}
          onClick={() => setPaso("inicial")}
        >
          Cancelar
        </button>
      )}
      {error && (
        <p role="alert" className={styles.errorGeneral}>
          {error}
        </p>
      )}
    </div>
  );
}
