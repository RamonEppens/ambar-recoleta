import Image from "next/image";
import { fotos, type FotoId } from "@/data/fotos";
import type { Dictionary } from "@/i18n/dictionaries";

type FotoProps = {
  id: FotoId;
  alts: Dictionary["fotos"];
  /** Qué ancho ocupa la foto en pantalla, para que el navegador baje el tamaño justo. */
  sizes: string;
  className?: string;
  /** Solo para la imagen principal de la página (la que mide el LCP). */
  preload?: boolean;
};

/**
 * Envoltorio de next/image: el texto alternativo sale del diccionario, así que
 * es obligatorio y está traducido. Si falta el alt de una foto, falla el typecheck.
 */
export function Foto({
  id,
  alts,
  sizes,
  className,
  preload = false,
}: FotoProps) {
  return (
    <Image
      src={fotos[id]}
      alt={alts[id]}
      sizes={sizes}
      className={className}
      placeholder="blur"
      preload={preload}
    />
  );
}
