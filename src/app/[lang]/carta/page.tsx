import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { completar } from "@/i18n/completar";
import { hasLocale, type Locale } from "@/i18n/config";
import { getDictionary, type Dictionary } from "@/i18n/dictionaries";
import { horaEnFrase, rangoHorario } from "@/lib/hora";
import { getCartas, getSemana } from "@/lib/datos";
import { agruparSemana } from "@/lib/semana";
import type { Carta, Semana } from "@/lib/tipos";
import styles from "./carta.module.css";
import { CartaFiltrable } from "./CartaFiltrable";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/carta">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { carta } = await getDictionary(lang);
  return { title: carta.titulo, description: carta.bajada };
}

const mayuscula = (texto: string) =>
  texto.charAt(0).toUpperCase() + texto.slice(1);

/** Cuándo se sirve cada carta, calculado desde los horarios (la misma fuente que "Ahora"). */
function horarioDe(
  id: Carta["id"],
  lang: Locale,
  dict: Dictionary,
  semana: Semana,
) {
  const t = dict.carta;
  const primera = semana.find((jornada) => jornada !== null);

  if (id === "aperitivo") {
    const { tramos } = agruparSemana(semana, (j) => ({
      abre: j.abre,
      cierra: j.aperitivoHasta,
    }));
    return tramos
      .map(({ desde, hasta, abre, cierra }) => {
        const dias =
          desde === hasta
            ? dict.dias[desde]
            : completar(t.rangoDias, {
                desde: dict.dias[desde],
                hasta: dict.dias[hasta],
              });
        return completar(t.horarioAperitivo, {
          dias: mayuscula(dias),
          rango: rangoHorario(lang, abre, cierra),
        });
      })
      .join(t.separador);
  }
  if (id === "cena" && primera) {
    return completar(t.horarioCena, {
      desde: horaEnFrase(lang, primera.aperitivoHasta),
      hasta: horaEnFrase(lang, primera.cocinaHasta),
    });
  }
  return t.horarioTragos;
}

export default async function CartaPage({
  params,
}: PageProps<"/[lang]/carta">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, enOrden, semana] = await Promise.all([
    getDictionary(lang),
    getCartas(),
    getSemana(),
  ]);
  const t = dict.carta;
  // El orden (aperitivo → cena → tragos) viene de la columna `orden` de la tabla cartas.

  const horarios = Object.fromEntries(
    enOrden.map((carta) => [carta.id, horarioDe(carta.id, lang, dict, semana)]),
  ) as Record<Carta["id"], string>;

  return (
    <main id="contenido">
      <header className={styles.encabezado}>
        <h1 className={styles.titulo}>{t.titulo}</h1>
        <p className={styles.bajada}>{t.bajada}</p>
      </header>

      <CartaFiltrable lang={lang} cartas={enOrden} horarios={horarios} t={t} />

      <p className={styles.nota} data-mode="terciopelo">
        {t.precios}
      </p>
    </main>
  );
}
