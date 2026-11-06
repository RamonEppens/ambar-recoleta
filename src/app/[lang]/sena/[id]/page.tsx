import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { formatearPrecio } from "@/lib/precio";
import { clienteServicio } from "@/lib/supabase/servicio";
import styles from "../../pedido/[id]/pedido.module.css";
import { PagarSena } from "./PagarSena";

// Se lee la base en cada visita: el estado de la seña cambia cuando se paga.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Seña",
  robots: { index: false, follow: false },
};

/** El link que el admin le manda al cliente para pagar la seña del evento. */
export default async function SenaPage({
  params,
}: PageProps<"/[lang]/sena/[id]">) {
  const { lang, id } = await params;
  if (!hasLocale(lang) || !z.uuid().safeParse(id).success) notFound();
  const [dict, { data: pedido }] = await Promise.all([
    getDictionary(lang),
    clienteServicio()
      .from("pedidos")
      .select("id, estado, nombre, total, tipo, pedido_items (descripcion)")
      .eq("id", id)
      .eq("tipo", "sena")
      .maybeSingle(),
  ]);
  if (!pedido) notFound();
  const t = dict.sena;

  return (
    <main id="contenido" className={styles.pagina}>
      <div className={styles.estado}>
        <h1 className={styles.titulo}>{t.titulo}</h1>
        <p className={styles.texto}>
          {pedido.nombre}: {pedido.pedido_items[0]?.descripcion}
        </p>
        <p className={styles.titulo}>{formatearPrecio(pedido.total, lang)}</p>
        {pedido.estado === "pendiente" ? (
          <>
            <p className={styles.texto}>{t.texto}</p>
            <PagarSena id={pedido.id} lang={lang} t={t} />
          </>
        ) : (
          <p className={styles.texto}>
            {pedido.estado === "pagado" ? t.yaPagada : t.cerrada}
          </p>
        )}
      </div>
    </main>
  );
}
