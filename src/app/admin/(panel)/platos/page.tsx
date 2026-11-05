import type { Metadata } from "next";
import Link from "next/link";
import { platosAdmin } from "@/lib/admin";
import { formatearPrecio } from "@/lib/precio";
import styles from "../../admin.module.css";
import { InterruptorActivo } from "./InterruptorActivo";

export const metadata: Metadata = { title: "Carta" };

export default async function PlatosAdminPage() {
  const { cartas, secciones, platos } = await platosAdmin();

  return (
    <main id="contenido" className={styles.main}>
      <div className={styles.cabecera}>
        <h1 className={styles.titulo}>Carta</h1>
        <Link href="/admin/platos/nuevo" className="boton">
          Nuevo plato
        </Link>
      </div>

      {cartas.map((carta) => (
        <section key={carta.id} aria-labelledby={`carta-${carta.id}`}>
          <h2 id={`carta-${carta.id}`} className={styles.subtitulo}>
            {carta.titulo_es}
          </h2>
          {secciones
            .filter((s) => s.carta_id === carta.id)
            .map((seccion) => (
              <table key={seccion.id} className={styles.tabla}>
                <caption>{seccion.titulo_es}</caption>
                <thead>
                  <tr>
                    <th scope="col">Plato</th>
                    <th scope="col" className={styles.numero}>
                      Precio
                    </th>
                    <th scope="col">En la carta</th>
                  </tr>
                </thead>
                <tbody>
                  {platos
                    .filter((p) => p.seccion_id === seccion.id)
                    .map((plato) => (
                      <tr key={plato.slug} data-inactivo={!plato.activo}>
                        <td>
                          <Link href={`/admin/platos/${plato.slug}`}>
                            {plato.nombre}
                          </Link>
                        </td>
                        <td className={styles.numero}>
                          {plato.precio === null
                            ? "—"
                            : formatearPrecio(plato.precio, "es")}
                        </td>
                        <td>
                          <InterruptorActivo
                            slug={plato.slug}
                            nombre={plato.nombre}
                            activo={plato.activo}
                          />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            ))}
        </section>
      ))}
    </main>
  );
}
