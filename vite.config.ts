import { defineConfig } from "vite";
import path from "node:path";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  server: {
    host: true,
    port: 5173,
  },
  plugins: [
    tailwindcss(),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      workbox: {
        // Prerendered marketing routes must not be hijacked by the SPA
        // navigate fallback once the service worker is installed.
        navigateFallbackDenylist: [/^\/juego/, /^\/game/, /^\/como-jugar/, /^\/how-to-play/],
      },
      manifest: {
        name: "Al pasto — el juego de cartas extraoficial",
        short_name: "Al pasto",
        description:
          "Juego de cartas multijugador, sin base de datos, alojado entre pares. Mobile-first.",
        theme_color: "#000000",
        background_color: "#000000",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          {
            src: "/favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
});
