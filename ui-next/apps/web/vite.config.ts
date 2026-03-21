import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const executorWorkers = path.resolve(__dirname, "../../packages/executor/src/workers");

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
  },
  resolve: {
    alias: {
      // Executor worker files are excluded from tsc build (they run in Web Workers).
      // Vite resolves `new URL("./workers/X.ts", import.meta.url)` relative to dist/,
      // but the .ts source files only exist in src/. This alias redirects Vite to the source.
      [path.resolve(__dirname, "../../packages/executor/dist/workers")]: executorWorkers,
    },
  },
  worker: {
    format: "es",
  },
});
