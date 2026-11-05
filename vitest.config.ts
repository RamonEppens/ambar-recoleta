import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // El mismo alias que tsconfig.json: "@/lib/datos" → src/lib/datos
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
});
