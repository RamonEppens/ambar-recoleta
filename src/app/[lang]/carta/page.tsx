import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Persiana, type Modo } from "@/components/Persiana";
import { cartas, type Carta } from "@/data/carta";
import { semana } from "@/data/horarios";
import { completar } from "@/i18n/completar";
import { hasLocale, type Locale } from "@/i18n/config";
import { getDictionary, type Dictionary } from "@/i18n/dictionaries";
import { horaEnFrase, rangoHorario } from "@/lib/hora";
import { formatearPrecio } from "@/lib/precio";
import { agruparSemana } from "@/lib/semana";
import styles from "./carta.module.css";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/carta">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { carta } = await getDictionary(lang);
  return { title: carta.titulo, description: carta.bajada };
}

/* La carta aperitiva y la de cena van sobre el "papel" crema; los tragos, en terciopelo. */
const modos: Record<Carta["id"], Modo> = {
  aperitivo: "crema",
  cena: "crema",
  tragos: "terciopelo",
};

const mayuscula = (texto: string) =>
  texto.charAt(0).toUpperCase() + texto.slice(1);

/** Cuándo se sirve cada carta, calculado desde los horarios (la misma fuente que "Ahora"). */
function horarioDe(id: Carta["id"], lang: Locale, dict: Dictionary) {
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
  const dict = await getDictionary(lang);
  const t = dict.carta;

  // Orden de la noche: primero el aperitivo, después la cena, después los tragos.
  const orden: Carta["id"][] = ["aperitivo", "cena", "tragos"];
  const enOrden = orden.map((id) => cartas.find((carta) => carta.id === id)!);

  return (
    <main id="contenido">
      <header className={styles.encabezado}>
        <h1 className={styles.titulo}>{t.titulo}</h1>
        <p className={styles.bajada}>{t.bajada}</p>
        <nav aria-label={t.indice} className={styles.indice}>
          <ul>
            {enOrden.map((carta) => (
              <li key={carta.id}>
                <a href={`#${carta.id}`}>{carta.titulo[lang]}</a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {enOrden.map((carta, i) => {
        const modo = modos[carta.id];
        const anterior = i === 0 ? "crema" : modos[enOrden[i - 1].id];
        return (
          <section
            key={carta.id}
            id={carta.id}
            className={styles.carta}
            data-mode={modo}
            aria-labelledby={`${carta.id}-titulo`}
          >
            {anterior !== modo && <Persiana desde={anterior} />}
            <div className={styles.contenido}>
              <div className={styles.cabecera}>
                <h2 id={`${carta.id}-titulo`} className={styles.nombreCarta}>
                  {carta.titulo[lang]}
                </h2>
                <p className={styles.horario}>
                  {horarioDe(carta.id, lang, dict)}
                </p>
              </div>

              {carta.secciones.map((seccion) => (
                <section key={seccion.id} className={styles.seccion}>
                  {carta.secciones.length > 1 && (
                    <h3 className={styles.nombreSeccion}>
                      {seccion.titulo[lang]}
                    </h3>
                  )}
                  <ul className={styles.platos}>
                    {seccion.platos.map((plato) => (
                      <li key={plato.id} className={styles.plato}>
                        <span className={styles.nombre}>{plato.nombre}</span>
                        {plato.precio !== null && (
                          <span className={styles.precio}>
                            {formatearPrecio(plato.precio, lang)}
                          </span>
                        )}
                        <span className={styles.descripcion}>
                          {plato.descripcion[lang]}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </section>
        );
      })}

      <p className={styles.nota} data-mode="terciopelo">
        {t.precios}
      </p>
    </main>
  );
}
