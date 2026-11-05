"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { z } from "zod";
import { erroresPorCampo } from "@/lib/esquemas";

type Estado =
  | { tipo: "editando" }
  | { tipo: "enviando" }
  | { tipo: "error"; mensaje: string; codigo?: string };

type ErrorApi = {
  error?: {
    codigo: string;
    mensaje: string;
    detalles?: { campo: string; mensaje: string }[];
  };
};

/**
 * Estado y validación de un formulario controlado (E3). Lo usan el admin y
 * el formulario público de eventos.
 *
 * - Valida con el MISMO esquema de Zod que la API, en cada cambio.
 * - Un error se muestra cuando el campo perdió el foco o se intentó enviar:
 *   no se reta a nadie por un campo que todavía está escribiendo.
 * - Al enviar: fetch a la API con estados de carga y error. Si la API
 *   responde 400/409, sus errores se muestran en el campo correspondiente.
 */
export function useFormulario<Valores extends object, T extends z.ZodType>({
  esquema,
  inicial,
  aDatos,
  enviar,
  alGuardar,
  textos = {
    sinConexion: "Sin conexión. Revisá internet y probá de nuevo.",
    noGuardado: "No se pudo guardar.",
  },
}: {
  esquema: T;
  /** Lo que muestran los inputs (los números, como texto: así se ve lo que se escribió). */
  inicial: Valores;
  /** De los valores de los inputs a lo que valida el esquema (ej. "15000" → 15000). */
  aDatos: (valores: Valores) => unknown;
  enviar: (datos: z.output<T>) => Promise<Response>;
  alGuardar: (datos: z.output<T>) => void;
  /** Textos de los errores generales (el sitio público los pasa traducidos). */
  textos?: { sinConexion: string; noGuardado: string };
}) {
  const router = useRouter();
  const [valores, setValores] = useState<Valores>(inicial);
  const [tocados, setTocados] = useState<ReadonlySet<string>>(new Set());
  const [intentoEnviar, setIntentoEnviar] = useState(false);
  const [deLaApi, setDeLaApi] = useState<Record<string, string>>({});
  const [estado, setEstado] = useState<Estado>({ tipo: "editando" });

  const resultado = esquema.safeParse(aDatos(valores));
  const errores = resultado.success ? {} : erroresPorCampo(resultado.error);

  function error(campo: string) {
    const visible = intentoEnviar || tocados.has(campo);
    return (visible ? errores[campo] : undefined) ?? deLaApi[campo];
  }

  function cambiar<K extends keyof Valores & string>(
    campo: K,
    valor: Valores[K],
  ) {
    setValores((anteriores) => ({ ...anteriores, [campo]: valor }));
    // Si la API había rechazado este campo, el error se va al corregirlo.
    setDeLaApi((anteriores) => {
      const resto = { ...anteriores };
      delete resto[campo];
      return resto;
    });
  }

  const tocar = (campo: string) =>
    setTocados((anteriores) => new Set(anteriores).add(campo));

  async function alEnviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setIntentoEnviar(true);
    if (!resultado.success) {
      // El foco va al primer campo con error (en el orden del formulario),
      // así el teclado y el lector de pantalla llegan ahí.
      const campos = Array.from(evento.currentTarget.elements) as HTMLElement[];
      campos
        .find((campo) => campo.id.replace("campo-", "") in errores)
        ?.focus();
      return;
    }

    setEstado({ tipo: "enviando" });
    try {
      const respuesta = await enviar(resultado.data);
      if (respuesta.ok) {
        alGuardar(resultado.data);
        return;
      }
      if (respuesta.status === 401) {
        router.push("/admin/ingresar"); // la sesión venció
        return;
      }
      const { error: e } = (await respuesta.json()) as ErrorApi;
      setDeLaApi(
        Object.fromEntries(
          (e?.detalles ?? []).map((d) => [d.campo, d.mensaje]),
        ),
      );
      setEstado({
        tipo: "error",
        mensaje: e?.mensaje ?? textos.noGuardado,
        codigo: e?.codigo,
      });
    } catch {
      setEstado({ tipo: "error", mensaje: textos.sinConexion, codigo: "red" });
    }
  }

  return { valores, cambiar, tocar, error, estado, alEnviar };
}

/** fetch con JSON, para no repetir headers en cada formulario. */
export const pedirJson = (url: string, method: string, cuerpo?: unknown) =>
  fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
  });
