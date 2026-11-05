import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Foto } from "@/components/Foto";
import { linkWhatsApp } from "@/data/enlaces";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { FormConsulta } from "./FormConsulta";
import styles from "./eventos.module.css";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/eventos">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { eventos } = await getDictionary(lang);
  return { title: eventos.titulo, description: eventos.bajada };
}

/** Consulta por un evento privado: el formulario dinámico del E3. */
export default async function EventosPage({
  params,
}: PageProps<"/[lang]/eventos">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const t = dict.eventos;

  return (
    <main id="contenido" className={styles.pagina} data-mode="terciopelo">
      <div className={styles.intro}>
        <h1 className={styles.titulo}>{t.titulo}</h1>
        <p className={styles.bajada}>{t.bajada}</p>
        <Foto
          id="salonCortina"
          alts={dict.fotos}
          sizes="(min-width: 68rem) 35vw, 100vw"
          className={styles.foto}
          preload
        />
        <p className={styles.demo}>{t.demo}</p>
        <p className={styles.alternativa}>
          {t.alternativa}{" "}
          <a href={linkWhatsApp(dict.espacio.visitanos.eventosMensaje)}>
            {t.whatsapp}
          </a>
        </p>
      </div>

      <div className={styles.formulario}>
        <FormConsulta lang={lang} t={t} />
      </div>
    </main>
  );
}
