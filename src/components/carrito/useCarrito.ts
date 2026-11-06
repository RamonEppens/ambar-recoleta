"use client";

import { useSyncExternalStore } from "react";
import {
  carritoEnServidor,
  leerCarrito,
  suscribirCarrito,
} from "@/lib/carrito";

/** El carrito actual. En el servidor (y en el primer render) está vacío. */
export const useCarrito = () =>
  useSyncExternalStore(suscribirCarrito, leerCarrito, carritoEnServidor);
