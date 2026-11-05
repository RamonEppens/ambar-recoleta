import type { Metadata } from "next";
import Link from "next/link";
import { experienciasAdmin } from "@/lib/admin";
import { formatearPrecio } from "@/lib/precio";
import styles from "../../admin.module.css";

export const metadata: Metadata = { title: "Experiencias" };

export default async function ExperienciasAdminPage() {
  const experiencias = await experienciasAdmin();
  return (
    <main id="contenido" className={styles.main}>
      <div className={styles.cabecera}>
        <h1 className={styles.titulo}>Experiencias</h1>
        <Link href="/admin/experiencias/nuevo" className="boton">
          Nueva experiencia
        </Link>
      </div>
      <table className={styles.tabla}>
        <thead>
          <tr>
            <th scope="col">Experiencia</th>
            <th scope="col" className={styles.numero}>
              Precio
            </th>
            <th scope="col" className={styles.numero}>
              Cupos
            </th>
            <th scope="col">Estado</th>
          </tr>
        </thead>
        <tbody>
          {experiencias.map((e) => (
            <tr key={e.slug} data-inactivo={!e.activa}>
              <td>
                <Link href={`/admin/experiencias/${e.slug}`}>
                  {e.nombre_es}
                </Link>
              </td>
              <td className={styles.numero}>
                {formatearPrecio(e.precio, "es")}
              </td>
              <td className={styles.numero}>{e.cupos}</td>
              <td>
                {!e.activa
                  ? "Oculta"
                  : e.cupos === 0
                    ? "Agotada"
                    : "A la venta"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
