"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { vaciar } from "@/lib/carrito";
import { formatearPrecio } from "@/lib/precio";
import styles from "./pedido.module.css";

type Pedido = {
  id: string;
  tipo: "experiencias" | "sena";
  estado: "pendiente" | "pagado" | "rechazado" | "cancelado" | "reembolsado";
  total: number;
  items: {
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
    codigo: string | null;
  }[];
};

const INTERVALO = 3000;
const INTENTOS = 20; // un minuto

/**
 * Muestra el estado del pedido y lo vuelve a pedir cada 3 segundos mientras
 * esté pendiente: el webhook de Mercado Pago puede llegar unos segundos
 * después de que la persona vuelve al sitio.
 *
 * Si la URL trae el id del pago (Mercado Pago lo agrega al volver), le pide
 * al servidor que lo verifique contra la API de Mercado Pago, por si el
 * webhook todavía no llegó. El navegador nunca marca nada como pagado.
 */
export function EstadoPedido({
  id,
  lang,
  t,
}: {
  id: string;
  lang: Locale;
  t: Dictionary["pedido"];
}) {
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [inexistente, setInexistente] = useState(false);
  const [intentos, setIntentos] = useState(0);

  useEffect(() => {
    let cancelado = false;
    let espera: ReturnType<typeof setTimeout>;

    async function consultar(intento: number) {
      const respuesta = await fetch(`/api/v1/pedidos/${id}`, {
        cache: "no-store",
      }).catch(() => null);
      if (cancelado) return;
      if (respuesta?.status === 404 || respuesta?.status === 400) {
        setInexistente(true);
        return;
      }
      const datos: Pedido | undefined = respuesta?.ok
        ? (await respuesta.json()).datos
        : undefined;
      if (datos) setPedido(datos);
      setIntentos(intento);
      if (datos?.estado === "pagado" && datos.tipo === "experiencias") vaciar();
      if ((!datos || datos.estado === "pendiente") && intento < INTENTOS)
        espera = setTimeout(() => consultar(intento + 1), INTERVALO);
    }

    async function arrancar() {
      const paymentId = new URLSearchParams(window.location.search).get(
        "payment_id",
      );
      if (paymentId && /^\d+$/.test(paymentId)) {
        await fetch(`/api/v1/pedidos/${id}/verificar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId }),
        }).catch(() => null);
      }
      if (!cancelado) await consultar(1);
    }

    arrancar();
    return () => {
      cancelado = true;
      clearTimeout(espera);
    };
  }, [id]);

  if (inexistente) return <p className={styles.texto}>{t.noExiste}</p>;
  if (!pedido)
    return (
      <p className={styles.texto} role="status">
        {t.pendienteTitulo}
      </p>
    );

  const detalle = (
    <ul className={styles.items}>
      {pedido.items.map((item, i) => (
        <li key={i} className={styles.item}>
          <span>
            {item.cantidad > 1 && `${item.cantidad} × `}
            {item.descripcion}
          </span>
          {item.codigo && (
            <span className={styles.codigo}>
              <span className={styles.etiqueta}>{t.codigo}</span> {item.codigo}
            </span>
          )}
        </li>
      ))}
      <li className={styles.item}>
        <strong>{t.total}</strong>
        <strong>{formatearPrecio(pedido.total, lang)}</strong>
      </li>
    </ul>
  );

  return (
    <div className={styles.estado} role="status" aria-live="polite">
      {pedido.estado === "pagado" ? (
        <>
          <h1 className={styles.titulo}>{t.pagadoTitulo}</h1>
          <p className={styles.texto}>
            {pedido.tipo === "sena" ? t.senaPagadaTexto : t.pagadoTexto}
          </p>
          {detalle}
          <p className={styles.nota}>{t.guardar}</p>
        </>
      ) : pedido.estado === "pendiente" ? (
        <>
          <h1 className={styles.titulo}>{t.pendienteTitulo}</h1>
          <p className={styles.texto}>
            {intentos >= INTENTOS ? t.demoraTexto : t.pendienteTexto}
          </p>
          {detalle}
        </>
      ) : (
        <>
          <h1 className={styles.titulo}>{t.rechazadoTitulo}</h1>
          <p className={styles.texto}>{t.rechazadoTexto}</p>
          {pedido.tipo === "experiencias" && (
            <Link className="boton" href={`/${lang}/carrito`}>
              {t.reintentar}
            </Link>
          )}
        </>
      )}
    </div>
  );
}
