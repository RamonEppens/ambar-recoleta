import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Momento } from "@/components/Momento";
import { Horarios } from "@/components/Horarios";
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
 * Los tres ambientes, en el orden en que se usan durante la noche:
 * el patio a la tarde (crema), el salón en la cena (terciopelo) y la barra de noche.
 * Reutiliza el mismo componente Momento de la home. Al final, Visitanos:
 * cómo llegar, horarios, reservas y eventos privados.
 */
export default async function EspacioPage({
  params,
}: PageProps<"/[lang]/espacio">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const t = dict.espacio;
  const v = t.visitanos;

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

      <Momento
        id="patio"
        modo="crema"
        desde="crema"
        etiqueta={t.patio.etiqueta}
        titulo={t.patio.titulo}
        texto={t.patio.texto}
        link={{ href: `/${lang}/carta#aperitivo`, texto: t.patio.link }}
        fotos={["patioTarde", "rinconCuero"]}
        alts={dict.fotos}
      />

      <Momento
        id="salon"
        modo="terciopelo"
        desde="crema"
        etiqueta={t.salon.etiqueta}
        titulo={t.salon.titulo}
        texto={t.salon.texto}
        link={{ href: enlaces.reservas, texto: t.salon.link }}
        fotos={["salonCortina", "mesaCena"]}
        alts={dict.fotos}
        lado="izquierda"
      />

      <Momento
        id="barra"
        modo="noche"
        desde="terciopelo"
        etiqueta={t.barra.etiqueta}
        titulo={t.barra.titulo}
        texto={t.barra.texto}
        link={{ href: `/${lang}/musica`, texto: t.barra.link }}
        fotos={["barraCopasLuz", "espressoMartiniColonia"]}
        alts={dict.fotos}
      />
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
              <Horarios lang={lang} dict={dict} />
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
              <a
                className="boton boton-secundario"
                href={linkWhatsApp(v.eventosMensaje)}
              >
                {v.eventosBoton}
              </a>
              <p className={styles.nota}>
                {v.eventosTelefono}{" "}
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
