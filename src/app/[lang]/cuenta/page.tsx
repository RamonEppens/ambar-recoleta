import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import styles from "@/components/cuenta/cuenta.module.css";
import { completar } from "@/i18n/completar";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { obtenerSesion } from "@/lib/auth";
import { salirCliente } from "@/lib/cuentas/acciones";
import { formatearPrecio } from "@/lib/precio";

export const metadata: Metadata = { robots: { index: false } };

type Pedido = {
  id: string;
  tipo: "experiencias" | "sena";
  estado: string;
  total: number;
  created_at: string;
  pedido_items: {
    descripcion: string;
    cantidad: number;
    codigo: string | null;
  }[];
};

type Consulta = {
  id: string;
  fecha: string;
  personas: number;
  tipo: string;
  estado: string;
  pedidos: { id: string; estado: string; tipo: string }[];
};

/**
 * Mi cuenta: las compras (con sus códigos) y las consultas de eventos del
 * cliente. Se lee con SU sesión: RLS solo le devuelve lo suyo.
 */
export default async function CuentaPage({
  params,
}: PageProps<"/[lang]/cuenta">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const { db, usuario, esAdmin } = await obtenerSesion();
  if (!usuario) redirect(`/${lang}/ingresar?siguiente=/${lang}/cuenta`);

  const [dict, pedidos, consultas] = await Promise.all([
    getDictionary(lang),
    db
      .from("pedidos")
      .select(
        "id, tipo, estado, total, created_at, pedido_items (descripcion, cantidad, codigo)",
      )
      // El admin puede leer todos: acá se muestran solo los propios.
      .eq("usuario_id", usuario.id)
      .order("created_at", { ascending: false }),
    db
      .from("consultas_eventos")
      .select("id, fecha, personas, tipo, estado, pedidos (id, estado, tipo)")
      .eq("usuario_id", usuario.id)
      .order("fecha", { ascending: false }),
  ]);
  const t = dict.cuenta;
  const nombre = String(
    usuario.user_metadata?.full_name ?? usuario.user_metadata?.name ?? "",
  );
  // Fechas siempre en hora de Buenos Aires. Las de eventos son solo día ("2026-12-19").
  const fecha = (iso: string, soloDia = false) =>
    new Date(
      soloDia ? `${iso.slice(0, 10)}T12:00:00-03:00` : iso,
    ).toLocaleDateString(lang === "es" ? "es-AR" : "en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "America/Argentina/Buenos_Aires",
    });
  const estado = (e: string) => t.estados[e as keyof typeof t.estados] ?? e;
  const listaPedidos = (pedidos.data ?? []) as Pedido[];
  const listaConsultas = (consultas.data ?? []) as Consulta[];

  return (
    <main id="contenido" className={styles.cuenta}>
      <header className={styles.cabecera}>
        <div>
          <h1 className={styles.titulo}>
            {nombre
              ? completar(t.hola, { nombre: nombre.split(" ")[0] })
              : t.miCuenta}
          </h1>
          <p className={styles.email}>{usuario.email}</p>
        </div>
        <div className={styles.acciones}>
          {esAdmin && <Link href="/admin">{t.admin}</Link>}
          <form action={salirCliente}>
            <input type="hidden" name="lang" value={lang} />
            <button type="submit" className={styles.linkBoton}>
              {t.salir}
            </button>
          </form>
        </div>
      </header>

      <section aria-labelledby="compras">
        <h2 id="compras" className={styles.subtitulo}>
          {t.comprasTitulo}
        </h2>
        {listaPedidos.length === 0 ? (
          <div className={styles.vacio}>
            <p>{t.sinCompras}</p>
            <Link
              className="boton boton-secundario"
              href={`/${lang}/experiencias`}
            >
              {t.verExperiencias}
            </Link>
          </div>
        ) : (
          <ul className={styles.lista}>
            {listaPedidos.map((p) => (
              <li key={p.id} className={styles.fila}>
                <div className={styles.detalle}>
                  {p.pedido_items.map((i, n) => (
                    <span key={n}>
                      {i.cantidad > 1 && `${i.cantidad} × `}
                      {i.descripcion}
                      {p.estado === "pagado" && i.codigo && (
                        <>
                          {" · "}
                          <span className={styles.codigo}>{i.codigo}</span>
                        </>
                      )}
                    </span>
                  ))}
                  <span className={styles.meta}>
                    {fecha(p.created_at)} · {formatearPrecio(p.total, lang)} ·{" "}
                    <Link href={`/${lang}/pedido/${p.id}`}>{t.verPedido}</Link>
                  </span>
                </div>
                <span className={styles.estado} data-estado={p.estado}>
                  {estado(p.estado)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="consultas">
        <h2 id="consultas" className={styles.subtitulo}>
          {t.consultasTitulo}
        </h2>
        {listaConsultas.length === 0 ? (
          <div className={styles.vacio}>
            <p>{t.sinConsultas}</p>
            <Link className="boton boton-secundario" href={`/${lang}/eventos`}>
              {t.consultar}
            </Link>
          </div>
        ) : (
          <ul className={styles.lista}>
            {listaConsultas.map((c) => {
              const senaPendiente = c.pedidos?.find(
                (p) => p.tipo === "sena" && p.estado === "pendiente",
              );
              return (
                <li key={c.id} className={styles.fila}>
                  <div className={styles.detalle}>
                    <span>
                      {dict.eventos.tipos[
                        c.tipo as keyof typeof dict.eventos.tipos
                      ] ?? c.tipo}{" "}
                      · {fecha(c.fecha, true)}
                    </span>
                    <span className={styles.meta}>
                      {completar(t.personas, { n: String(c.personas) })}
                      {senaPendiente && (
                        <>
                          {" · "}
                          <Link href={`/${lang}/sena/${senaPendiente.id}`}>
                            {t.pagarSena}
                          </Link>
                        </>
                      )}
                    </span>
                  </div>
                  <span className={styles.estado} data-estado={c.estado}>
                    {estado(c.estado)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
