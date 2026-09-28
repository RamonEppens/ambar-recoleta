import { describe, expect, it } from "vitest";
import { calcularAhora } from "./ahora";

/**
 * Buenos Aires es UTC−3 todo el año (sin horario de verano), así que una hora
 * local "martes 18:00" es "martes 21:00Z". Las fechas se escriben en UTC para que
 * los tests den igual en cualquier máquina, esté donde esté.
 * Semana de referencia: lunes 28/9/2026 … domingo 4/10/2026.
 */
const enBA = (isoLocal: string) => new Date(`${isoLocal}-03:00`);

describe("calcularAhora", () => {
  it("martes 18:00 → carta aperitiva", () => {
    expect(calcularAhora(enBA("2026-09-29T18:00"))).toMatchObject({
      estado: "aperitivo",
      dj: false,
    });
  });

  it("martes 20:00 en punto → ya es cena", () => {
    expect(calcularAhora(enBA("2026-09-29T20:00"))).toMatchObject({
      estado: "cena",
    });
  });

  it("martes 23:45 → cocina cerrada, barra hasta la 1", () => {
    expect(calcularAhora(enBA("2026-09-29T23:45"))).toEqual({
      estado: "barra",
      cierra: "01:00",
      dj: false,
    });
  });

  it("miércoles 00:30 → sigue la noche del martes", () => {
    expect(calcularAhora(enBA("2026-09-30T00:30"))).toMatchObject({
      estado: "barra",
    });
  });

  it("miércoles 01:00 en punto → cerrado, abre hoy a las 17", () => {
    expect(calcularAhora(enBA("2026-09-30T01:00"))).toEqual({
      estado: "cerrado",
      abre: "17:00",
      dia: 3,
      cuando: "hoy",
    });
  });

  it("viernes 23:10 → cena con DJ", () => {
    expect(calcularAhora(enBA("2026-10-02T23:10"))).toMatchObject({
      estado: "cena",
      dj: true,
    });
  });

  it("sábado 01:30 → barra y DJ de la noche del viernes", () => {
    expect(calcularAhora(enBA("2026-10-03T01:30"))).toEqual({
      estado: "barra",
      cierra: "02:00",
      dj: true,
    });
  });

  it("sábado 15:00 → abre temprano, carta aperitiva", () => {
    expect(calcularAhora(enBA("2026-10-03T15:00"))).toMatchObject({
      estado: "aperitivo",
    });
  });

  it("domingo 01:59 → último minuto de la noche del sábado", () => {
    expect(calcularAhora(enBA("2026-10-04T01:59"))).toMatchObject({
      estado: "barra",
      dj: true,
    });
  });

  it("domingo 02:00 → cerrado hasta el martes", () => {
    expect(calcularAhora(enBA("2026-10-04T02:00"))).toEqual({
      estado: "cerrado",
      abre: "17:00",
      dia: 2,
      cuando: "otro",
    });
  });

  it("lunes 20:00 → cerrado, abre mañana", () => {
    expect(calcularAhora(enBA("2026-09-28T20:00"))).toMatchObject({
      estado: "cerrado",
      cuando: "manana",
    });
  });

  it("usa la hora de Buenos Aires aunque el visitante esté en otra zona", () => {
    // 18:00 en Nueva York (UTC−4 en octubre) son las 19:00 en Buenos Aires.
    const desdeNuevaYork = new Date("2026-10-01T18:00-04:00");
    expect(calcularAhora(desdeNuevaYork)).toMatchObject({
      estado: "aperitivo",
    });
  });
});
