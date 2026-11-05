import type { Metadata } from "next";
import "@/styles/globals.css";

/*
 * Layout raíz del admin. Es otro layout raíz, aparte del de [lang]: el admin
 * no tiene idioma ni el header del sitio, y nunca se indexa.
 */
export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin Ámbar" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
