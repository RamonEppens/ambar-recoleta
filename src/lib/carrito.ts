/*
 * El carrito vive en el navegador (localStorage), como el carrito del MVP de
 * la clase 05: sobrevive a recargar la página y no necesita cuenta.
 * Guarda solo QUÉ y CUÁNTO; el precio lo pone el servidor al crear el pedido.
 *
 * Es un "store" externo a React: los componentes lo leen con
 * useSyncExternalStore, igual que el reloj del indicador "Ahora".
 */

export type ItemCarrito = { slug: string; cantidad: number };

const CLAVE = "ambar-carrito";
const MAXIMO = 10;
const VACIO: ItemCarrito[] = [];
const oyentes = new Set<() => void>();

let crudo: string | null = null;
let cache: ItemCarrito[] = VACIO;

function leerAlmacen(): string | null {
  try {
    return window.localStorage.getItem(CLAVE);
  } catch {
    return null; // modo privado o almacenamiento bloqueado: carrito vacío
  }
}

/** Snapshot estable: el mismo array mientras no cambie lo guardado (lo exige useSyncExternalStore). */
export function leerCarrito(): ItemCarrito[] {
  const actual = leerAlmacen();
  if (actual !== crudo) {
    crudo = actual;
    try {
      const datos = JSON.parse(actual ?? "[]");
      cache = Array.isArray(datos)
        ? datos.filter(
            (i): i is ItemCarrito =>
              typeof i?.slug === "string" &&
              Number.isInteger(i?.cantidad) &&
              i.cantidad > 0,
          )
        : VACIO;
    } catch {
      cache = VACIO;
    }
  }
  return cache;
}

export const carritoEnServidor = () => VACIO;

function guardar(items: ItemCarrito[]) {
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(items));
  } catch {
    // sin almacenamiento: el cambio se pierde al recargar, pero no rompe
  }
  oyentes.forEach((avisar) => avisar());
}

export function suscribirCarrito(avisar: () => void) {
  oyentes.add(avisar);
  // Otra pestaña cambió el carrito: también nos enteramos.
  const alCambiarOtraPestana = (e: StorageEvent) => {
    if (e.key === CLAVE) avisar();
  };
  window.addEventListener("storage", alCambiarOtraPestana);
  return () => {
    oyentes.delete(avisar);
    window.removeEventListener("storage", alCambiarOtraPestana);
  };
}

const limitar = (n: number) => Math.max(0, Math.min(MAXIMO, Math.trunc(n)));

/** Suma al carrito (sin pasar de 10 por experiencia). */
export function agregar(slug: string, cantidad: number) {
  const items = leerCarrito();
  const existente = items.find((i) => i.slug === slug);
  guardar(
    existente
      ? items.map((i) =>
          i.slug === slug
            ? { ...i, cantidad: limitar(i.cantidad + cantidad) }
            : i,
        )
      : [...items, { slug, cantidad: limitar(cantidad) }],
  );
}

/** Fija la cantidad; con 0, la quita. */
export function cambiarCantidad(slug: string, cantidad: number) {
  const n = limitar(cantidad);
  guardar(
    n === 0
      ? leerCarrito().filter((i) => i.slug !== slug)
      : leerCarrito().map((i) => (i.slug === slug ? { ...i, cantidad: n } : i)),
  );
}

export const quitar = (slug: string) => cambiarCantidad(slug, 0);
export const vaciar = () => guardar([]);
