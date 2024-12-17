import { defineConfig } from "vite";
import path from "path";
import solidPlugin from "vite-plugin-solid";
// https://vitejs.dev/config
export default defineConfig({
  plugins: [solidPlugin()],
  assetsInclude: ["src/assets/*"],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../src"),
    },
  },
});
