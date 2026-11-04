import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Momento } from "@/components/Momento";
import { Persiana } from "@/components/Persiana";
import { VideoSet } from "@/components/VideoSet";
import { enlaces } from "@/data/enlaces";
import { semana } from "@/data/horarios";
import { sets } from "@/data/sets";
import { completar } from "@/i18n/completar";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { horaEnFrase } from "@/lib/hora";
import styles from "./musica.module.css";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/musica">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { musica } = await getDictionary(lang);
  return { title: musica.titulo, description: musica.colonia.texto };
}

/** Toda la página va en modo noche: la música es el último momento de la noche. */
export default async function MusicaPage({
  params,
}: PageProps<"/[lang]/musica">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const t = dict.musica;

  // El horario de los DJs sale del mismo archivo que "Ahora" y la home.
  const djDesde = semana.find((jornada) => jornada?.djDesde)?.djDesde;

  return (
    <main id="contenido" data-mode="noche">
      <Persiana desde="crema" />
      <header className={styles.encabezado}>
        <h1 className={styles.titulo}>{t.titulo}</h1>
        <p className={styles.bajada}>
          {completar(t.bajada, {
            hora: djDesde ? horaEnFrase(lang, djDesde) : "",
          })}
        </p>
      </header>

      <Momento
        id="colonia"
        modo="noche"
        desde="noche"
        etiqueta={t.colonia.etiqueta}
        titulo={t.colonia.titulo}
        texto={t.colonia.texto}
        link={{ href: enlaces.colonia, texto: t.colonia.link }}
        fotos={["djSetLiving", "espressoMartiniColonia"]}
        alts={dict.fotos}
      />

      <section className={styles.sets} aria-labelledby="sets-titulo">
        <h2 id="sets-titulo" className={styles.setsTitulo}>
          {t.sets.titulo}
        </h2>
        <p className={styles.nota}>{t.sets.nota}</p>
        <ul className={styles.grilla}>
          {sets.map((set) => (
            <li key={set.youtubeId} className={styles.set}>
              <VideoSet
                youtubeId={set.youtubeId}
                titulo={set.titulo}
                reproducir={t.sets.reproducir}
              />
              <p className={styles.setTitulo}>{set.titulo}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
