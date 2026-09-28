import { notFound } from "next/navigation";
import { Destacados } from "@/components/home/Destacados";
import { Hero } from "@/components/home/Hero";
import { Momento } from "@/components/home/Momento";
import { semana } from "@/data/horarios";
import { completar } from "@/i18n/completar";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { horaEnFrase } from "@/lib/hora";

/*
 * La home sigue la frase con la que Ámbar se describe en Instagram:
 * "Somos tu cena, tu previa y, si pinta, todo lo que viene después."
 * Cada sección es un momento de la noche, y el color acompaña la hora:
 * crema (tarde y cena) → terciopelo (previa) → noche (lo que viene después).
 */
export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const t = dict.home;

  // Los horarios del texto salen del mismo archivo que usan "Ahora" y el pie.
  const sabado = semana[6];
  const djDesde = semana.find((jornada) => jornada?.djDesde)?.djDesde;

  return (
    <main id="contenido">
      <Hero lang={lang} dict={dict} />

      <Momento
        id="tarde"
        modo="crema"
        desde="crema"
        etiqueta={t.patio.etiqueta}
        titulo={t.patio.titulo}
        texto={completar(t.patio.texto, {
          hora: sabado ? horaEnFrase(lang, sabado.abre) : "",
        })}
        link={{ href: `/${lang}/espacio`, texto: t.patio.link }}
        fotos={["patioTarde", "ostrasMarmol"]}
        alts={dict.fotos}
        lado="izquierda"
      />

      <Momento
        id="cena"
        modo="crema"
        desde="crema"
        etiqueta={t.cena.etiqueta}
        titulo={t.cena.titulo}
        texto={t.cena.texto}
        link={{ href: `/${lang}/carta`, texto: t.cena.link }}
        fotos={["platosCenital", "salonCortina"]}
        alts={dict.fotos}
      >
        <Destacados
          ids={["tartar-ciervo", "bife-poivre", "chipa-frito"]}
          lang={lang}
        />
      </Momento>

      <Momento
        id="previa"
        modo="terciopelo"
        desde="crema"
        etiqueta={t.previa.etiqueta}
        titulo={t.previa.titulo}
        texto={t.previa.texto}
        link={{ href: `/${lang}/carta#tragos`, texto: t.previa.link }}
        fotos={["tragosDeLaCasa", "rinconCuero"]}
        alts={dict.fotos}
        lado="izquierda"
      >
        <Destacados ids={["del-este", "dirty", "vermut"]} lang={lang} />
      </Momento>

      <Momento
        id="despues"
        modo="noche"
        desde="terciopelo"
        etiqueta={t.despues.etiqueta}
        titulo={t.despues.titulo}
        texto={completar(t.despues.texto, {
          hora: djDesde ? horaEnFrase(lang, djDesde) : "",
        })}
        link={{ href: `/${lang}/musica`, texto: t.despues.link }}
        fotos={["djSetLiving", "espressoMartiniColonia"]}
        alts={dict.fotos}
      />
    </main>
  );
}
