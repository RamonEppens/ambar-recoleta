import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Archivo } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { hasLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import "@/styles/globals.css";

/*
 * Tipografía provisoria: grotesca neutra como la de su carta, con itálica real
 * (la usan en las descripciones de los platos) y eje de ancho variable.
 * Se reemplaza cuando tengamos los archivos de marca.
 */
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  style: ["normal", "italic"],
  variable: "--font-sans",
  display: "swap",
});

const indexable = process.env.ALLOW_INDEXING === "true";

// Genera /es y /en en el build; cualquier otro idioma (/fr) da 404.
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}
export const dynamicParams = false;

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
  const dict = await getDictionary(lang);

  return (
    <html lang={lang} className={archivo.variable}>
      <body>
        <a className="skip-link" href="#contenido">
          {dict.a11y.skip}
        </a>
        <SiteHeader lang={lang} dict={dict} />
        {children}
      </body>
    </html>
  );
}
