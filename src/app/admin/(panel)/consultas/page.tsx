import type { Metadata } from "next";
import { getDictionary } from "@/i18n/dictionaries";
import { consultasAdmin } from "@/lib/admin";
import styles from "../../admin.module.css";
import { PedirSena } from "./PedirSena";
import { SelectorEstado } from "./SelectorEstado";

export const metadata: Metadata = { title: "Consultas" };

const fecha = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default async function ConsultasAdminPage() {
  const [consultas, { eventos }] = await Promise.all([
    consultasAdmin(),
    getDictionary("es"),
  ]);

  return (
    <main id="contenido" className={styles.main}>
      <h1 className={styles.titulo}>Consultas de eventos</h1>
      {consultas.length === 0 ? (
        <p>Todavía no llegó ninguna consulta.</p>
      ) : (
        <table className={styles.tabla}>
          <thead>
            <tr>
              <th scope="col">Fecha</th>
              <th scope="col">Quién</th>
              <th scope="col">Evento</th>
              <th scope="col">Estado</th>
            </tr>
          </thead>
          <tbody>
            {consultas.map((c) => (
              <tr key={c.id} data-inactivo={c.estado === "descartada"}>
                <td className={styles.nowrap}>{fecha(c.fecha)}</td>
                <td>
                  {c.nombre}
                  <br />
                  <a href={`mailto:${c.email}`}>{c.email}</a>
                  {c.telefono && (
                    <>
                      <br />
                      <a href={`tel:${c.telefono}`}>{c.telefono}</a>
                    </>
                  )}
                </td>
                <td>
                  {eventos.tipos[c.tipo as keyof typeof eventos.tipos] ??
                    c.tipo}{" "}
                  · {c.personas} personas
                  {c.mensaje && <p className={styles.mensaje}>{c.mensaje}</p>}
                </td>
                <td>
                  <SelectorEstado
                    id={c.id}
                    nombre={c.nombre}
                    estado={c.estado}
                  />
                  {(c.estado === "nueva" || c.estado === "contactada") && (
                    <PedirSena id={c.id} nombre={c.nombre} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
