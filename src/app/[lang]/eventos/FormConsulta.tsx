"use client";

import { useState } from "react";
import {
  Campo,
  aNumero,
  atributosDeCampo,
} from "@/components/formulario/Campo";
import {
  pedirJson,
  useFormulario,
} from "@/components/formulario/useFormulario";
import { linkWhatsApp } from "@/data/enlaces";
import { completar } from "@/i18n/completar";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import {
  TIPOS_EVENTO,
  esquemaConsulta,
  hoyEnBuenosAires,
  type DatosConsulta,
} from "@/lib/esquemas";
import styles from "./eventos.module.css";

type Props = { lang: Locale; t: Dictionary["eventos"] };

type Valores = Omit<DatosConsulta, "personas" | "tipo"> & {
  personas: string;
  tipo: string;
};

const VACIO: Valores = {
  nombre: "",
  email: "",
  telefono: "",
  fecha: "",
  personas: "",
  tipo: "",
  mensaje: "",
  sitio: "",
};

/**
 * Formulario controlado (E3): cada input refleja el estado de React, se valida
 * mientras se escribe con el mismo esquema que usa la API, y se envía con
 * fetch a POST /api/v1/consultas, con estados de carga, error y éxito.
 * La `key` permite empezar de cero después de enviar ("Hacer otra consulta").
 */
export function FormConsulta(props: Props) {
  const [vuelta, setVuelta] = useState(0);
  return (
    <Formulario key={vuelta} {...props} otraVez={() => setVuelta(vuelta + 1)} />
  );
}

function Formulario({ lang, t, otraVez }: Props & { otraVez: () => void }) {
  const [enviada, setEnviada] = useState<DatosConsulta | null>(null);
  const { valores, cambiar, tocar, error, estado, alEnviar } = useFormulario({
    esquema: esquemaConsulta,
    inicial: VACIO,
    aDatos: (v: Valores) => ({ ...v, personas: aNumero(v.personas) }),
    enviar: (datos) => pedirJson("/api/v1/consultas", "POST", datos),
    alGuardar: setEnviada,
    textos: { sinConexion: t.errores.red, noGuardado: t.errores.general },
  });

  // Los errores llegan como claves ("fecha_pasada"): se traducen acá.
  const traducir = (clave?: string) =>
    clave
      ? (t.errores[clave as keyof typeof t.errores] ?? t.errores.general)
      : undefined;
  const err = (campo: keyof Valores) => traducir(error(campo));
  const campo = (nombre: keyof Valores, ayuda?: string) => ({
    ...atributosDeCampo(nombre, err(nombre), ayuda),
    onBlur: () => tocar(nombre),
  });

  if (enviada) {
    const fecha = new Date(`${enviada.fecha}T12:00:00`).toLocaleDateString(
      lang === "es" ? "es-AR" : "en-US",
      { day: "numeric", month: "long" },
    );
    const resumen = completar(t.mensajeWhatsApp, {
      tipo: t.tipos[enviada.tipo].toLowerCase(),
      personas: String(enviada.personas),
      fecha,
      nombre: enviada.nombre,
    });
    return (
      // role="status": el lector de pantalla anuncia que se envió
      <div className={styles.exito} role="status">
        <h2 className={styles.exitoTitulo}>{t.exito.titulo}</h2>
        <p>{completar(t.exito.texto, { email: enviada.email })}</p>
        <a className="boton" href={linkWhatsApp(resumen)}>
          {t.exito.whatsapp}
        </a>
        <button type="button" className={styles.linkBoton} onClick={otraVez}>
          {t.exito.otra}
        </button>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={alEnviar} noValidate>
      <div className={styles.fila}>
        <Campo nombre="nombre" etiqueta={t.campos.nombre} error={err("nombre")}>
          <input
            {...campo("nombre")}
            value={valores.nombre}
            onChange={(e) => cambiar("nombre", e.target.value)}
            autoComplete="name"
          />
        </Campo>
        <Campo nombre="email" etiqueta={t.campos.email} error={err("email")}>
          <input
            {...campo("email")}
            type="email"
            value={valores.email}
            onChange={(e) => cambiar("email", e.target.value)}
            autoComplete="email"
          />
        </Campo>
      </div>

      <div className={styles.fila}>
        <Campo nombre="fecha" etiqueta={t.campos.fecha} error={err("fecha")}>
          <input
            {...campo("fecha")}
            type="date"
            min={hoyEnBuenosAires()}
            value={valores.fecha}
            onChange={(e) => cambiar("fecha", e.target.value)}
          />
        </Campo>
        <Campo
          nombre="personas"
          etiqueta={t.campos.personas}
          error={err("personas")}
          ayuda={t.ayudaPersonas}
        >
          <input
            {...campo("personas", t.ayudaPersonas)}
            inputMode="numeric"
            value={valores.personas}
            onChange={(e) => cambiar("personas", e.target.value)}
          />
        </Campo>
      </div>

      <div className={styles.fila}>
        <Campo nombre="tipo" etiqueta={t.campos.tipo} error={err("tipo")}>
          <select
            {...campo("tipo")}
            value={valores.tipo}
            onChange={(e) => cambiar("tipo", e.target.value)}
          >
            <option value="">{t.campos.elegir}</option>
            {TIPOS_EVENTO.map((tipo) => (
              <option key={tipo} value={tipo}>
                {t.tipos[tipo]}
              </option>
            ))}
          </select>
        </Campo>
        <Campo
          nombre="telefono"
          etiqueta={t.campos.telefono}
          error={err("telefono")}
        >
          <input
            {...campo("telefono")}
            type="tel"
            value={valores.telefono}
            onChange={(e) => cambiar("telefono", e.target.value)}
            autoComplete="tel"
          />
        </Campo>
      </div>

      <Campo
        nombre="mensaje"
        etiqueta={t.campos.mensaje}
        error={err("mensaje")}
        ayuda={t.ayudaMensaje}
      >
        <textarea
          {...campo("mensaje", t.ayudaMensaje)}
          value={valores.mensaje}
          onChange={(e) => cambiar("mensaje", e.target.value)}
        />
      </Campo>

      {/* Trampa para bots: invisible para personas (y fuera del orden de tabulación). */}
      <div className={styles.trampa} aria-hidden="true">
        <label htmlFor="campo-sitio">{t.campos.sitio}</label>
        <input
          id="campo-sitio"
          name="sitio"
          tabIndex={-1}
          autoComplete="off"
          value={valores.sitio}
          onChange={(e) => cambiar("sitio", e.target.value)}
        />
      </div>

      {estado.tipo === "error" && (
        <p role="alert" className={styles.errorGeneral}>
          {traducir(estado.codigo === "red" ? "red" : "general")}
        </p>
      )}

      <button
        type="submit"
        className="boton"
        disabled={estado.tipo === "enviando"}
      >
        {estado.tipo === "enviando" ? t.enviando : t.enviar}
      </button>
    </form>
  );
}
