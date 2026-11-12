import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Miniaturas de los sets de Colonia Radio (YouTube). next/image solo optimiza dominios declarados.
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" },
    ],
  },
  // La página Música pasó a ser una sección de Visitanos: los links viejos siguen andando.
  async redirects() {
    return [
      {
        source: "/:lang(es|en)/musica",
        destination: "/:lang/espacio#musica",
        permanent: true,
      },
    ];
  },
  experimental: {
    // El layout raíz está dentro de [lang], así que la 404 global va en app/global-not-found.tsx.
    globalNotFound: true,
  },
};

export default nextConfig;
