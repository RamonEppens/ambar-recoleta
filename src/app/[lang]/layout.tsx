import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { hasLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getSemana } from "@/lib/datos";
import "@/styles/globals.css";

const indexable = process.env.ALLOW_INDEXING === "true";

// Genera /es y /en en el build. Cualquier otro idioma (/fr) da 404 por el
// notFound() del layout. No se usa `dynamicParams = false`: en Next 16.3 hace
// que una página regenerada con revalidatePath (al editar desde el admin)
// pase a dar 404 para siempre. Se comprobó en local, ver bitácora.
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

// ISR (clase 07): las páginas se generan en el build y se regeneran como mucho
// cada hora. Además, el admin fuerza la regeneración al editar (revalidatePath).
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);

  return {
    title: { default: dict.meta.title, template: `%s · ${dict.meta.title}` },
    description: dict.meta.description,
    robots: indexable ? undefined : { index: false, follow: false },
  };
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, semana] = await Promise.all([getDictionary(lang), getSemana()]);

  return (
    <html lang={lang}>
      <body>
        <a className="skip-link" href="#contenido">
          {dict.a11y.skip}
        </a>
        <SiteHeader lang={lang} dict={dict} semana={semana} />
        {children}
        <SiteFooter lang={lang} dict={dict} semana={semana} />
      </body>
    </html>
  );
}
