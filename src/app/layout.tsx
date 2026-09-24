import type { Metadata } from "next";
import "./globals.css";

const indexable = process.env.ALLOW_INDEXING === "true";

export const metadata: Metadata = {
  title: "Ámbar Recoleta",
  description: "Restaurante, bar y pista frente al Cementerio de la Recoleta.",
  robots: indexable ? undefined : { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
