"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export type Sesion = { nombre: string; email: string; esAdmin: boolean } | null;

// Si varios componentes la piden a la vez (el menú y un formulario), se hace
// una sola consulta. Pasado un segundo se vuelve a preguntar.
let ultima: { promesa: Promise<Sesion>; cuando: number } | null = null;
function consultar() {
  if (!ultima || Date.now() - ultima.cuando > 1000) {
    ultima = {
      cuando: Date.now(),
      promesa: fetch("/api/v1/sesion", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : { datos: null }))
        .then((r) => r.datos as Sesion)
        .catch(() => null),
    };
  }
  return ultima.promesa;
}

/**
 * La sesión del cliente, pedida desde el navegador. `undefined` mientras carga.
 * Las páginas son estáticas (iguales para todos); lo personal se agrega después.
 * Se vuelve a pedir en cada cambio de página: así el menú se entera de que
 * alguien ingresó o salió (el menú no se vuelve a montar al navegar).
 */
export function useSesion() {
  const pathname = usePathname();
  const [sesion, setSesion] = useState<Sesion | undefined>(undefined);
  useEffect(() => {
    let vigente = true;
    consultar().then((s) => vigente && setSesion(s));
    return () => {
      vigente = false;
    };
  }, [pathname]);
  return sesion;
}
