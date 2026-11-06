import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getExperiencias } from "@/lib/datos";
import { Carrito } from "./Carrito";
import styles from "./carrito.module.css";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/carrito">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { carrito } = await getDictionary(lang);
  return { title: carrito.titulo, robots: { index: false } };
}

/**
 * La página llega con el catálogo (nombres y precios para mostrar); qué hay
 * en el carrito lo sabe solo el navegador (localStorage).
 */
export default async function CarritoPage({
  params,
}: PageProps<"/[lang]/carrito">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, experiencias] = await Promise.all([
    getDictionary(lang),
    getExperiencias(),
  ]);

  return (
    <main id="contenido" className={styles.pagina}>
      <h1 className={styles.titulo}>{dict.carrito.titulo}</h1>
      <Carrito
        lang={lang}
        experiencias={experiencias}
        t={dict.carrito}
        tAgregar={dict.agregar}
      />
    </main>
  );
}
