import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Foto } from "@/components/Foto";
import { esFotoId } from "@/data/fotos";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getExperiencias } from "@/lib/datos";
import { formatearPrecio } from "@/lib/precio";
import styles from "./experiencias.module.css";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/experiencias">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { experiencias } = await getDictionary(lang);
  return { title: experiencias.titulo, description: experiencias.bajada };
}

/** El catálogo de lo que se vende: experiencias para regalar. */
export default async function ExperienciasPage({
  params,
}: PageProps<"/[lang]/experiencias">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, experiencias] = await Promise.all([
    getDictionary(lang),
    getExperiencias(),
  ]);
  const t = dict.experiencias;

  return (
    <main id="contenido">
      <header className={styles.encabezado}>
        <h1 className={styles.titulo}>{t.titulo}</h1>
        <p className={styles.bajada}>{t.bajada}</p>
        <p className={styles.demo}>{t.demo}</p>
      </header>

      <ul className={styles.grilla}>
        {experiencias.map((e, i) => (
          <li key={e.slug} className={styles.tarjeta}>
            <Foto
              id={esFotoId(e.foto) ? e.foto : "barraCopasLuz"}
              alts={dict.fotos}
              sizes="(min-width: 68rem) 30vw, (min-width: 48rem) 45vw, 100vw"
              className={styles.foto}
              preload={i === 0} // la primera foto es la más grande arriba de todo (LCP)
            />
            <h2 className={styles.nombre}>
              {/* Toda la tarjeta es clickeable (ver ::after en el CSS), pero el link es solo el nombre */}
              <Link href={`/${lang}/experiencias/${e.slug}`}>
                {e.nombre[lang]}
              </Link>
            </h2>
            <p className={styles.descripcion}>{e.descripcion[lang]}</p>
            <p className={styles.precio}>
              {e.cupos === 0 ? t.agotada : formatearPrecio(e.precio, lang)}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
