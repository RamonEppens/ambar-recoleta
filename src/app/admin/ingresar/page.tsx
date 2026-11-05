import type { Metadata } from "next";
import { Isotipo } from "@/components/Isotipo";
import styles from "../admin.module.css";
import { FormIngreso } from "./FormIngreso";

export const metadata: Metadata = { title: "Ingresar" };

export default function IngresarPage() {
  return (
    <main id="contenido" className={styles.ingreso}>
      <Isotipo className={styles.isotipo} />
      <h1 className={styles.titulo}>Admin de Ámbar</h1>
      <FormIngreso />
    </main>
  );
}
