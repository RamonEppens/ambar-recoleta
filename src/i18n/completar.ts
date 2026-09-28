/** Rellena una plantilla del diccionario: completar("abrimos a {hora}", { hora: "las 17" }). */
export function completar(plantilla: string, valores: Record<string, string>) {
  return plantilla.replace(
    /\{(\w+)\}/g,
    (_, clave: string) => valores[clave] ?? `{${clave}}`,
  );
}
