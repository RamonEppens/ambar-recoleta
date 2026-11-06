import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { EstadoPedido } from "./EstadoPedido";
import styles from "./pedido.module.css";

export const metadata: Metadata = {
  title: "Pedido",
  robots: { index: false, follow: false },
};

/**
 * A esta página vuelve Mercado Pago (back_urls). No decide nada por sí misma:
 * muestra el estado que tiene el pedido en la base, que actualiza el webhook.
 */
export default async function PedidoPage({
  params,
}: PageProps<"/[lang]/pedido/[id]">) {
  const { lang, id } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return (
    <main id="contenido" className={styles.pagina}>
      <EstadoPedido id={id} lang={lang} t={dict.pedido} />
    </main>
  );
}
