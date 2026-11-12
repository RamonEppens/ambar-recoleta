import Link from "next/link";
import { notFound } from "next/navigation";
import { Foto } from "@/components/Foto";
import { Horarios } from "@/components/Horarios";
import { Hero } from "@/components/home/Hero";
import type { FotoId } from "@/data/fotos";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getSemana } from "@/lib/datos";
import styles from "./home.module.css";

/*
 * La home es corta a propósito: quién es Ámbar (la portada), las tres cosas
 * que se pueden hacer (comer, regalar, festejar) y cómo llegar.
 * El detalle de cada cosa vive en su página; acá no se repite.
 */
export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, semana] = await Promise.all([getDictionary(lang), getSemana()]);
  const t = dict.home;

  const accesos: {
    clave: "carta" | "regalar" | "eventos";
    href: string;
    foto: FotoId;
  }[] = [
    { clave: "carta", href: `/${lang}/carta`, foto: "platosCenital" },
    { clave: "regalar", href: `/${lang}/experiencias`, foto: "tragosDeLaCasa" },
    { clave: "eventos", href: `/${lang}/eventos`, foto: "salonCortina" },
  ];

  return (
    <main id="contenido">
      <Hero lang={lang} dict={dict} />

      <section className={styles.accesos} aria-labelledby="accesos-titulo">
        <h2 id="accesos-titulo" className={styles.titulo}>
          {t.accesos.titulo}
        </h2>
        <ul className={styles.tarjetas}>
          {accesos.map(({ clave, href, foto }) => {
            const a = t.accesos[clave];
            return (
              <li key={clave} className={styles.tarjeta}>
                <Foto
                  id={foto}
                  alts={dict.fotos}
                  sizes="(min-width: 48rem) 33vw, 100vw"
                  className={styles.foto}
                />
                <h3 className={styles.nombre}>
                  {/* Toda la tarjeta es clickeable (::after), el link es el título */}
                  <Link href={href}>{a.titulo}</Link>
                </h3>
                <p className={styles.texto}>{a.texto}</p>
                <span className={styles.ir} aria-hidden="true">
                  {a.link} →
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section
        className={styles.visita}
        data-mode="terciopelo"
        aria-labelledby="visita-titulo"
      >
        <div className={styles.visitaGrilla}>
          <div>
            <h2 id="visita-titulo" className={styles.visitaTitulo}>
              {t.visita.titulo}
            </h2>
            <Link href={`/${lang}/espacio#visitanos`} className={styles.link}>
              {t.visita.link} →
            </Link>
          </div>
          <Horarios lang={lang} dict={dict} semana={semana} />
        </div>
      </section>
    </main>
  );
}
