"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import { pedirJson } from "@/components/formulario/useFormulario";
import styles from "../../admin.module.css";

/**
 * Mostrar u ocultar un plato de la carta con un click (PATCH { activo }).
 * useOptimistic cambia el interruptor al instante; si la API falla, vuelve solo
 * al valor real cuando termina la transición.
 */
export function InterruptorActivo({
  slug,
  nombre,
  activo,
}: {
  slug: string;
  nombre: string;
  activo: boolean;
}) {
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();
  const [mostrado, setMostrado] = useOptimistic(activo);

  const alternar = () =>
    iniciar(async () => {
      setMostrado(!mostrado);
      const respuesta = await pedirJson(`/api/v1/platos/${slug}`, "PATCH", {
        activo: !mostrado,
      }).catch(() => null);
      if (respuesta?.ok) router.refresh();
    });

  return (
    <button
      type="button"
      role="switch"
      aria-checked={mostrado}
      aria-label={`${nombre}: visible en la carta`}
      className={styles.interruptor}
      onClick={alternar}
      disabled={pendiente}
    >
      {mostrado ? "Visible" : "Oculto"}
    </button>
  );
}
