import type { Metadata } from "next";
import { pedidosAdmin } from "@/lib/admin";
import { formatearPrecio } from "@/lib/precio";
import styles from "../../admin.module.css";

export const metadata: Metadata = { title: "Pedidos" };

const ESTADOS: Record<string, string> = {
  pendiente: "Pendiente",
  pagado: "Pagado",
  rechazado: "Rechazado",
  cancelado: "Cancelado",
  reembolsado: "Reembolsado",
};

/** Solo lectura: los pedidos los cambia Mercado Pago (webhook), no el admin. */
export default async function PedidosAdminPage() {
  const pedidos = await pedidosAdmin();
  return (
    <main id="contenido" className={styles.main}>
      <h1 className={styles.titulo}>Pedidos</h1>
      {pedidos.length === 0 ? (
        <p>Todavía no hay pedidos.</p>
      ) : (
        <table className={styles.tabla}>
          <thead>
            <tr>
              <th scope="col">Fecha</th>
              <th scope="col">Quién</th>
              <th scope="col">Detalle</th>
              <th scope="col" className={styles.numero}>
                Total
              </th>
              <th scope="col">Estado</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((p) => (
              <tr key={p.id} data-inactivo={p.estado !== "pagado"}>
                <td className={styles.nowrap}>
                  {new Date(p.created_at).toLocaleString("es-AR", {
                    timeZone: "America/Argentina/Buenos_Aires",
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </td>
                <td>
                  {p.nombre}
                  <br />
                  <a href={`mailto:${p.email}`}>{p.email}</a>
                </td>
                <td>
                  {p.pedido_items.map((i, n) => (
                    <p key={n}>
                      {i.cantidad > 1 && `${i.cantidad} × `}
                      {i.descripcion}
                      {i.codigo && <code> {i.codigo}</code>}
                    </p>
                  ))}
                </td>
                <td className={styles.numero}>
                  {formatearPrecio(p.total, "es")}
                </td>
                <td>
                  {ESTADOS[p.estado] ?? p.estado}
                  {p.mp_payment_id && (
                    <span className={styles.email}>
                      <br />
                      MP #{p.mp_payment_id}
                    </span>
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
