import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  base: process.env.VITE_BASE_PATH || "/",

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@auth": path.resolve(__dirname, "./src/modules/auth"),
      "@settings": path.resolve(__dirname, "./src/modules/settings"),
      "@mis-dashboard": path.resolve(__dirname, "./src/modules/dashboard"),
    },
  },
});
