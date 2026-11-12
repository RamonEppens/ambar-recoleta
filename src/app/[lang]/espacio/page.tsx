import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Foto } from "@/components/Foto";
import { Horarios } from "@/components/Horarios";
import { VideoSet } from "@/components/VideoSet";
import type { FotoId } from "@/data/fotos";
import { completar } from "@/i18n/completar";
import { getSemana, getSets } from "@/lib/datos";
import { horaEnFrase } from "@/lib/hora";
import { MapaCuadra } from "@/components/MapaCuadra";
import { enlaces, linkWhatsApp, telefonoEventos } from "@/data/enlaces";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import styles from "./espacio.module.css";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/espacio">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { espacio } = await getDictionary(lang);
  return { title: espacio.titulo, description: espacio.bajada };
}

/*
 * Visitanos: el lugar (tres ambientes en una grilla), la música y cómo llegar.
 * Junta lo que antes eran dos páginas ("El espacio" y "Música").
 */
export default async function EspacioPage({
  params,
}: PageProps<"/[lang]/espacio">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, semana, sets] = await Promise.all([
    getDictionary(lang),
    getSemana(),
    getSets(),
  ]);
  const t = dict.espacio;
  const v = t.visitanos;
  const m = t.musica;
  const djDesde = semana.find((jornada) => jornada?.djDesde)?.djDesde;

  const lugares: { clave: "patio" | "salon" | "barra"; foto: FotoId }[] = [
    { clave: "patio", foto: "patioTarde" },
    { clave: "salon", foto: "mesaCena" },
    { clave: "barra", foto: "djSetLiving" },
  ];

  return (
    <main id="contenido">
      <header className={styles.encabezado}>
        <h1 className={styles.titulo}>{t.titulo}</h1>
        <p className={styles.bajada}>{t.bajada}</p>
        <ul className={styles.datos} aria-label={t.datosLabel}>
          {t.datos.map((dato) => (
            <li key={dato}>{dato}</li>
          ))}
          <li>
            <a href="#visitanos" className={styles.saltar}>
              {t.comoLlegar} ↓
            </a>
          </li>
        </ul>
      </header>

      <section className={styles.lugar} aria-labelledby="lugar-titulo">
        <h2 id="lugar-titulo" className={styles.seccionTitulo}>
          {t.lugarTitulo}
        </h2>
        <ul className={styles.lugares}>
          {lugares.map(({ clave, foto }) => (
            <li key={clave}>
              <figure className={styles.ambiente}>
                <Foto
                  id={foto}
                  alts={dict.fotos}
                  sizes="(min-width: 48rem) 33vw, 100vw"
                  className={styles.foto}
                />
                <figcaption>
                  <strong className={styles.ambienteNombre}>
                    {t[clave].etiqueta}
                  </strong>
                  {t[clave].texto}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </section>

      <section
        id="musica"
        className={styles.musica}
        data-mode="noche"
        aria-labelledby="musica-titulo"
      >
        <div className={styles.musicaGrilla}>
          <div className={styles.musicaTexto}>
            <h2 id="musica-titulo" className={styles.seccionTitulo}>
              {m.titulo}
            </h2>
            <p className={styles.bajada}>
              {completar(m.bajada, {
                hora: djDesde ? horaEnFrase(lang, djDesde) : "",
              })}
            </p>
            <p>{m.colonia}</p>
            <p className={styles.nota}>{m.nota}</p>
            <a className={styles.link} href={enlaces.colonia}>
              {m.coloniaLink} ↗
            </a>
          </div>
          <div>
            <h3 className={styles.subtitulo}>{m.sets}</h3>
            <ul className={styles.sets}>
              {sets.map((set) => (
                <li key={set.youtubeId}>
                  <VideoSet
                    youtubeId={set.youtubeId}
                    titulo={set.titulo}
                    reproducir={m.reproducir}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section
        id="visitanos"
        className={styles.visitanos}
        data-mode="noche"
        aria-labelledby="visitanos-titulo"
      >
        <div className={styles.visitanosGrilla}>
          <div className={styles.columna}>
            <p className={styles.etiqueta}>{v.etiqueta}</p>
            <h2 id="visitanos-titulo" className={styles.visitanosTitulo}>
              {v.titulo}
            </h2>
            <MapaCuadra
              titulo={v.mapa}
              calle={v.calle}
              cementerio={v.cementerio}
              ambar={v.ambar}
            />
            <a className={styles.link} href={enlaces.mapa}>
              {v.abrirMapa}
            </a>
          </div>

          <div className={styles.columna}>
            <section
              aria-labelledby="visitanos-horarios"
              className={styles.bloque}
            >
              <h3 id="visitanos-horarios" className={styles.subtitulo}>
                {v.horarios}
              </h3>
              <Horarios lang={lang} dict={dict} semana={semana} />
            </section>

            <section
              aria-labelledby="visitanos-reservas"
              className={styles.bloque}
            >
              <h3 id="visitanos-reservas" className={styles.subtitulo}>
                {v.reservasTitulo}
              </h3>
              <p>{v.reservasTexto}</p>
              <a className="boton" href={enlaces.reservas}>
                {v.reservar}
              </a>
            </section>

            <section
              aria-labelledby="visitanos-eventos"
              className={styles.bloque}
            >
              <h3 id="visitanos-eventos" className={styles.subtitulo}>
                {v.eventosTitulo}
              </h3>
              <p>{v.eventosTexto}</p>
              <Link
                className="boton boton-secundario"
                href={`/${lang}/eventos`}
              >
                {v.eventosBoton}
              </Link>
              <p className={styles.nota}>
                <a href={linkWhatsApp(v.eventosMensaje)}>{v.eventosWhatsApp}</a>
                . {v.eventosTelefono}{" "}
                <a href={`tel:+${telefonoEventos.internacional}`}>
                  {telefonoEventos.visible}
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
