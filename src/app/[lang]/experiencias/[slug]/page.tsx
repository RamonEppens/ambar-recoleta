import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Cupos } from "@/components/Cupos";
import { Foto } from "@/components/Foto";
import { esFotoId } from "@/data/fotos";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getExperiencia, getExperiencias } from "@/lib/datos";
import { formatearPrecio } from "@/lib/precio";
import styles from "../experiencias.module.css";

/** Una página por experiencia, generada en el build. */
export async function generateStaticParams() {
  const experiencias = await getExperiencias();
  return experiencias.map((e) => ({ slug: e.slug }));
}

// Si el admin crea una experiencia nueva, su página se genera en la primera visita.
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/experiencias/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};
  const experiencia = await getExperiencia(slug);
  if (!experiencia) return {};
  return {
    title: experiencia.nombre[lang],
    description: experiencia.descripcion[lang],
  };
}

export default async function ExperienciaPage({
  params,
}: PageProps<"/[lang]/experiencias/[slug]">) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, experiencia] = await Promise.all([
    getDictionary(lang),
    getExperiencia(slug),
  ]);
  if (!experiencia) notFound();
  const t = dict.experiencias;

  return (
    <main id="contenido" className={styles.detalle}>
      <Foto
        id={esFotoId(experiencia.foto) ? experiencia.foto : "barraCopasLuz"}
        alts={dict.fotos}
        sizes="(min-width: 68rem) 50vw, 100vw"
        className={styles.fotoDetalle}
        preload
      />

      <div className={styles.info}>
        <p className={styles.volver}>
          <Link href={`/${lang}/experiencias`}>← {t.todas}</Link>
        </p>
        <h1 className={styles.titulo}>{experiencia.nombre[lang]}</h1>
        <p className={styles.bajada}>{experiencia.descripcion[lang]}</p>

        <div className={styles.compra}>
          <p className={styles.precioDetalle}>
            {formatearPrecio(experiencia.precio, lang)}
          </p>
          <Cupos
            slug={experiencia.slug}
            inicial={experiencia.cupos}
            t={t}
            className={styles.cupos}
          />
        </div>

        <section aria-labelledby="como-funciona">
          <h2 id="como-funciona" className={styles.subtitulo}>
            {t.comoFunciona}
          </h2>
          <ol className={styles.pasos}>
            {t.pasos.map((paso) => (
              <li key={paso}>{paso}</li>
            ))}
          </ol>
        </section>

        <p className={styles.demo}>{t.demo}</p>
      </div>
    </main>
  );
}
