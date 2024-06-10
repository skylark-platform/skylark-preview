import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import manifest, { getBrowserFromEnv } from "./manifest.config";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), crx({ manifest, browser: getBrowserFromEnv() })],
  build: {
    outDir: `dist/${getBrowserFromEnv()}`,
  },
});
