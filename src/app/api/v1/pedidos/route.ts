import {
  ErrorApi,
  conErrores,
  errorDeBase,
  leerJson,
  ok,
  validar,
} from "@/lib/api/respuestas";
import { cobrarPedido, urlSitio } from "@/lib/checkout";
import { esquemaPedido } from "@/lib/esquemas";
import { clienteServicio } from "@/lib/supabase/servicio";

/**
 * POST /api/v1/pedidos — el carrito pasa a pedido y se va a pagar.
 *   1. Zod valida qué y cuánto (sin precios).
 *   2. crear_pedido() arma el pedido con los precios y cupos de la base.
 *   3. Se crea la preferencia de Mercado Pago y se devuelve su URL.
 */
export const POST = conErrores(async (request: Request) => {
  const { nombre, email, items, idioma } = validar(
    esquemaPedido,
    await leerJson(request),
  );

  const { data: pedidoId, error } = await clienteServicio().rpc(
    "crear_pedido",
    { p_nombre: nombre, p_email: email, p_items: items },
  );
  if (error) {
    // Las funciones avisan con un código al principio del mensaje.
    const codigo = error.message.split(":")[0];
    if (codigo === "sin_cupos" || codigo === "experiencia_no_disponible")
      throw new ErrorApi(409, codigo, error.message);
    throw errorDeBase(error);
  }

  const url = await cobrarPedido(pedidoId as string, {
    sitio: urlSitio(request),
    idioma,
  });
  return ok({ datos: { id: pedidoId, url } }, { status: 201 });
});
