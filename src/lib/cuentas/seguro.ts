/**
 * A dónde volver después de ingresar (?siguiente=/es/carrito). Solo se aceptan
 * rutas internas: si no, un link malicioso podría mandar a la persona a otro
 * sitio después de loguearse ("open redirect").
 */
export function rutaSegura(siguiente: unknown, porDefecto: string) {
  return typeof siguiente === "string" &&
    /^\/(es|en)(\/[\w\-/]*)?(\?[\w=&%-]*)?$/.test(siguiente) &&
    !siguiente.startsWith("//")
    ? siguiente
    : porDefecto;
}
