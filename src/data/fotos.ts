/*
 * Fotos de Ámbar, tomadas de su Instagram con la idea de pedirles los originales.
 * Importarlas de forma estática le da a next/image el ancho, el alto y un
 * placeholder borroso generado en el build. Los textos alternativos están en los
 * diccionarios (fotos.*), porque cambian según el idioma.
 */
import barraCopasLuz from "@/assets/fotos/barra-copas-luz.jpg";
import djSetLiving from "@/assets/fotos/dj-set-living.jpg";
import espressoMartiniColonia from "@/assets/fotos/espresso-martini-colonia.jpg";
import mesaCena from "@/assets/fotos/mesa-cena.jpg";
import ostrasMarmol from "@/assets/fotos/ostras-marmol.jpg";
import patioTarde from "@/assets/fotos/patio-tarde.jpg";
import platosCenital from "@/assets/fotos/platos-cenital.jpg";
import platosOstrasPapas from "@/assets/fotos/platos-ostras-papas.jpg";
import rinconCuero from "@/assets/fotos/rincon-cuero.jpg";
import salonCortina from "@/assets/fotos/salon-cortina.jpg";
import tragosDeLaCasa from "@/assets/fotos/tragos-de-la-casa.jpg";

export const fotos = {
  barraCopasLuz,
  djSetLiving,
  espressoMartiniColonia,
  mesaCena,
  ostrasMarmol,
  patioTarde,
  platosCenital,
  platosOstrasPapas,
  rinconCuero,
  salonCortina,
  tragosDeLaCasa,
};

export type FotoId = keyof typeof fotos;
