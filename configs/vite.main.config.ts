import { defineConfig } from "vite";
import path from "path";
// https://vitejs.dev/config
export default defineConfig({
  resolve: {
    // For Node.js native modules
    alias: {
      "@": path.resolve(__dirname, "../src"),
    },
    conditions: ["node"], // this is the change
    mainFields: ["module", "jsnext:main", "jsnext"],
  },
  plugins: [
    {
      name: "restart",
      closeBundle() {
        process.stdin.emit("data", "rs");
      },
    },
  ],
});
