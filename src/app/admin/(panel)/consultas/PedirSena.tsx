"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { pedirJson } from "@/components/formulario/useFormulario";
import styles from "../../admin.module.css";

/**
 * Pedir la seña de un evento: el admin escribe el monto acordado, se crea el
 * pedido y aparece el link para mandarle al cliente.
 */
export function PedirSena({ id, nombre }: { id: string; nombre: string }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [monto, setMonto] = useState("");
  const [estado, setEstado] = useState<
    | { tipo: "editando" | "enviando" }
    | { tipo: "error"; mensaje: string }
    | { tipo: "listo"; link: string }
  >({ tipo: "editando" });

  if (!abierto)
    return (
      <button
        type="button"
        className={styles.linkBoton}
        onClick={() => setAbierto(true)}
      >
        Pedir seña
      </button>
    );

  if (estado.tipo === "listo") {
    const link = `${window.location.origin}${estado.link}`;
    return (
      <div className={styles.sena} role="status">
        <p>Link de pago para {nombre}:</p>
        <input readOnly value={link} aria-label="Link de la seña" />
        <button
          type="button"
          className={styles.linkBoton}
          onClick={() => navigator.clipboard?.writeText(link)}
        >
          Copiar
        </button>
      </div>
    );
  }

  return (
    <form
      className={styles.sena}
      onSubmit={async (e) => {
        e.preventDefault();
        setEstado({ tipo: "enviando" });
        const r = await pedirJson(`/api/v1/consultas/${id}/sena`, "POST", {
          monto: Number(monto.replace(/\./g, "")),
        }).catch(() => null);
        const cuerpo = await r?.json().catch(() => null);
        if (r?.ok) {
          setEstado({ tipo: "listo", link: cuerpo.datos.link });
          router.refresh();
        } else {
          setEstado({
            tipo: "error",
            mensaje:
              cuerpo?.error?.detalles?.[0]?.mensaje ??
              cuerpo?.error?.mensaje ??
              "No se pudo crear la seña.",
          });
        }
      }}
    >
      <label htmlFor={`sena-${id}`}>Monto de la seña (pesos)</label>
      <input
        id={`sena-${id}`}
        inputMode="numeric"
        value={monto}
        onChange={(e) => setMonto(e.target.value)}
        aria-invalid={estado.tipo === "error" || undefined}
        aria-describedby={
          estado.tipo === "error" ? `sena-${id}-error` : undefined
        }
      />
      {estado.tipo === "error" && (
        <p id={`sena-${id}-error`} className={styles.errorChico}>
          {estado.mensaje}
        </p>
      )}
      <button
        type="submit"
        className={styles.linkBoton}
        disabled={estado.tipo === "enviando"}
      >
        {estado.tipo === "enviando" ? "Creando…" : "Crear link de pago"}
      </button>
    </form>
  );
}
