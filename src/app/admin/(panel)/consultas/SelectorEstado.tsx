"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import { pedirJson } from "@/components/formulario/useFormulario";
import styles from "../../admin.module.css";

const ESTADOS = {
  nueva: "Nueva",
  contactada: "Contactada",
  senada: "Señada",
  descartada: "Descartada",
};

/** Cambia el estado de una consulta (PATCH). "Señada" la marca sola el pago de la seña. */
export function SelectorEstado({
  id,
  nombre,
  estado,
}: {
  id: string;
  nombre: string;
  estado: string;
}) {
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();
  const [mostrado, setMostrado] = useOptimistic(estado);

  return (
    <select
      className={styles.selectEstado}
      aria-label={`Estado de la consulta de ${nombre}`}
      value={mostrado}
      disabled={pendiente}
      onChange={(e) => {
        const nuevo = e.target.value;
        iniciar(async () => {
          setMostrado(nuevo);
          const r = await pedirJson(`/api/v1/consultas/${id}`, "PATCH", {
            estado: nuevo,
          }).catch(() => null);
          if (r?.ok) router.refresh();
        });
      }}
    >
      {Object.entries(ESTADOS).map(([valor, texto]) => (
        <option key={valor} value={valor} disabled={valor === "senada"}>
          {texto}
        </option>
      ))}
    </select>
  );
}
