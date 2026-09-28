import { describe, expect, it } from "vitest";
import { semana } from "../data/horarios";
import { agruparSemana } from "./semana";

describe("agruparSemana", () => {
  it("agrupa como su historia de horarios", () => {
    expect(agruparSemana(semana)).toEqual({
      tramos: [
        { desde: 2, hasta: 4, abre: "17:00", cierra: "01:00" },
        { desde: 5, hasta: 5, abre: "17:00", cierra: "02:00" },
        { desde: 6, hasta: 6, abre: "14:00", cierra: "02:00" },
      ],
      cerrados: [1, 0],
    });
  });
});
