import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BotonBorrar } from "@/components/admin/BotonBorrar";
import { FormExperiencia } from "@/components/admin/FormExperiencia";
import { experienciaAdmin } from "@/lib/admin";
import styles from "../../../admin.module.css";
import { opcionesFotos } from "../opciones";

export const metadata: Metadata = { title: "Editar experiencia" };

export default async function EditarExperienciaPage({
  params,
}: PageProps<"/admin/experiencias/[slug]">) {
  const { slug } = await params;
  const [e, fotos] = await Promise.all([
    experienciaAdmin(slug),
    opcionesFotos(),
  ]);
  if (!e) notFound();

  return (
    <main id="contenido" className={styles.main}>
      <h1 className={styles.titulo}>{e.nombre_es}</h1>
      <FormExperiencia
        fotos={fotos}
        slugOriginal={e.slug}
        inicial={{
          slug: e.slug,
          nombreEs: e.nombre_es,
          nombreEn: e.nombre_en,
          descripcionEs: e.descripcion_es,
          descripcionEn: e.descripcion_en,
          precio: e.precio,
          cupos: e.cupos,
          activa: e.activa,
          foto: e.foto,
          orden: e.orden,
        }}
      />
      <BotonBorrar
        url={`/api/v1/experiencias/${e.slug}`}
        volverA="/admin/experiencias"
        que="la experiencia"
      />
    </main>
  );
}
