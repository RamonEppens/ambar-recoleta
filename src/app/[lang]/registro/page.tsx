import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { FormCuenta } from "@/components/cuenta/FormCuenta";
import styles from "@/components/cuenta/cuenta.module.css";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { obtenerSesion } from "@/lib/auth";
import { rutaSegura } from "@/lib/cuentas/seguro";

export const metadata: Metadata = { robots: { index: false } };

export default async function Pagina({
  params,
  searchParams,
}: PageProps<"/[lang]/registro">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const busqueda = await searchParams;
  const siguiente = rutaSegura(busqueda.siguiente, `/${lang}/cuenta`);
  // Si ya tiene sesión, no tiene sentido mostrar el formulario.
  const { usuario } = await obtenerSesion();
  if (usuario) redirect(siguiente);
  const { cuenta: t } = await getDictionary(lang);

  return (
    <main id="contenido" className={styles.pagina}>
      <h1 className={styles.titulo}>{t.registroTitulo}</h1>
      <p>{t.registroTexto}</p>
      <FormCuenta
        modo="registro"
        lang={lang}
        siguiente={siguiente}
        errorInicial={busqueda.error === "google" ? "google" : undefined}
        t={t}
      />
    </main>
  );
}
