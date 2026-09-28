import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { enlaces } from "@/data/enlaces";
import { Foto } from "../Foto";
import styles from "./Hero.module.css";

/** Portada: cómo se presenta Ámbar, con sus propias palabras. */
export function Hero({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const t = dict.home.hero;

  return (
    <section className={styles.hero} aria-labelledby="hero-titulo">
      <div className={styles.texto}>
        <h1 id="hero-titulo" className={styles.titulo}>
          {t.titulo} <span className={styles.aparte}>{t.aparte}</span>
        </h1>
        <p className={styles.bajada}>{t.bajada}</p>
        <p className={styles.lugar}>{t.lugar}</p>
        <div className={styles.acciones}>
          <a className="boton" href={enlaces.reservas}>
            {t.reservar}
          </a>
          <Link className="boton boton-secundario" href={`/${lang}/carta`}>
            {t.carta}
          </Link>
        </div>
      </div>
      <Foto
        id="barraCopasLuz"
        alts={dict.fotos}
        className={styles.foto}
        sizes="(min-width: 48rem) 50vw, 100vw"
        preload
      />
    </section>
  );
}
