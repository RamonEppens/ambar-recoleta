import { describe, expect, it } from "vitest";
import { horaEnFrase, rangoHorario } from "./hora";

describe("horaEnFrase", () => {
  it("usa 'la' solo para la 1", () => {
    expect(horaEnFrase("es", "01:00")).toBe("la 1");
    expect(horaEnFrase("es", "02:00")).toBe("las 2");
    expect(horaEnFrase("es", "23:30")).toBe("las 23:30");
  });

  it("en inglés usa am/pm", () => {
    expect(horaEnFrase("en", "17:00")).toBe("5 pm");
    expect(horaEnFrase("en", "01:00")).toBe("1 am");
    expect(horaEnFrase("en", "23:30")).toBe("11:30 pm");
  });
});

describe("rangoHorario", () => {
  it("imita el formato de su historia de horarios", () => {
    expect(rangoHorario("es", "17:00", "01:00")).toBe("17 a 01 hs");
    expect(rangoHorario("en", "14:00", "02:00")).toBe("2 pm – 2 am");
  });
});
