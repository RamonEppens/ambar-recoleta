import type { Metadata } from "next";
import { FormPlato } from "@/components/admin/FormPlato";
import { opcionesSecciones } from "@/lib/admin";
import styles from "../../../admin.module.css";

export const metadata: Metadata = { title: "Nuevo plato" };

export default async function NuevoPlatoPage() {
  const secciones = await opcionesSecciones();
  return (
    <main id="contenido" className={styles.main}>
      <h1 className={styles.titulo}>Nuevo plato</h1>
      <FormPlato
        secciones={secciones}
        inicial={{
          seccionId: "",
          slug: "",
          nombre: "",
          descripcionEs: "",
          descripcionEn: "",
          precio: null,
          activo: true,
          orden: 0,
        }}
      />
    </main>
  );
}
