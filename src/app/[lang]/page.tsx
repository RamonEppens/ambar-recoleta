import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import styles from "./page.module.css";

// Link de reservas con nuestra propia marca de origen, para que Ámbar vea en Meitre cuántas reservas trae la web.
const RESERVAS_URL =
  "https://ambar-recoleta.meitre.com/?utm_source=web&utm_medium=referral";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const { home } = await getDictionary(lang);

  return (
    <main id="contenido" className={styles.main}>
      <h1 className={styles.tagline}>{home.tagline}</h1>
      <p className={styles.place}>{home.place}</p>
      <p className={styles.hours}>{home.hours}</p>
      <a className={styles.reserve} href={RESERVAS_URL}>
        {home.reserve}
      </a>
    </main>
  );
}
