import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { erroresPorCampo, esquemaConsulta, hoyEnBuenosAires } from "./esquemas";

const valida = {
  nombre: "Caro",
  email: "caro@mail.com",
  telefono: "",
  fecha: "2026-12-12",
  personas: 40,
  tipo: "cumpleanos",
  mensaje: "",
};

const errores = (datos: unknown) => {
  const r = esquemaConsulta.safeParse(datos);
  return r.success ? {} : erroresPorCampo(r.error);
};

describe("hoyEnBuenosAires", () => {
  it("usa la fecha de Buenos Aires, no la UTC", () => {
    // 01:00 UTC del 6 de noviembre = 22:00 del 5 en Buenos Aires
    expect(hoyEnBuenosAires(new Date("2026-11-06T01:00:00Z"))).toBe(
      "2026-11-05",
    );
  });
});

describe("esquemaConsulta", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-05T15:00:00Z"));
  });
  afterEach(() => vi.useRealTimers());

  it("acepta una consulta completa", () => {
    expect(errores(valida)).toEqual({});
  });

  it("devuelve claves de error, para traducirlas en el formulario", () => {
    expect(
      errores({ ...valida, nombre: "C", email: "caro@", personas: 0 }),
    ).toEqual({
      nombre: "nombre_corto",
      email: "email_invalido",
      personas: "personas_invalidas",
    });
  });

  it("la fecha: hoy sí, ayer no, hasta un año adelante", () => {
    expect(errores({ ...valida, fecha: "2026-11-05" })).toEqual({});
    expect(errores({ ...valida, fecha: "2026-11-04" }).fecha).toBe(
      "fecha_pasada",
    );
    expect(errores({ ...valida, fecha: "2027-11-05" })).toEqual({});
    expect(errores({ ...valida, fecha: "2027-11-06" }).fecha).toBe(
      "fecha_lejana",
    );
    expect(errores({ ...valida, fecha: "12/12/2026" }).fecha).toBe(
      "fecha_invalida",
    );
  });

  it("más de 300 personas tiene su propio mensaje", () => {
    expect(errores({ ...valida, personas: 301 }).personas).toBe(
      "personas_maximo",
    );
  });

  it("el teléfono es opcional, pero si viene tiene que parecer un teléfono", () => {
    expect(errores({ ...valida, telefono: "+54 9 11 2335-6470" })).toEqual({});
    expect(errores({ ...valida, telefono: "llamame" }).telefono).toBe(
      "telefono_invalido",
    );
  });

  it("solo acepta los tipos de evento de la base", () => {
    expect(errores({ ...valida, tipo: "bautismo" }).tipo).toBe("tipo_invalido");
  });
});
