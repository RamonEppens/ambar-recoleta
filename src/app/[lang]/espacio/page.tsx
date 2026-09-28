import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Momento } from "@/components/Momento";
import { enlaces } from "@/data/enlaces";
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
 * Reutiliza el mismo componente Momento de la home.
 */
export default async function EspacioPage({
  params,
}: PageProps<"/[lang]/espacio">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const t = dict.espacio;

  return (
    <main id="contenido">
      <header className={styles.encabezado}>
        <h1 className={styles.titulo}>{t.titulo}</h1>
        <p className={styles.bajada}>{t.bajada}</p>
        <ul className={styles.datos} aria-label={t.datosLabel}>
          {t.datos.map((dato) => (
            <li key={dato}>{dato}</li>
          ))}
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
    </main>
  );
}
