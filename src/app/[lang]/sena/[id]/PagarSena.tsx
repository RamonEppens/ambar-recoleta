"use client";

import { useState } from "react";
import { pedirJson } from "@/components/formulario/useFormulario";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

/** Pide una URL de Checkout Pro para la seña y lleva a Mercado Pago. */
export function PagarSena({
  id,
  lang,
  t,
}: {
  id: string;
  lang: Locale;
  t: Dictionary["sena"];
}) {
  const [estado, setEstado] = useState<"listo" | "yendo" | "error">("listo");

  async function pagar() {
    setEstado("yendo");
    const respuesta = await pedirJson(`/api/v1/pedidos/${id}/pago`, "POST", {
      idioma: lang,
    }).catch(() => null);
    if (respuesta?.ok) {
      window.location.assign((await respuesta.json()).datos.url);
      return;
    }
    setEstado("error");
  }

  return (
    <>
      <button
        type="button"
        className="boton"
        onClick={pagar}
        disabled={estado === "yendo"}
      >
        {estado === "yendo" ? t.yendo : t.pagar}
      </button>
      {estado === "error" && <p role="alert">{t.error}</p>}
    </>
  );
}
