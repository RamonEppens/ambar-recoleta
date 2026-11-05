import Link from "next/link";
import { Isotipo } from "@/components/Isotipo";
import { exigirSesionPagina } from "@/lib/auth";
import { salir } from "../acciones";
import styles from "../admin.module.css";
import { NavAdmin } from "./NavAdmin";

/**
 * Todas las páginas del panel pasan por acá. El proxy ya mandó al ingreso a
 * quien no tiene sesión; acá se revisa el rol. Un usuario común ve un aviso
 * en vez del panel (y aunque viera el panel, RLS no lo dejaría leer ni escribir).
 */
export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  const { usuario, esAdmin } = await exigirSesionPagina();

  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <header className={styles.header}>
        <Link href="/admin" className={styles.marca}>
          <Isotipo className={styles.isotipoChico} />
          <span>Admin</span>
        </Link>
        {esAdmin && <NavAdmin />}
        <form action={salir} className={styles.sesion}>
          <span className={styles.email}>{usuario.email}</span>
          <button type="submit" className={styles.linkBoton}>
            Salir
          </button>
        </form>
      </header>
      {esAdmin ? (
        children
      ) : (
        <main id="contenido" className={styles.main}>
          <h1 className={styles.titulo}>Sin permiso</h1>
          <p>
            Tu usuario no es administrador. Si debería serlo, pedí que te
            asignen el rol <code>admin</code> en la tabla <code>perfiles</code>.
          </p>
        </main>
      )}
    </>
  );
}
