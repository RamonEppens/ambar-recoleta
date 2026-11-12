import {
  conErrores,
  errorDeBase,
  leerJson,
  ok,
  validar,
} from "@/lib/api/respuestas";
import { esquemaConsulta } from "@/lib/esquemas";
import { usuarioActualId } from "@/lib/auth";
import { clienteServicio } from "@/lib/supabase/servicio";

/**
 * POST /api/v1/consultas — consulta por un evento privado (formulario público).
 * El navegador no puede escribir en la tabla (RLS no lo permite): pasa por acá,
 * se valida con Zod y recién entonces se guarda con la clave secreta.
 */
export const POST = conErrores(async (request: Request) => {
  const { sitio, ...datos } = validar(esquemaConsulta, await leerJson(request));

  // Un bot completó el campo trampa: le respondemos como si nada.
  if (sitio) return ok({ datos: { id: null } }, { status: 201 });

  const { data, error } = await clienteServicio()
    .from("consultas_eventos")
    .insert({
      nombre: datos.nombre,
      email: datos.email,
      telefono: datos.telefono || null,
      fecha: datos.fecha,
      personas: datos.personas,
      tipo: datos.tipo,
      mensaje: datos.mensaje || null,
      // Si tiene sesión, la consulta queda en su cuenta.
      usuario_id: await usuarioActualId(),
    })
    .select("id")
    .single();
  if (error) throw errorDeBase(error);
  return ok({ datos: data }, { status: 201 });
});
