import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BotonBorrar } from "@/components/admin/BotonBorrar";
import { FormPlato } from "@/components/admin/FormPlato";
import { opcionesSecciones, platoAdmin } from "@/lib/admin";
import styles from "../../../admin.module.css";

export const metadata: Metadata = { title: "Editar plato" };

export default async function EditarPlatoPage({
  params,
}: PageProps<"/admin/platos/[slug]">) {
  const { slug } = await params;
  const [plato, secciones] = await Promise.all([
    platoAdmin(slug),
    opcionesSecciones(),
  ]);
  if (!plato) notFound();

  return (
    <main id="contenido" className={styles.main}>
      <h1 className={styles.titulo}>{plato.nombre}</h1>
      <FormPlato
        secciones={secciones}
        slugOriginal={plato.slug}
        inicial={{
          seccionId: plato.seccion_id,
          slug: plato.slug,
          nombre: plato.nombre,
          descripcionEs: plato.descripcion_es,
          descripcionEn: plato.descripcion_en,
          precio: plato.precio,
          activo: plato.activo,
          orden: plato.orden,
        }}
      />
      <BotonBorrar
        url={`/api/v1/platos/${plato.slug}`}
        volverA="/admin/platos"
        que="el plato"
      />
    </main>
  );
}
