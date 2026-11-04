import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Miniaturas de los sets de Colonia Radio (YouTube). next/image solo optimiza dominios declarados.
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" },
    ],
  },
  experimental: {
    // El layout raíz está dentro de [lang], así que la 404 global va en app/global-not-found.tsx.
    globalNotFound: true,
  },
};

export default nextConfig;
