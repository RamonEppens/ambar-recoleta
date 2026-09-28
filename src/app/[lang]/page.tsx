import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { enlaces } from "@/data/enlaces";
import styles from "./page.module.css";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const { home } = await getDictionary(lang);

  return (
    <main id="contenido" className={styles.main}>
      <h1 className={styles.tagline}>{home.tagline}</h1>
      <p className={styles.place}>{home.place}</p>
      <a className={styles.reserve} href={enlaces.reservas}>
        {home.reserve}
      </a>
    </main>
  );
}
