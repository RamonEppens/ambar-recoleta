import type { Metadata } from "next";
import { FormExperiencia } from "@/components/admin/FormExperiencia";
import styles from "../../../admin.module.css";
import { opcionesFotos } from "../opciones";

export const metadata: Metadata = { title: "Nueva experiencia" };

export default async function NuevaExperienciaPage() {
  return (
    <main id="contenido" className={styles.main}>
      <h1 className={styles.titulo}>Nueva experiencia</h1>
      <FormExperiencia
        fotos={await opcionesFotos()}
        inicial={{
          slug: "",
          nombreEs: "",
          nombreEn: "",
          descripcionEs: "",
          descripcionEn: "",
          precio: 0,
          cupos: 0,
          activa: true,
          foto: null,
          orden: 0,
        }}
      />
    </main>
  );
}
