import "server-only";
import { createClient } from "@supabase/supabase-js";
import { clavesPublicas } from "./claves";

/**
 * Cliente con la clave SECRETA de Supabase: saltea RLS. Solo existe en el
 * servidor (`server-only` hace fallar el build si un Client Component lo
 * importa) y solo se usa después de validar todo con Zod, para lo que el
 * público no puede hacer directo: guardar una consulta, crear un pedido o
 * confirmar un pago desde el webhook.
 */
export function clienteServicio() {
  const { url } = clavesPublicas();
  const secreta = process.env.SUPABASE_SECRET_KEY;
  if (!secreta) {
    throw new Error("Falta SUPABASE_SECRET_KEY (ver README).");
  }
  return createClient(url, secreta, { auth: { persistSession: false } });
}
