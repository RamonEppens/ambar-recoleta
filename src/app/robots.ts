import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const indexable = process.env.ALLOW_INDEXING === "true";
  return {
    rules: {
      userAgent: "*",
      ...(indexable ? { allow: "/" } : { disallow: "/" }),
    },
  };
}
